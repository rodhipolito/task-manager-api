using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TasklyApi.Models;

namespace TasklyApi.Services
{
    public class JwtService
    {
        private readonly string _key;
        public JwtService(IConfiguration cfg)
        {
            _key = Environment.GetEnvironmentVariable("JWT_KEY")
                ?? cfg["JWT_KEY"] ?? "supersecretkey";
        }

        public string GenerateAccessToken(User user, int minutes = 60)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(minutes),
                signingCredentials: creds
            );
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public (string token, DateTime expiry) GenerateRefreshToken(int days = 7)
        {
            var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray());
            return (token, DateTime.UtcNow.AddDays(days));
        }
    }
}
