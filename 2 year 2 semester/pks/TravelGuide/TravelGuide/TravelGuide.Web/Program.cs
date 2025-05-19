using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using TravelGuide.Data;
using TravelGuide.Data.Repositories;
using TravelGuide.Data.Repositories.Interfaces;
using TravelGuide.Services;
using TravelGuide.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Добавление сервисов в контейнер DI
builder.Services.AddControllersWithViews();

// Добавление контекста базы данных
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Регистрация репозиториев
builder.Services.AddScoped<ICityRepository, CityRepository>();
builder.Services.AddScoped<IAttractionRepository, AttractionRepository>();

// Регистрация сервисов
builder.Services.AddScoped<ICityService, CityService>();
builder.Services.AddScoped<IAttractionService, AttractionService>();

var app = builder.Build();

// Настройка конвейера HTTP-запросов
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Применение миграций и инициализация базы данных
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var context = services.GetRequiredService<ApplicationDbContext>();
    context.Database.Migrate();
}

app.Run();
