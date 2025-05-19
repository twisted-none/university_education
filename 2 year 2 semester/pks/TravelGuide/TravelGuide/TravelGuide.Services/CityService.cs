using System.Collections.Generic;
using System.Threading.Tasks;
using TravelGuide.Data.Entities;
using TravelGuide.Data.Repositories.Interfaces;
using TravelGuide.Services.Interfaces;

namespace TravelGuide.Services
{
    public class CityService : ICityService
    {
        private readonly ICityRepository _cityRepository;
        
        public CityService(ICityRepository cityRepository)
        {
            _cityRepository = cityRepository;
        }
        
        public async Task<IEnumerable<City>> GetAllCitiesAsync()
        {
            return await _cityRepository.GetAllCitiesAsync();
        }
        
        public async Task<City> GetCityByIdAsync(int id)
        {
            return await _cityRepository.GetCityByIdAsync(id);
        }
        
        public async Task<IEnumerable<City>> SearchCitiesByNameAsync(string name)
        {
            return await _cityRepository.SearchCitiesByNameAsync(name);
        }
    }
}
