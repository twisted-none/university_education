using System.Threading.Tasks;
using TravelGuide.Data.Entities;

namespace TravelGuide.Data.Repositories.Interfaces
{
    public interface IAttractionRepository
    {
        Task<Attraction> GetAttractionByIdAsync(int id);
    }
}