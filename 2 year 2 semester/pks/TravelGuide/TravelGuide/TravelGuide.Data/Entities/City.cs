using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TravelGuide.Data.Entities
{
    public class City
    {
        public int Id { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Name { get; set; }
        
        [Required]
        [MaxLength(100)]
        public string Region { get; set; }
        
        [Required]
        public int Population { get; set; }
        
        [Required]
        public string Description { get; set; }
        
        public string CoatOfArms { get; set; }
        
        public string ImagePath { get; set; }
        
        public virtual ICollection<Attraction> Attractions { get; set; } = new List<Attraction>();
    }
}
