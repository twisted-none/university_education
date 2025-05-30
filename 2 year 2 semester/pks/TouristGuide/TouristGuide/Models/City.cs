using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;

namespace TouristGuide.Models
{
    public class City
    {
        public int Id { get; set; } // Первичный ключ

        [Required(ErrorMessage = "Название города обязательно")]
        [StringLength(100)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Регион обязателен")]
        [StringLength(100)]
        public string Region { get; set; }

        public int Population { get; set; }

        [DataType(DataType.MultilineText)]
        public string? History { get; set; } // Nullable, если история не всегда есть

        [Display(Name = "Герб (URL/путь)")]
        [DataType(DataType.ImageUrl)] // Подсказка для рендеринга
        public string? CoatOfArmsImageUrl { get; set; }

        [Display(Name = "Фото города (URL/путь)")]
        [DataType(DataType.ImageUrl)]
        public string? ImageUrl { get; set; }

        // Навигационное свойство: у города много достопримечательностей
        public virtual ICollection<Attraction> Attractions { get; set; }

        public City()
        {
            // Инициализация коллекции, чтобы избежать NullReferenceException
            Attractions = new HashSet<Attraction>();
        }
    }
}