using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using System.Text;
using TasklyApi.Data;

// ✅ Corrige comportamento de timestamp em alguns ambientes
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// ====== Load .env (somente local) ======
try
{
    if (builder.Environment.IsDevelopment())
    {
        Env.Load();
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine(".env file loaded successfully ✅");
        Console.ResetColor();
    }
}
catch (Exception ex)
{
    Console.ForegroundColor = ConsoleColor.Yellow;
    Console.WriteLine($".env file could not be loaded: {ex.Message}");
    Console.ResetColor();
}

// ====== Helpers ======
static string ResolveConfigValue(string? envValue, string? configValue, string fallback)
{
    if (!string.IsNullOrWhiteSpace(envValue)) return envValue!;
    if (!string.IsNullOrWhiteSpace(configValue)) return configValue!;
    return fallback;
}

// ====== Detect Render / URLs ======
var isRender =
    !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("PORT")) ||
    string.Equals(Environment.GetEnvironmentVariable("RENDER"), "true", StringComparison.OrdinalIgnoreCase);

var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls(isRender ? $"http://0.0.0.0:{port}" : "http://localhost:5000");

// ====== Load critical vars ======
var jwtKey = ResolveConfigValue(
    Environment.GetEnvironmentVariable("JWT_KEY"),
    builder.Configuration["JWT_KEY"],
    "supersecretkey");

var connStr = ResolveConfigValue(
    Environment.GetEnvironmentVariable("DB_CONNECTION_STRING"),
    builder.Configuration.GetConnectionString("DefaultConnection"),
    "Host=localhost;Port=5432;Database=taskly;Username=postgres;Password=postgres;SSL Mode=Disable");

var corsOrigin = ResolveConfigValue(
    Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS"),
    builder.Configuration["CORS_ALLOWED_ORIGINS"],
    "http://localhost:5173");

// ====== Log active database host ======
Console.ForegroundColor = ConsoleColor.Blue;
try
{
    var connInfo = new NpgsqlConnectionStringBuilder(connStr);
    Console.WriteLine($"🔗 Active DB Host: {connInfo.Host}");
}
catch
{
    Console.WriteLine("🔗 Active DB Host: (could not parse connection string)");
}
Console.ResetColor();

// ====== Services ======
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(connStr, npgsql =>
    {
        // 💪 tolerância maior a latência (Supabase)
        npgsql.CommandTimeout(120);
        npgsql.EnableRetryOnFailure(
            maxRetryCount: 10,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorCodesToAdd: null
        );
    })
);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ====== Swagger + JWT ======
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v2", new OpenApiInfo
    {
        Title = "Taskly API v2 - Helpdesk System",
        Version = "v2",
        Description = "Taskly v2 API with JWT Authentication, Tickets, Comments, and Dashboard."
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT token in the format: Bearer {your_token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(securityScheme.Reference.Id, securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { { securityScheme, Array.Empty<string>() } });
});

// ====== CORS (múltiplas origins + Vercel previews) ======
builder.Services.AddCors(options =>
{
    options.AddPolicy("TasklyCors", policy =>
    {
        var allowed = corsOrigin.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        Console.ForegroundColor = ConsoleColor.Magenta;
        Console.WriteLine($"🌍 CORS origins loaded: {string.Join(", ", allowed)}");
        Console.ResetColor();

        policy
            .SetIsOriginAllowed(origin =>
            {
                if (string.IsNullOrWhiteSpace(origin)) return false;
                if (allowed.Contains(origin, StringComparer.OrdinalIgnoreCase)) return true;
                // Libera previews do Vercel (branch deploys)
                return origin.EndsWith(".vercel.app", StringComparison.OrdinalIgnoreCase);
            })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

// ====== JWT Auth ======
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<TasklyApi.Services.JwtService>();

var app = builder.Build();

// ====== Wait for database before migrating ======
void WaitForDatabase(string connectionString, int maxAttempts = 5, int delaySeconds = 5)
{
    for (int attempt = 1; attempt <= maxAttempts; attempt++)
    {
        try
        {
            Console.WriteLine($"🔄 Attempting to connect to database ({attempt}/{maxAttempts})...");
            using var conn = new NpgsqlConnection(connectionString);
            conn.Open();
            Console.ForegroundColor = ConsoleColor.Green;
            Console.WriteLine("✅ Database connection established successfully!");
            Console.ResetColor();
            return;
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Yellow;
            Console.WriteLine($"⚠️ Database connection failed: {ex.Message}");
            Console.ResetColor();
            if (attempt == maxAttempts)
            {
                Console.ForegroundColor = ConsoleColor.Red;
                Console.WriteLine("❌ Max retry attempts reached. Database is not reachable.");
                Console.ResetColor();
                throw;
            }
            Console.WriteLine($"⏳ Retrying in {delaySeconds} seconds...");
            Thread.Sleep(delaySeconds * 1000);
        }
    }
}

// ====== Automatic migrations ======
using (var scope = app.Services.CreateScope())
{
    WaitForDatabase(connStr);
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ====== Middleware ======
app.UseCors("TasklyCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ====== Swagger ======
if (app.Environment.IsDevelopment() || isRender ||
    string.Equals(Environment.GetEnvironmentVariable("ENABLE_SWAGGER"), "true", StringComparison.OrdinalIgnoreCase))
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v2/swagger.json", "Taskly API v2");
        c.RoutePrefix = "swagger";
    });
}

// ====== Run ======
app.Run();
