using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TasklyApi.Data;
using TasklyApi.DTOs;
using TasklyApi.Models;

namespace TasklyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TicketsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public TicketsController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/Tickets
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var list = await _db.Tickets
                .Include(t => t.CreatedBy)
                .Include(t => t.AssignedTo)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/Tickets/{id}
        [HttpGet("{id:guid}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var t = await _db.Tickets
                .Include(x => x.Comments).ThenInclude(c => c.User)
                .Include(x => x.CreatedBy)
                .Include(x => x.AssignedTo)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (t is null)
                return NotFound(new { message = "Ticket not found." });

            return Ok(t);
        }

        // POST: api/Tickets
        [HttpPost]
        public async Task<IActionResult> Create(TicketDto dto)
        {
            var userId = GetUserId();

            // ✅ valida AssignedToId (se informado)
            if (dto.AssignedToId != null)
            {
                var assignedUserExists = await _db.Users.AnyAsync(u => u.Id == dto.AssignedToId);
                if (!assignedUserExists)
                    return BadRequest(new { message = "Assigned user does not exist." });
            }

            var ticket = new Ticket
            {
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                Status = dto.Status,
                CreatedById = userId,
                AssignedToId = dto.AssignedToId ?? userId, // 👈 atribui ao criador se não for enviado
                CreatedAt = DateTime.UtcNow
            };

            _db.Tickets.Add(ticket);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { id = ticket.Id }, ticket);
        }

        // PUT: api/Tickets/{id}
        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, TicketDto dto)
        {
            var t = await _db.Tickets.FindAsync(id);
            if (t is null)
                return NotFound(new { message = "Ticket not found." });

            // Atualiza apenas campos permitidos
            t.Title = dto.Title;
            t.Description = dto.Description;
            t.Priority = dto.Priority;
            t.Status = dto.Status;

            if (dto.AssignedToId != null)
            {
                var assignedUserExists = await _db.Users.AnyAsync(u => u.Id == dto.AssignedToId);
                if (!assignedUserExists)
                    return BadRequest(new { message = "Assigned user does not exist." });
                t.AssignedToId = dto.AssignedToId;
            }

            t.UpdatedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            return Ok(t);
        }

        // DELETE: api/Tickets/{id}
        [HttpDelete("{id:guid}")]
        [Authorize(Roles = "Admin,Agent")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var t = await _db.Tickets.FindAsync(id);
            if (t is null)
                return NotFound(new { message = "Ticket not found." });

            _db.Tickets.Remove(t);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        // ---- Comments ----
        public record CommentDto(string Content);

        // POST: api/Tickets/{id}/comments
        [HttpPost("{id:guid}/comments")]
        public async Task<IActionResult> AddComment(Guid id, CommentDto dto)
        {
            var t = await _db.Tickets.FindAsync(id);
            if (t is null)
                return NotFound(new { message = "Ticket not found." });

            var c = new Comment
            {
                TicketId = id,
                UserId = GetUserId(),
                Content = dto.Content,
                CreatedAt = DateTime.UtcNow
            };

            _db.Comments.Add(c);
            await _db.SaveChangesAsync();
            return Ok(c);
        }

        // Utilitário para extrair o ID do usuário logado via JWT
        private Guid GetUserId()
        {
            var sub = User.Claims.First(c =>
                c.Type == ClaimTypes.NameIdentifier ||
                c.Type == "sub" ||
                c.Type.EndsWith("nameidentifier")
            ).Value;

            return Guid.Parse(sub);
        }
    }
}
