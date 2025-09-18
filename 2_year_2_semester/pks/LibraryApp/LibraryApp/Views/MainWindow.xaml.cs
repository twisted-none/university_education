using System;
using System.Collections.Generic;
using System.Linq;
using System.Windows;
using System.Windows.Controls;
using Microsoft.EntityFrameworkCore;
using LibraryApp.Data;
using LibraryApp.Models;
    
namespace LibraryApp.Views
{
    public partial class MainWindow : Window
    {
        private readonly LibraryContext _context;

        public MainWindow()
        {
            InitializeComponent();
            _context = new LibraryContext();

            // Создаем базу данных при первом запуске
            _context.Database.EnsureCreated();

            // Загружаем данные
            LoadData();
        }

        private void LoadData()
        {
            try
            {
                // Загружаем книги с включением связанных данных
                var books = _context.Books
                    .Include(b => b.Author)
                    .Include(b => b.Genre)
                    .ToList();

                BooksDataGrid.ItemsSource = books;

                // Загружаем авторов и жанры для фильтров
                var authors = _context.Authors.ToList();
                var genres = _context.Genres.ToList();

                // Добавляем пустой элемент для возможности сброса фильтра
                authors.Insert(0, new Author { Id = 0, FirstName = "", LastName = "<Все авторы>" });
                genres.Insert(0, new Genre { Id = 0, Name = "<Все жанры>" });

                AuthorFilterComboBox.ItemsSource = authors;
                GenreFilterComboBox.ItemsSource = genres;

                // Выбираем элементы "Все"
                AuthorFilterComboBox.SelectedIndex = 0;
                GenreFilterComboBox.SelectedIndex = 0;
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при загрузке данных: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void SearchButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                string searchText = SearchTextBox.Text.ToLower();

                var query = _context.Books
                    .Include(b => b.Author)
                    .Include(b => b.Genre)
                    .AsQueryable();

                // Фильтр по поисковому запросу
                if (!string.IsNullOrWhiteSpace(searchText))
                {
                    query = query.Where(b => b.Title.ToLower().Contains(searchText));
                }

                // Фильтр по автору
                if (AuthorFilterComboBox.SelectedIndex > 0)
                {
                    int authorId = (int)AuthorFilterComboBox.SelectedValue;
                    query = query.Where(b => b.AuthorId == authorId);
                }

                // Фильтр по жанру
                if (GenreFilterComboBox.SelectedIndex > 0)
                {
                    int genreId = (int)GenreFilterComboBox.SelectedValue;
                    query = query.Where(b => b.GenreId == genreId);
                }

                BooksDataGrid.ItemsSource = query.ToList();
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Ошибка при поиске: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
            }
        }

        private void Filter_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            SearchButton_Click(sender, e);
        }

        private void ResetFilters_Click(object sender, RoutedEventArgs e)
        {
            SearchTextBox.Text = "";
            AuthorFilterComboBox.SelectedIndex = 0;
            GenreFilterComboBox.SelectedIndex = 0;

            LoadData();
        }

        private void BooksDataGrid_SelectionChanged(object sender, SelectionChangedEventArgs e)
        {
            bool isSelected = BooksDataGrid.SelectedItem != null;
        }

        private void AddBookButton_Click(object sender, RoutedEventArgs e)
        {
            var bookWindow = new BookWindow();
            if (bookWindow.ShowDialog() == true)
            {
                LoadData();
            }
        }

        private void EditBookButton_Click(object sender, RoutedEventArgs e)
        {
            if (BooksDataGrid.SelectedItem is Book selectedBook)
            {
                var bookWindow = new BookWindow(selectedBook.Id);
                if (bookWindow.ShowDialog() == true)
                {
                    LoadData();
                }
            }
            else
            {
                MessageBox.Show("Выберите книгу для редактирования", "Информация", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void DeleteBookButton_Click(object sender, RoutedEventArgs e)
        {
            if (BooksDataGrid.SelectedItem is Book selectedBook)
            {
                var result = MessageBox.Show($"Вы действительно хотите удалить книгу '{selectedBook.Title}'?",
                    "Подтверждение удаления", MessageBoxButton.YesNo, MessageBoxImage.Question);

                if (result == MessageBoxResult.Yes)
                {
                    try
                    {
                        _context.Books.Remove(selectedBook);
                        _context.SaveChanges();
                        LoadData();
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show($"Ошибка при удалении книги: {ex.Message}", "Ошибка", MessageBoxButton.OK, MessageBoxImage.Error);
                    }
                }
            }
            else
            {
                MessageBox.Show("Выберите книгу для удаления", "Информация", MessageBoxButton.OK, MessageBoxImage.Information);
            }
        }

        private void AuthorsButton_Click(object sender, RoutedEventArgs e)
        {
            var authorWindow = new AuthorWindow();
            authorWindow.ShowDialog();
            LoadData(); // Обновляем данные после закрытия окна
        }

        private void GenreButton_Click(object sender, RoutedEventArgs e)
        {
            var genreWindow = new GenreWindow();
            genreWindow.ShowDialog();
            LoadData(); // Обновляем данные после закрытия окна
        }

        protected override void OnClosed(EventArgs e)
        {
            _context.Dispose();
            base.OnClosed(e);
        }
    }
}