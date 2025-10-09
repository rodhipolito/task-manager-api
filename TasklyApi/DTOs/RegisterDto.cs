namespace TasklyApi.DTOs
{
    public class RegisterDto
    {
        public string Email { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string Role { get; set; } = "Client"; // Admin|Agent|Client
    }
}
