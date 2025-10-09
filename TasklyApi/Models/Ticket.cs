using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TasklyApi.Models
{
    public enum TicketStatus { Open, InProgress, Resolved, Closed }
    public enum TicketPriority { Low, Medium, High }

    public class Ticket
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [Required, MaxLength(160)]
        public string Title { get; set; } = default!;

        [MaxLength(4000)]
        public string? Description { get; set; }

        public TicketStatus Status { get; set; } = TicketStatus.Open;
        public TicketPriority Priority { get; set; } = TicketPriority.Medium;

        public Guid CreatedById { get; set; }
        public User? CreatedBy { get; set; }

        public Guid? AssignedToId { get; set; }
        public User? AssignedTo { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public List<Comment> Comments { get; set; } = new();
    }
}
