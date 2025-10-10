using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using System.Text;
using TasklyApi.Data;

var builder = WebApplication.CreateBuilder(args);

// ====== Load .env (local environment only) ======
try
{
    if (builder.Environment.IsDevelopment())
    {
        Env.Load();
        Console.WriteLine(".env file loaded successfully.");
    }
}
catch (Exception ex)
{
    Console.WriteLine($".env file could not be loaded: {ex.Message}");
}

// ====== Config resolver ======
static string ResolveConfigValue(string? envValue, string? configValue, string fallback)
{
    if (!string.IsNullOrWhiteSpace(envValue))
        return envValue;
    if (!string.IsNullOrWhiteSpace(configValue))
        return configValue;
    return fallback;
}

// ====== Detect Render environment ======
var isRender = Environment.GetEnvironmentVariable("RENDER") == "true";
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls(isRender ? $"http://0.0.0.0:{port}" : "http://localhost:5000");

// ====== Load critical variables ======
var jwtKey = ResolveConfigValue(
    Environment.GetEnvironmentVariable("JWT_KEY"),
    builder.Configuration["JWT_KEY"],
    "supersecretkey");

var connStr = ResolveConfigValue(
    Environment.GetEnvironmentVariable("DB_CONNECTION_STRING"),
    builder.Configuration.GetConnectionString("DefaultConnection"),
    "Host=localhost;Database=taskly;Username=postgres;Password=postgres");

var corsOrigin = ResolveConfigValue(
    Environment.GetEnvironmentVariable("CORS_ALLOWED_ORIGINS"),
    builder.Configuration["CORS_ALLOWED_ORIGINS"],
    "http://localhost:5173");

// ====== Log configuration check ======
Console.WriteLine("Environment Check:");
Console.WriteLine($"   JWT_KEY: {(string.IsNullOrWhiteSpace(jwtKey) ? "Missing" : "Loaded")}");
Console.WriteLine($"   DB_CONNECTION_STRING: {(string.IsNullOrWhiteSpace(connStr) ? "Missing" : "Loaded")}");
Console.WriteLine($"   CORS_ALLOWED_ORIGINS: {(string.IsNullOrWhiteSpace(corsOrigin) ? "Missing" : corsOrigin)}");

// ====== Services ======
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(connStr, npgsqlOptions =>
        npgsqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorCodesToAdd: null
        )));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ====== Swagger + JWT Auth ======
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
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

// ====== CORS ======
builder.Services.AddCors(options =>
{
    options.AddPolicy("TasklyCors", policy =>
    {
        policy.WithOrigins(corsOrigin.Split(';', StringSplitOptions.RemoveEmptyEntries))
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
            Console.WriteLine("✅ Database connection established successfully!");
            return;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Database connection failed: {ex.Message}");
            if (attempt == maxAttempts)
            {
                Console.WriteLine("❌ Max retry attempts reached. Database is not reachable.");
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
    WaitForDatabase(connStr); // Wait until database is available
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ====== Middleware ======
app.UseCors("TasklyCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ====== Swagger ======
if (app.Environment.IsDevelopment() || isRender)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v2/swagger.json", "Taskly API v2");
        c.RoutePrefix = "swagger";
    });
}

app.Run();
