using Microsoft.EntityFrameworkCore; // �������� using
using TouristGuide.Data;          // �������� using

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// �������� ������ ����������� �� appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// ������������ ApplicationDbContext � ����������� PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString)); // ���������� UseNpgsql

builder.Services.AddControllersWithViews();

var app = builder.Build();

// ���� ��� ������������� ��
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        // ��������, ��� �� ������� (��� �������� ��������)
        context.Database.EnsureCreated(); // ��� context.Database.Migrate();
        DbInitializer.Initialize(context); // �������� ��� �������������
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred seeding the DB.");
    }
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // ��� CSS, JS, ����������� �� wwwroot

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Cities}/{action=Index}/{id?}"); // ������������� CitiesController ��� ���������

app.Run();