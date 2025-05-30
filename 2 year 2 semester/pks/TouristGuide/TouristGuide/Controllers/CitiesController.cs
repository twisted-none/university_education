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
            // Запрос к городам
            var citiesQuery = from c in _context.Cities
                              select c;

            // Фильтрация по поисковой строке
            if (!string.IsNullOrEmpty(searchString))
            {
                // Регистронезависимый поиск по названию
                citiesQuery = citiesQuery.Where(c => c.Name.ToUpper().Contains(searchString.ToUpper()));
            }

            // Сохраняем строку поиска для отображения в View
            ViewData["CurrentFilter"] = searchString;

            // Выполняем запрос асинхронно и передаем результат в View
            var cities = await citiesQuery.OrderBy(c => c.Name).ToListAsync();
            return View(cities);
        }

        // GET: Cities/Details/5 (Страница с детальной информацией о городе)
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound(); // Ошибка 404, если ID не передан
            }

            // Находим город по ID, включая связанные достопримечательности
            var city = await _context.Cities
                .Include(c => c.Attractions) // Загружаем связанные достопримечательности
                .FirstOrDefaultAsync(m => m.Id == id);

            if (city == null)
            {
                return NotFound(); // Ошибка 404, если город не найден
            }

            return View(city); // Передаем найденный город в View
        }

        // Здесь можно добавить методы Create, Edit, Delete, если нужна админка
    }
}