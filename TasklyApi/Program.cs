using DotNetEnv;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using TasklyApi.Data;

var builder = WebApplication.CreateBuilder(args);

// ====== Carregar .env ======
try
{
    Env.Load();
    Console.WriteLine(".env file loaded successfully.");
}
catch (Exception ex)
{
    Console.WriteLine($".env file could not be loaded: {ex.Message}");
}

static string ResolveConfigValue(string? envValue, string? configValue, string fallback)
{
    if (!string.IsNullOrWhiteSpace(envValue))
    {
        return envValue;
    }

    if (!string.IsNullOrWhiteSpace(configValue))
    {
        return configValue;
    }

    return fallback;
}

// ====== URLs locais e Render ======
var isRender = Environment.GetEnvironmentVariable("RENDER") == "true";
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls(isRender ? $"http://0.0.0.0:{port}" : "http://localhost:5000");

// ====== Config / Env ======
var jwtKey = ResolveConfigValue(
    Environment.GetEnvironmentVariable("JWT_KEY"),
    builder.Configuration["JWT_KEY"],
    "supersecretkey");

var connStr = ResolveConfigValue(
    Environment.GetEnvironmentVariable("DB_CONNECTION_STRING"),
    builder.Configuration.GetConnectionString("DefaultConnection"),
    "Host=localhost;Database=taskly;Username=postgres;Password=postgres");

var corsOrigin = ResolveConfigValue(
    Environment.GetEnvironmentVariable("CORS_ORIGIN"),
    builder.Configuration["CORS_ORIGIN"],
    "http://localhost:5173");

// ====== Log das variaveis carregadas ======
Console.WriteLine("Environment Check:");
Console.WriteLine($"   JWT_KEY: {(string.IsNullOrWhiteSpace(jwtKey) ? "Missing" : "Loaded")}");
Console.WriteLine($"   DB_CONNECTION_STRING: {(string.IsNullOrWhiteSpace(connStr) ? "Missing" : "Loaded")}");
Console.WriteLine($"   CORS_ORIGIN: {(string.IsNullOrWhiteSpace(corsOrigin) ? "Missing" : corsOrigin)}");

// ====== Services ======
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseNpgsql(connStr));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ====== Swagger + JWT auth na UI ======
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v2", new OpenApiInfo
    {
        Title = "Taskly API v2 - Helpdesk System",
        Version = "v2",
        Description = "API do Taskly v2 com autenticacao JWT, Tickets, Comentarios e Dashboard."
    });

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Insira o token JWT no formato: Bearer {seu_token}",
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
        policy.WithOrigins(corsOrigin)
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

// ====== Migrations automaticas ======
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

// ====== Pipeline ======
app.UseCors("TasklyCors");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

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