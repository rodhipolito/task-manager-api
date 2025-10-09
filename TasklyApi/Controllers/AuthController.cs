using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TasklyApi.Data;
using TasklyApi.DTOs;
using TasklyApi.Models;
using TasklyApi.Services;

namespace TasklyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtService _jwt;

        public AuthController(AppDbContext db, JwtService jwt)
        {
            _db = db; _jwt = jwt;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto dto)
        {
            var exists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
            if (exists) return BadRequest("Email já registrado.");

            var hash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            var user = new User { Email = dto.Email, PasswordHash = hash, Role = dto.Role };
            (user.RefreshToken, user.RefreshTokenExpiry) = _jwt.GenerateRefreshToken();

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var access = _jwt.GenerateAccessToken(user);
            return Ok(new { accessToken = access, refreshToken = user.RefreshToken, role = user.Role });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user is null) return Unauthorized("Credenciais inválidas.");

            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized("Credenciais inválidas.");

            var access = _jwt.GenerateAccessToken(user);
            (user.RefreshToken, user.RefreshTokenExpiry) = _jwt.GenerateRefreshToken();
            await _db.SaveChangesAsync();

            return Ok(new { accessToken = access, refreshToken = user.RefreshToken, role = user.Role });
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] string refreshToken)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u =>
                u.RefreshToken == refreshToken && u.RefreshTokenExpiry > DateTime.UtcNow);

            if (user is null) return Unauthorized("Refresh token inválido/expirado.");

            var access = _jwt.GenerateAccessToken(user);
            (user.RefreshToken, user.RefreshTokenExpiry) = _jwt.GenerateRefreshToken();
            await _db.SaveChangesAsync();

            return Ok(new { accessToken = access, refreshToken = user.RefreshToken, role = user.Role });
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> Me()
        {
            var idClaim = User.Claims.First(c => c.Type.EndsWith("nameidentifier") || c.Type == "sub").Value;
            var userId = Guid.Parse(idClaim);
            var user = await _db.Users.FindAsync(userId);
            return Ok(new { user!.Id, user.Email, user.Role, user.CreatedAt });
        }
    }
}
