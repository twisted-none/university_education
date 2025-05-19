using System.Collections.Generic;
using System.Threading.Tasks;
using TravelGuide.Data.Entities;

namespace TravelGuide.Data.Repositories.Interfaces
{
    public interface ICityRepository
    {
        Task<IEnumerable<City>> GetAllCitiesAsync();
        Task<City> GetCityByIdAsync(int id);
        Task<IEnumerable<City>> SearchCitiesByNameAsync(string name);
    }
}