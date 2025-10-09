using TasklyApi.Models;

namespace TasklyApi.DTOs
{
    public class TicketDto
    {
        public string Title { get; set; } = default!;
        public string? Description { get; set; }
        public TicketPriority Priority { get; set; } = TicketPriority.Medium;
        public TicketStatus Status { get; set; } = TicketStatus.Open;
        public Guid? AssignedToId { get; set; }
    }
}
