using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelGuide.Data.Entities;

namespace TravelGuide.Data.Configuration
{
    public class CityConfiguration : IEntityTypeConfiguration<City>
    {
        public void Configure(EntityTypeBuilder<City> builder)
        {
            builder.HasKey(c => c.Id);
            
            builder.Property(c => c.Name)
                   .IsRequired()
                   .HasMaxLength(100);
                   
            builder.Property(c => c.Region)
                   .IsRequired()
                   .HasMaxLength(100);
                   
            builder.Property(c => c.Population)
                   .IsRequired();
                   
            builder.Property(c => c.Description)
                   .IsRequired();
                   
            // Индекс для быстрого поиска по названию города
            builder.HasIndex(c => c.Name);
                   
            // Связь один-ко-многим с достопримечательностями
            builder.HasMany(c => c.Attractions)
                   .WithOne(a => a.City)
                   .HasForeignKey(a => a.CityId)
                   .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
