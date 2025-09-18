using TouristGuide.Models;
using System;
using System.Linq;

namespace TouristGuide.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context)
        {
            // Проверяем, есть ли уже города в БД
            if (context.Cities.Any())
            {
                return;   // БД уже заполнена
            }

            var cities = new City[]
            {
                new City{Name="Москва", Region="Центральный ФО", Population=13104177, History="Основана в 1147 году...", ImageUrl="/images/cities/moscow.jpg", CoatOfArmsImageUrl="/images/cities/moscow_coa.png"},
                new City{Name="Санкт-Петербург", Region="Северо-Западный ФО", Population=5597763, History="Основан в 1703 году...", ImageUrl="/images/cities/spb.jpg", CoatOfArmsImageUrl="/images/cities/spb_coa.png"},
                new City{Name="Казань", Region="Приволжский ФО", Population=1318604, History="Основана в 1005 году...", ImageUrl="/images/cities/kazan.jpg"}
            };

            foreach (City c in cities)
            {
                context.Cities.Add(c);
            }
            context.SaveChanges(); // Сохраняем города, чтобы получить их ID

            var attractions = new Attraction[]
            {
                new Attraction{Name="Кремль", Description="Древнейшая часть Москвы", History="...", ImageUrl="/images/attractions/kremlin.jpg", OpeningHours="10:00-18:00", TicketPrice=700, CityId=cities.Single(c => c.Name == "Москва").Id},
                new Attraction{Name="Красная площадь", Description="Главная площадь Москвы", History="...", ImageUrl="/images/attractions/red_square.jpg", OpeningHours="Круглосуточно", TicketPrice=0, CityId=cities.Single(c => c.Name == "Москва").Id},
                new Attraction{Name="Эрмитаж", Description="Один из крупнейших музеев мира", History="...", ImageUrl="/images/attractions/hermitage.jpg", OpeningHours="11:00-18:00", TicketPrice=500, CityId=cities.Single(c => c.Name == "Санкт-Петербург").Id},
                new Attraction{Name="Казанский кремль", Description="Историческая крепость в Казани", History="...", ImageUrl="/images/attractions/kazan_kremlin.jpg", TicketPrice=100, CityId=cities.Single(c => c.Name == "Казань").Id},
            };

            foreach (Attraction a in attractions)
            {
                context.Attractions.Add(a);
            }
            context.SaveChanges();
        }
    }
}