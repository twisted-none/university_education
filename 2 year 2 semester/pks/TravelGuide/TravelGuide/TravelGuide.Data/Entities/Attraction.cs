using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelGuide.Data.Entities
{
    public class Attraction
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; }
        
        [Required]
        public string Description { get; set; }
        
        public string ImagePath { get; set; }
        
        public string WorkingHours { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal? Price { get; set; }
        
        public int CityId { get; set; }
        
        public virtual City City { get; set; }
    }
}