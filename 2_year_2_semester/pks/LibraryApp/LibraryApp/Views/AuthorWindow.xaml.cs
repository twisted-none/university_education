using System;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using LibraryApp.Data;
using LibraryApp.Models;

namespace LibraryApp.Views
{
    public partial class AuthorWindow : Window
    {
        private readonly LibraryContext _context;
        private Author _selectedAuthor;

        public AuthorWindow()
        {
            InitializeComponent();
            _context = new LibraryContext();
            LoadAuthors();
        }


        private void LoadAuthors()
        {
            try
            {
                var authors = _context.Authors.ToList();
                AuthorsDataGrid.ItemsSource = null; 
                AuthorsDataGrid.Items.Clear(); 
                AuthorsDataGrid.ItemsSource = authors; 
                ClearAuthorForm();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при загрузке авторов: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }
        private void ClearAuthorForm()
        {
            FirstNameTextBox.Text = string.Empty;
            LastNameTextBox.Text = string.Empty;
            BirthDatePicker.SelectedDate = DateTime.Today;
            CountryTextBox.Text = string.Empty;
            _selectedAuthor = null;
            SaveAuthorButton.Content = "Добавить автора";
        }

        private void SaveAuthorButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(FirstNameTextBox.Text))
                {
                    MessageBox.Show("Необходимо ввести имя автора", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                if (string.IsNullOrWhiteSpace(LastNameTextBox.Text))
                {
                    MessageBox.Show("Необходимо ввести фамилию автора", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                if (BirthDatePicker.SelectedDate == null)
                {
                    MessageBox.Show("Необходимо выбрать дату рождения", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                if (_selectedAuthor == null)
                {
                    var newAuthor = new Author
                    {
                        FirstName = FirstNameTextBox.Text,
                        LastName = LastNameTextBox.Text,
                        BirthDate = BirthDatePicker.SelectedDate.Value,
                        Country = CountryTextBox.Text ?? string.Empty
                    };

                    _context.Authors.Add(newAuthor);
                }
                else
                {
                    _selectedAuthor.FirstName = FirstNameTextBox.Text;
                    _selectedAuthor.LastName = LastNameTextBox.Text;
                    _selectedAuthor.BirthDate = BirthDatePicker.SelectedDate.Value;
                    _selectedAuthor.Country = CountryTextBox.Text ?? string.Empty;
                    _context.Authors.Update(_selectedAuthor);
                }

                _context.SaveChanges();
                LoadAuthors();
                MessageBox.Show("Автор успешно сохранен", "Успех", MessageBoxButton.OK, MessageBoxImage.Information);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при сохранении автора: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void CancelAuthorButton_Click(object sender, RoutedEventArgs e)
        {
            ClearAuthorForm();
        }

        private void AuthorsDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            if (AuthorsDataGrid.SelectedItem is Author selectedAuthor)
            {
                _selectedAuthor = selectedAuthor;
                FirstNameTextBox.Text = selectedAuthor.FirstName;
                LastNameTextBox.Text = selectedAuthor.LastName;
                BirthDatePicker.SelectedDate = selectedAuthor.BirthDate;
                CountryTextBox.Text = selectedAuthor.Country;
                SaveAuthorButton.Content = "Сохранить изменения";
            }
        }

        private void DeleteAuthorButton_Click(object sender, RoutedEventArgs e)
        {
            if (AuthorsDataGrid.SelectedItem is Author selectedAuthor)
            {
                try
                {
                    var result = MessageBox.Show("Вы уверены, что хотите удалить этого автора? Все связанные книги также будут удалены.",
                                                "Подтверждение удаления",
                                                MessageBoxButton.YesNo,
                                                MessageBoxImage.Warning);

                    if (result == MessageBoxResult.Yes)
                    {
                        _context.Authors.Remove(selectedAuthor);
                        _context.SaveChanges();
                        LoadAuthors();
                        MessageBox.Show("Автор и все его книги успешно удалены", "Успех", MessageBoxButton.OK, MessageBoxImage.Information);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Ошибка при удалении автора: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
                }
            }
        }
    }
}
