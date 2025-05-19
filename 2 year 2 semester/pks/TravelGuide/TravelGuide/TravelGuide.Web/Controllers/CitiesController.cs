using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TravelGuide.Services.Interfaces;
using TravelGuide.Web.Models.CitiesViewModels;

namespace TravelGuide.Web.Controllers
{
    public class CitiesController : Controller
    {
        private readonly ICityService _cityService;
        
        public CitiesController(ICityService cityService)
        {
            _cityService = cityService;
        }
        
        // GET: Cities
        public async Task<IActionResult> Index(string searchString)
        {
            var cities = string.IsNullOrEmpty(searchString) 
                ? await _cityService.GetAllCitiesAsync() 
                : await _cityService.SearchCitiesByNameAsync(searchString);
                
            var viewModel = new CitiesListViewModel
            {
                Cities = cities,
                SearchString = searchString
            };
            
            return View(viewModel);
        }
        
        // GET: Cities/Details/5
        public async Task<IActionResult> Details(int id)
        {
            var city = await _cityService.GetCityByIdAsync(id);
            
            if (city == null)
            {
                return NotFound();
            }
            
            var viewModel = new CityDetailsViewModel
            {
                City = city
            };
            
            return View(viewModel);
        }
    }
}

