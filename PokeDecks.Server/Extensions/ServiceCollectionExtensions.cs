using Microsoft.AspNetCore.RateLimiting;
using StackExchange.Redis;
using System.Runtime.CompilerServices;
using System.Threading.RateLimiting;

namespace PokeDecks.Server.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddRateLimiting(this IServiceCollection services)
        {
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.AddPolicy("fixed", context =>
                {
                    // limit 20 new game requests per IP per hour
                    var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

                    return RateLimitPartition.GetFixedWindowLimiter(ip, _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit = 20,
                        Window = TimeSpan.FromHours(1),
                        QueueLimit = 0
                    });
                });
            });
            return services;
        }
        public static IServiceCollection AddRedis(this IServiceCollection services)
        {
            services.AddSingleton<IConnectionMultiplexer>(sp =>
            {
                var logger = sp.GetRequiredService<ILoggerFactory>()
                               .CreateLogger("Redis");

                var cs = Environment.GetEnvironmentVariable("REDIS_CONNECTION_STRING");

                if (string.IsNullOrWhiteSpace(cs))
                {
                    logger.LogWarning("Redis connection string not set. Redis cache disabled.");
                    return ConnectionMultiplexer.Connect(new ConfigurationOptions
                    {
                        AbortOnConnectFail = false
                    });
                }

                try
                {
                    var options = ConfigurationOptions.Parse(cs, true);
                    options.AbortOnConnectFail = false;
                    options.ConnectRetry = 3;
                    options.ConnectTimeout = 5000;
                    options.SyncTimeout = 5000;

                    var mux = ConnectionMultiplexer.Connect(options);

                    mux.ConnectionFailed += (_, e) =>
                        logger.LogWarning("Redis connection failed: {Message}", e.Exception?.Message);

                    mux.ConnectionRestored += (_, _) =>
                        logger.LogInformation("Redis connection restored");

                    return mux;
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "Redis unavailable. Continuing without cache.");

                    return ConnectionMultiplexer.Connect(new ConfigurationOptions
                    {
                        AbortOnConnectFail = false
                    });
                }
            });

            return services;
        }
    }
}
