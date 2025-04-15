using System.Collections.Generic;

namespace LibraryApp.Models
{
    public class Genre
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        // Навигационное свойство
        public ICollection<Book> Books { get; set; } = new List<Book>();
    }
}