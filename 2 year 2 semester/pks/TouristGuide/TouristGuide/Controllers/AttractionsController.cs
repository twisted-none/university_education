﻿using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TouristGuide.Data;
using TouristGuide.Models;
using System.Threading.Tasks;

namespace TouristGuide.Controllers
{
    public class AttractionsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AttractionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: Attractions/Details/5 (Страница с детальной информацией о достопримечательности)
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            // Находим достопримечательность по ID, включая связанный город
            var attraction = await _context.Attractions
                .Include(a => a.City) // Загружаем связанный город
                .FirstOrDefaultAsync(m => m.Id == id);

            if (attraction == null)
            {
                return NotFound();
            }

            return View(attraction); // Передаем найденную достопримечательность в View
        }

        // Здесь можно добавить методы Create, Edit, Delete для достопримечательностей
    }
}