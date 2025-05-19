using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TravelGuide.Services.Interfaces;
using TravelGuide.Web.Models.AttractionsViewModels;

namespace TravelGuide.Web.Controllers
{
    public class AttractionsController : Controller
    {
        private readonly IAttractionService _attractionService;
        
        public AttractionsController(IAttractionService attractionService)
        {
            _attractionService = attractionService;
        }
        
        // GET: Attractions/Details/5
        public async Task<IActionResult> Details(int id)
        {
            var attraction = await _attractionService.GetAttractionByIdAsync(id);
            
            if (attraction == null)
            {
                return NotFound();
            }
            
            var viewModel = new AttractionDetailsViewModel
            {
                Attraction = attraction
            };
            
            return View(viewModel);
        }
    }
}
