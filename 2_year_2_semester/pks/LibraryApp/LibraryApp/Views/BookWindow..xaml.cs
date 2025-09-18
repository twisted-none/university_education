using System;
using System.Linq;
using System.Windows;
using Microsoft.EntityFrameworkCore;
using LibraryApp.Data;
using LibraryApp.Models;

namespace LibraryApp.Views
{
    public partial class BookWindow : Window
    {
        private readonly LibraryContext _context;
        private readonly int _bookId;
        private Book _book;

        // Конструктор для создания новой книги
        public BookWindow()
        {
            InitializeComponent();
            _context = new LibraryContext();
            _bookId = 0;
            _book = new Book();

            LoadAuthorsAndGenres();
            Title = "Добавление новой книги";
        }

        // Конструктор для редактирования существующей книги
        public BookWindow(int bookId)
        {
            InitializeComponent();
            _context = new LibraryContext();
            _bookId = bookId;

            LoadAuthorsAndGenres();
            LoadBook();
            Title = "Редактирование книги";
        }

        private void LoadAuthorsAndGenres()
        {
            try
            {
                AuthorComboBox.ItemsSource = _context.Authors.ToList();
                GenreComboBox.ItemsSource = _context.Genres.ToList();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при загрузке справочников: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void LoadBook()
        {
            try
            {
                _book = _context.Books
                    .Include(b => b.Author)
                    .Include(b => b.Genre)
                    .FirstOrDefault(b => b.Id == _bookId);

                if (_book != null)
                {
                    TitleTextBox.Text = _book.Title;
                    PublishYearTextBox.Text = _book.PublishYear.ToString();
                    ISBNTextBox.Text = _book.ISBN;
                    QuantityTextBox.Text = _book.QuantityInStock.ToString();

                    AuthorComboBox.SelectedValue = _book.AuthorId;
                    GenreComboBox.SelectedValue = _book.GenreId;
                }
                else
                {
                    MessageBox.Show("Книга не найдена", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
                    Close();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при загрузке книги: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
                Close();
            }
        }

        private void SaveButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                // Валидация полей
                if (string.IsNullOrWhiteSpace(TitleTextBox.Text))
                {
                    MessageBox.Show("Необходимо указать название книги", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                if (AuthorComboBox.SelectedItem == null)
                {
                    MessageBox.Show("Необходимо выбрать автора", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                if (GenreComboBox.SelectedItem == null)
                {
                    MessageBox.Show("Необходимо выбрать жанр", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                if (!int.TryParse(PublishYearTextBox.Text, out int publishYear))
                {
                    MessageBox.Show("Некорректный формат года издания", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                if (!int.TryParse(QuantityTextBox.Text, out int quantity) || quantity < 0)
                {
                    MessageBox.Show("Некорректное количество экземпляров", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Warning);
                    return;
                }

                // Заполнение объекта книги
                _book.Title = TitleTextBox.Text.Trim();
                _book.PublishYear = publishYear;
                _book.ISBN = ISBNTextBox.Text.Trim();
                _book.QuantityInStock = quantity;
                _book.AuthorId = (int)AuthorComboBox.SelectedValue;
                _book.GenreId = (int)GenreComboBox.SelectedValue;

                // Сохранение изменений
                if (_bookId == 0)
                {
                    _context.Books.Add(_book);
                }
                else
                {
                    _context.Books.Update(_book);
                }

                _context.SaveChanges();
                DialogResult = true;
                Close();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при сохранении книги: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void DeleteButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                if (_bookId == 0)
                {
                    DialogResult = false;
                    Close();
                    return;
                }

                var result = MessageBox.Show("Вы уверены, что хотите удалить эту книгу?",
                                            "Подтверждение удаления",
                                            MessageBoxButton.YesNo,
                                            MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    var bookToDelete = _context.Books.Find(_bookId);
                    if (bookToDelete != null)
                    {
                        _context.Books.Remove(bookToDelete);
                        _context.SaveChanges();
                        DialogResult = true;
                        Close();
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при удалении книги: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            DialogResult = false;
            Close();
        }

        protected override void OnClosed(EventArgs e)
        {
            _context.Dispose();
            base.OnClosed(e);
        }
    }
}
