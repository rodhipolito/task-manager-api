using System.ComponentModel.DataAnnotations;

namespace TasklyApi.Models
{
    public class Comment
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required]
        public Guid TicketId { get; set; }
        public Ticket? Ticket { get; set; }

        [Required]
        public Guid UserId { get; set; }
        public User? User { get; set; }

        [Required, MaxLength(2000)]
        public string Content { get; set; } = default!;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
