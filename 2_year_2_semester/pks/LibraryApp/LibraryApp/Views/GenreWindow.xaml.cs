using System;
using System.Linq;
using System.Windows;
using LibraryApp.Data;
using LibraryApp.Models;

namespace LibraryApp.Views
{
    public partial class GenreWindow : Window
    {
        private readonly LibraryContext _context;
        private Genre _selectedGenre;

        public GenreWindow()
        {
            InitializeComponent();
            _context = new LibraryContext();
            LoadGenres();
        }

        private void LoadGenres()
        {
            try
            {
                GenresDataGrid.ItemsSource = _context.Genres.ToList();
                ClearGenreForm();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при загрузке жанров: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void ClearGenreForm()
        {
            GenreNameTextBox.Text = string.Empty;
            _selectedGenre = null;
        }

        private void SaveGenreButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(GenreNameTextBox.Text))
                {
                    MessageBox.Show("Введите название жанра", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                if (_selectedGenre == null)
                {
                    var newGenre = new Genre { Name = GenreNameTextBox.Text };
                    _context.Genres.Add(newGenre);
                }
                else
                {
                    _selectedGenre.Name = GenreNameTextBox.Text;
                    _context.Genres.Update(_selectedGenre);
                }

                _context.SaveChanges();
                LoadGenres();
                MessageBox.Show("Жанр сохранён", "Успех", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при сохранении жанра: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void DeleteGenreButton_Click(object sender, RoutedEventArgs e)
        {
            if (GenresDataGrid.SelectedItem is Genre selectedGenre)
            {
                try
                {

                    var result = MessageBox.Show("Вы уверены, что хотите удалить этот жанр? Все книги этого жанра также будут удалены.",
                                                "Подтверждение удаления",
                                                MessageBoxButton.YesNo,
                                                MessageBoxImage.Warning);

                    if (result == MessageBoxResult.Yes)
                    {
                        _context.Genres.Remove(selectedGenre);
                        _context.SaveChanges();
                        LoadGenres();
                        MessageBox.Show("Жанр и все книги этого жанра успешно удалены", "Успех", MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Ошибка при удалении жанра: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
            else
            {
                MessageBox.Show("Выберите жанр для удаления", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
            }
        }

        private void CancelGenreButton_Click(object sender, RoutedEventArgs e)
        {
            ClearGenreForm();
        }

        private void GenresDataGrid_SelectionChanged(object sender, System.Windows.Controls.SelectionChangedEventArgs e)
        {
            if (GenresDataGrid.SelectedItem is Genre selectedGenre)
            {
                _selectedGenre = selectedGenre;
                GenreNameTextBox.Text = selectedGenre.Name;
            }
        }
    }
}
