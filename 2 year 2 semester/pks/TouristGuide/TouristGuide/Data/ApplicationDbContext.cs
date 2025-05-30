using Microsoft.EntityFrameworkCore;
using TouristGuide.Models; // Убедитесь, что пространство имен моделей указано верно

namespace TouristGuide.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // DbSet представляет таблицы в базе данных
        public DbSet<City> Cities { get; set; }
        public DbSet<Attraction> Attractions { get; set; }

        // Можно использовать Fluent API для дополнительной конфигурации (не обязательно здесь)
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Пример настройки: Уникальное имя города (если нужно)
            // modelBuilder.Entity<City>()
            //     .HasIndex(c => c.Name)
            //     .IsUnique();

            // Настройка связи 
            modelBuilder.Entity<Attraction>()
                .HasOne(a => a.City)         // У достопримечательности есть один город
                .WithMany(c => c.Attractions) // У города много достопримечательностей
                .HasForeignKey(a => a.CityId) // Через внешний ключ CityId
                .OnDelete(DeleteBehavior.Cascade); // При удалении города удалять связанные достопримечательности (или Restrict)
        }
    }
}