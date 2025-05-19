using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TravelGuide.Data.Entities;

namespace TravelGuide.Data.Configuration
{
    public class AttractionConfiguration : IEntityTypeConfiguration<Attraction>
    {
        public void Configure(EntityTypeBuilder<Attraction> builder)
        {
            builder.HasKey(a => a.Id);
            
            builder.Property(a => a.Name)
                   .IsRequired()
                   .HasMaxLength(200);
                   
            builder.Property(a => a.Description)
                   .IsRequired();
                   
            builder.Property(a => a.Price)
                   .HasColumnType("decimal(18,2)");
                   
            // Связь с городом
            builder.HasOne(a => a.City)
                   .WithMany(c => c.Attractions)
                   .HasForeignKey(a => a.CityId);
        }
    }
}
