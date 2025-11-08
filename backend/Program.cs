using GPTMini.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using DotNetEnv;

// Load .env file if it exists
var envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
{
    try
    {
        Env.Load(envPath);
        var apiKeyFromEnv = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        if (!string.IsNullOrEmpty(apiKeyFromEnv))
        {
            Console.WriteLine($"✅ Archivo .env cargado desde: {envPath}");
            Console.WriteLine($"✅ OPENAI_API_KEY detectada (primeros 10 caracteres): {apiKeyFromEnv.Substring(0, Math.Min(10, apiKeyFromEnv.Length))}...");
        }
        else
        {
            Console.WriteLine($"⚠️  Archivo .env cargado pero OPENAI_API_KEY no se encontró en las variables de entorno");
            Console.WriteLine($"   Verifica el formato del archivo .env");
            Console.WriteLine($"   Formato esperado: OPENAI_API_KEY=sk-tu-api-key (sin comillas, sin espacios)");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Error al cargar archivo .env: {ex.Message}");
    }
}
else
{
    Console.WriteLine($"⚠️  Archivo .env no encontrado en: {envPath}");
    Console.WriteLine("   Usando variables de entorno del sistema o appsettings.json");
}

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Register HttpClient for OpenAI service (typed client)
builder.Services.AddHttpClient<IOpenAIService, OpenAIService>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

app.Run();

