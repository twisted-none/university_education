using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema; // Для [ForeignKey]

namespace TouristGuide.Models
{
    public class Attraction
    {
        public int Id { get; set; } // Первичный ключ

        [Required(ErrorMessage = "Название достопримечательности обязательно")]
        [StringLength(150)]
        public string Name { get; set; }

        [Required(ErrorMessage = "Описание обязательно")]
        [DataType(DataType.MultilineText)]
        public string Description { get; set; } // Краткое описание для списков

        [DataType(DataType.MultilineText)]
        public string? History { get; set; } // Подробная история для страницы детализации

        [Display(Name = "Фото (URL/путь)")]
        [DataType(DataType.ImageUrl)]
        public string? ImageUrl { get; set; }

        [Display(Name = "Часы работы")]
        public string? OpeningHours { get; set; }

        [Display(Name = "Стоимость посещения")]
        [Column(TypeName = "decimal(18, 2)")] // Указываем тип в БД для денег
        public decimal? TicketPrice { get; set; } // Nullable, если бесплатно или цена не указана

        // Внешний ключ для связи с городом
        [Required]
        public int CityId { get; set; }

        // Навигационное свойство: достопримечательность принадлежит одному городу
        [ForeignKey("CityId")]
        public virtual City City { get; set; }
    }
}