using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TravelGuide.Data.Entities;
using TravelGuide.Data.Repositories.Interfaces;

namespace TravelGuide.Data.Repositories
{
    public class AttractionRepository : IAttractionRepository
    {
        private readonly ApplicationDbContext _context;
        
        public AttractionRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<Attraction> GetAttractionByIdAsync(int id)
        {
            return await _context.Attractions
                .Include(a => a.City)
                .FirstOrDefaultAsync(a => a.Id == id);
        }
    }
}