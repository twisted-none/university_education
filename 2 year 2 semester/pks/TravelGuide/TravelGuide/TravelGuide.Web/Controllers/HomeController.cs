using Microsoft.AspNetCore.Mvc;

namespace TravelGuide.Web.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return RedirectToAction("Index", "Cities");
        }
        
        public IActionResult Error()
        {
            return View();
        }
    }
}
