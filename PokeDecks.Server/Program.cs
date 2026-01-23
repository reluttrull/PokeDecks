using DotNetEnv;
using PokeDecks.Server.Extensions;
using PokeServer;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
        policy.WithOrigins("https://reluttrull.github.io", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

builder.Services.AddRedis();
builder.Services.AddScoped<ApiHelper>();
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddMemoryCache();
builder.Services.AddHealthChecks();

var app = builder.Build();

app.MapOpenApi();
app.MapHealthChecks("/health");

app.UseCors("AllowClient");
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapHub<NotificationHub>("/notifications");
app.MapControllers();

app.Run();
