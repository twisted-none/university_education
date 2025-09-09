using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TouristGuide.Data;
using TouristGuide.Models;
using System.Linq;
using System.Threading.Tasks;

namespace TouristGuide.Controllers
{
    public class CitiesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public CitiesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Cities (Главная страница со списком городов и поиском)
        public async Task<IActionResult> Index(string searchString)
        {

            var citiesQuery = from c in _context.Cities
                              select c;

            if (!string.IsNullOrEmpty(searchString))
            {
                citiesQuery = citiesQuery.Where(c => c.Name.ToUpper().Contains(searchString.ToUpper()));
            }

            ViewData["CurrentFilter"] = searchString;

            var cities = await citiesQuery.OrderBy(c => c.Name).ToListAsync();
            return View(cities);
        }

        // GET: Cities/Details/5 (Страница с детальной информацией о городе)
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var city = await _context.Cities
                .Include(c => c.Attractions)
                .FirstOrDefaultAsync(m => m.Id == id);

            if (city == null)
            {
                return NotFound();
            }

            return View(city);
        }

    }
}