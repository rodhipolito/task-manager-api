using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TasklyApi.Data;
using TasklyApi.Models;

namespace TasklyApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _db;
        public DashboardController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet("kpis")]
        public async Task<IActionResult> Kpis()
        {
            try
            {
                // KPIs principais
                var total    = await _db.Tickets.CountAsync();
                var open     = await _db.Tickets.CountAsync(t => t.Status == TicketStatus.Open);
                var inprog   = await _db.Tickets.CountAsync(t => t.Status == TicketStatus.InProgress);
                var resolved = await _db.Tickets.CountAsync(t => t.Status == TicketStatus.Resolved);
                var closed   = await _db.Tickets.CountAsync(t => t.Status == TicketStatus.Closed);

                // Tickets por prioridade (enum -> padroniza para Low/Medium/High)
                var byPriorityRaw = await _db.Tickets
                    .GroupBy(t => t.Priority)
                    .Select(g => new { priority = g.Key, count = g.Count() })
                    .ToListAsync();

                var allPriorities = new[] { "Low", "Medium", "High" };
                var byPriority = allPriorities
                    .Select(p => new
                    {
                        priority = p,
                        count = byPriorityRaw.FirstOrDefault(x => x.priority.ToString() == p)?.count ?? 0
                    })
                    .ToList();

                // Tickets por usuário (CreatedBy.Email), traduzível por EF
                var byUser = await _db.Tickets
                    .Include(t => t.CreatedBy)
                    .Where(t => t.CreatedBy != null)
                    .GroupBy(t => t.CreatedBy!.Email)
                    .Select(g => new
                    {
                        user = g.Key ?? "Unknown",
                        count = g.Count()
                    })
                    .OrderByDescending(x => x.count)
                    .ToListAsync();

                return Ok(new
                {
                    total,
                    status = new { open, inProgress = inprog, resolved, closed },
                    byPriority,
                    byUser
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Dashboard error: {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
