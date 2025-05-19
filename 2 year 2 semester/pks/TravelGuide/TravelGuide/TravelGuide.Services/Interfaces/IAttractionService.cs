using System.Threading.Tasks;
using TravelGuide.Data.Entities;

namespace TravelGuide.Services.Interfaces
{
    public interface IAttractionService
    {
        Task<Attraction> GetAttractionByIdAsync(int id);
    }
}
