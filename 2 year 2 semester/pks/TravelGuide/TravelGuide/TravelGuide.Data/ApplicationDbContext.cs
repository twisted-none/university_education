using Microsoft.EntityFrameworkCore;
using TravelGuide.Data.Entities;
using TravelGuide.Data.Configuration;

namespace TravelGuide.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }
        
        public DbSet<City> Cities { get; set; }
        public DbSet<Attraction> Attractions { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Применение конфигураций
            modelBuilder.ApplyConfiguration(new CityConfiguration());
            modelBuilder.ApplyConfiguration(new AttractionConfiguration());
            
            // Добавление тестовых данных
            SeedData(modelBuilder);
        }
        
        private void SeedData(ModelBuilder modelBuilder)
        {
            // Добавление тестовых городов
            modelBuilder.Entity<City>().HasData(
                new City 
                { 
                    Id = 1, 
                    Name = "Москва", 
                    Region = "Центральный федеральный округ", 
                    Population = 12635466, 
                    Description = "Москва — столица России, город федерального значения, крупнейший по численности населения город России.",
                    CoatOfArms = "/images/cities/moscow_coat.jpg",
                    ImagePath = "/images/cities/moscow.jpg"
                },
                new City 
                { 
                    Id = 2, 
                    Name = "Санкт-Петербург", 
                    Region = "Северо-Западный федеральный округ", 
                    Population = 5384342, 
                    Description = "Санкт-Петербург — второй по численности населения город России. Город федерального значения. Административный центр Северо-Западного федерального округа и Ленинградской области.",
                    CoatOfArms = "/images/cities/spb_coat.jpg",
                    ImagePath = "/images/cities/spb.jpg"
                },
                new City 
                { 
                    Id = 3, 
                    Name = "Казань", 
                    Region = "Приволжский федеральный округ", 
                    Population = 1257391, 
                    Description = "Казань — город в России, столица Республики Татарстан, крупный порт на левом берегу реки Волги при впадении в неё реки Казанки.",
                    CoatOfArms = "/images/cities/kazan_coat.jpg",
                    ImagePath = "/images/cities/kazan.jpg"
                }
            );
            
            // Добавление тестовых достопримечательностей
            modelBuilder.Entity<Attraction>().HasData(
                new Attraction
                {
                    Id = 1,
                    Name = "Кремль",
                    Description = "Московский Кремль — крепость в центре Москвы и древнейшая её часть, главный общественно-политический и историко-художественный комплекс города, официальная резиденция Президента Российской Федерации.",
                    WorkingHours = "10:00 - 17:00",
                    Price = 700,
                    ImagePath = "/images/attractions/kremlin.jpg",
                    CityId = 1
                },
                new Attraction
                {
                    Id = 2,
                    Name = "Красная площадь",
                    Description = "Красная площадь — главная площадь Москвы, расположенная в центре города между Московским Кремлём и Китай-городом.",
                    WorkingHours = "Круглосуточно",
                    Price = null,
                    ImagePath = "/images/attractions/red_square.jpg",
                    CityId = 1
                },
                new Attraction
                {
                    Id = 3,
                    Name = "Эрмитаж",
                    Description = "Государственный Эрмитаж — музей изобразительного и декоративно-прикладного искусства, расположенный в городе Санкт-Петербурге Российской Федерации.",
                    WorkingHours = "10:30 - 18:00, выходной - понедельник",
                    Price = 500,
                    ImagePath = "/images/attractions/hermitage.jpg",
                    CityId = 2
                },
                new Attraction
                {
                    Id = 4,
                    Name = "Петропавловская крепость",
                    Description = "Петропавловская крепость — крепость в Санкт-Петербурге, историческое ядро города. Расположена на Заячьем острове, в северной части современного Санкт-Петербурга.",
                    WorkingHours = "10:00 - 20:00",
                    Price = 450,
                    ImagePath = "/images/attractions/peter_paul.jpg",
                    CityId = 2
                },
                new Attraction
                {
                    Id = 5,
                    Name = "Казанский Кремль",
                    Description = "Казанский кремль — древнейшая часть Казани, комплекс архитектурных, исторических и археологических памятников, раскрывающих многовековую историю города.",
                    WorkingHours = "08:00 - 20:00",
                    Price = 400,
                    ImagePath = "/images/attractions/kazan_kremlin.jpg",
                    CityId = 3
                },
                new Attraction
                {
                    Id = 6,
                    Name = "Храм всех религий",
                    Description = "Вселенский храм, или Храм всех религий — архитектурное сооружение в посёлке Старое Аракчино в Казани, посвящённое разным религиям мира.",
                    WorkingHours = "10:00 - 17:00",
                    Price = 300,
                    ImagePath = "/images/attractions/temple_all_religions.jpg",
                    CityId = 3
                }
            );
        }
    }
}