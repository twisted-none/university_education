using System.Threading.Tasks;
using TravelGuide.Data.Entities;
using TravelGuide.Data.Repositories.Interfaces;
using TravelGuide.Services.Interfaces;

namespace TravelGuide.Services
{
    public class AttractionService : IAttractionService
    {
        private readonly IAttractionRepository _attractionRepository;
        
        public AttractionService(IAttractionRepository attractionRepository)
        {
            _attractionRepository = attractionRepository;
        }
        
        public async Task<Attraction> GetAttractionByIdAsync(int id)
        {
            return await _attractionRepository.GetAttractionByIdAsync(id);
        }
    }
}
