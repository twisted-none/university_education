using System.Collections.Generic;
using System.Threading.Tasks;
using TravelGuide.Data.Entities;

namespace TravelGuide.Services.Interfaces
{
    public interface ICityService
    {
        Task<IEnumerable<City>> GetAllCitiesAsync();
        Task<City> GetCityByIdAsync(int id);
        Task<IEnumerable<City>> SearchCitiesByNameAsync(string name);
    }
}