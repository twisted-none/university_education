using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TravelGuide.Data.Entities;
using TravelGuide.Data.Repositories.Interfaces;

namespace TravelGuide.Data.Repositories
{
    public class CityRepository : ICityRepository
    {
        private readonly ApplicationDbContext _context;
        
        public CityRepository(ApplicationDbContext context)
        {
            _context = context;
        }
        
        public async Task<IEnumerable<City>> GetAllCitiesAsync()
        {
            return await _context.Cities
                .AsNoTracking()
                .ToListAsync();
        }
        
        public async Task<City> GetCityByIdAsync(int id)
        {
            return await _context.Cities
                .Include(c => c.Attractions)
                .FirstOrDefaultAsync(c => c.Id == id);
        }
        
        public async Task<IEnumerable<City>> SearchCitiesByNameAsync(string name)
        {
            if (string.IsNullOrEmpty(name))
                return await GetAllCitiesAsync();
                
            return await _context.Cities
                .AsNoTracking()
                .Where(c => c.Name.Contains(name))
                .ToListAsync();
        }
    }
}