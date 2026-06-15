using JJS.Api.Middleware;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.Configuration;
using System.Reflection;
using System.Text.Json.Serialization;
using static JJS.Api.Models.ServiceImplementationAttribute;

namespace JJS.Api;

public class AppBuilder
{
   public static WebApplication BuildApp(WebApplicationBuilder builder, bool isDebug)
   {
      AddAuthentication(builder);
      AddAuthorization(builder);
      AddSwagger(builder);
      AddCors(builder);
      AddLogging(builder);

      var appConfig = RegisterAppConfiguration(builder, isDebug);
      RegisterHttpClients(builder);
      RegisterDependencies(builder);
      RegisterControllers(builder);

      return builder.Build();
   }

   private static void AddAuthentication(WebApplicationBuilder builder)
   {
      builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
           options.Authority = "https://accounts.google.com";
           options.TokenValidationParameters = new TokenValidationParameters
           {
              ValidateIssuer = true,
              ValidIssuer = "https://accounts.google.com",

              ValidateAudience = true,
              ValidAudience = builder.Configuration["AppSetting:GoogleClientId"], // your NEXT_PUBLIC_GOOGLE_CLIENT_ID

              ValidateLifetime = true,
           };
        });
   }

   static void AddAuthorization(WebApplicationBuilder builder)
   {
      builder.Services.AddAuthorization(options =>
      {
         //something here
      });
   }
   static void AddSwagger(WebApplicationBuilder builder)
   {
      builder.Services.AddSwaggerGen(c =>
      {
         c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
         {
            Description = "JWT Authorization header",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.ApiKey,
            Scheme = "Bearer"
         });
         //TODO: update swagger security requirement to match authentication scheme when implemented
         //c.AddSecurityRequirement(new OpenApiSecurityRequirement()
         //               {
         //               {
         //                   new OpenApiSecurityScheme
         //                   {
         //                       Reference = new OpenApiReference
         //                       {
         //                           Type = ReferenceType.SecurityScheme,
         //                           Id = "Bearer"
         //                       },
         //                       Scheme = "oauth2",
         //                       Name = "Bearer",
         //                       In = ParameterLocation.Header,

         //                   },
         //                   new List<string>()
         //               }
         //               });
         c.SwaggerDoc("v1", new OpenApiInfo
         {
            Title = "JJS API",
            Version = "v1"
         });
      });
   }

   static void AddCors(WebApplicationBuilder builder)
   {
      //Set up cors
      builder.Services.AddCors(options =>
      {
         options.AddPolicy("AllowCors",
             policyBuilder => policyBuilder
                 .WithOrigins("http://localhost:3000", 
                     "http://localhost:44301",
                     "https://*.johnandjeri.com",
                     "http://*.johnandjeri.com")
                 .SetIsOriginAllowedToAllowWildcardSubdomains()
                 .AllowAnyMethod()
                 .AllowCredentials()
                 .AllowAnyHeader());
      });
   }

   static void AddLogging(WebApplicationBuilder builder)
   {
      builder.Services.AddLogging(logging =>
      {
         logging.AddFilter("Microsoft.Hosting.Lifetime", Microsoft.Extensions.Logging.LogLevel.Information);
         logging.AddFilter("System", Microsoft.Extensions.Logging.LogLevel.Warning);
         logging.AddConsole();
         logging.AddDebug();
      });
   }

   static AppConfig RegisterAppConfiguration(WebApplicationBuilder builder, bool isDebug)
   {
      if (string.IsNullOrWhiteSpace(builder.Configuration[AppConfig.DATABASE_CONNECTION_STRING]))
      {
         throw new Exception("Local connection string not set.");
      }

      AppConfig appConfig = new()
      {
         DbConnectionString = builder.Configuration[AppConfig.DATABASE_CONNECTION_STRING]!,
         RootPath = builder.Environment.ContentRootPath,
         HttpPath = builder.Environment.WebRootPath
      };

      builder.Services.AddSingleton<AppConfig>(y => appConfig);

      var appSetting = builder.Configuration.GetSection("AppSetting")?.Get<AppSetting>();
      if (appSetting == null)
         throw new ConfigurationErrorsException("AppSetting section is missing in configuration.");

      builder.Services.AddSingleton<AppSetting>(y => appSetting);
         
      return appConfig;
   }

   static void RegisterHttpClients(WebApplicationBuilder builder)
   {
      builder.Services.AddHttpClient();
   }


   /// <summary>
   /// single location to populate the core IoC container.
   /// </summary>
   /// <param name="services"></param>
   static void RegisterDependencies(WebApplicationBuilder builder)
   {
      //local dependencies
      builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();

      var thisAssembly = typeof(AppBuilder).Assembly.GetName().Name;
      RegisterAssemblyServices(thisAssembly, builder.Services);
   }

   static void RegisterAssemblyServices(string assemblyName, IServiceCollection services)
   {
      if (AppDomain.CurrentDomain.GetAssemblies().Any(y => y.GetName().Name != assemblyName))
      {
         Assembly.Load(assemblyName);
      }

      //Get all types with service implementation attribute
      var serviceImplementations = AppDomain.CurrentDomain.GetAssemblies()
          .Single(a => a.GetName().Name == assemblyName)
          .GetTypes()
          .Where(t => t.IsDefined(typeof(ServiceImplementationAttribute), false));

      //Add service registration
      foreach (var serviceImplementation in serviceImplementations)
      {
         var implementationAttribute = (ServiceImplementationAttribute)serviceImplementation.GetCustomAttribute(typeof(ServiceImplementationAttribute));
         if (implementationAttribute != null)
         {
            switch (implementationAttribute.ServiceLifetime)
            {
               case DependencyInjectionLifetime.Singleton:
                  services.AddSingleton(implementationAttribute.ServiceInterface, serviceImplementation);
                  break;
               case DependencyInjectionLifetime.Scoped:
                  services.AddScoped(implementationAttribute.ServiceInterface, serviceImplementation);
                  break;
               case DependencyInjectionLifetime.Transient:
                  services.AddTransient(implementationAttribute.ServiceInterface, serviceImplementation);
                  break;
            }
         }
      }
   }

   static void RegisterControllers(WebApplicationBuilder builder)
   {
      builder.Services.AddControllers(mvc =>
      {
         //var policy = new AuthorizationPolicyBuilder()
         //    .RequireAuthenticatedUser()
         //    .Build();

         //mvc.Filters.Add(new AuthorizeFilter(policy));
      })
      .AddJsonOptions(options =>
      {
         options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
         options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter());
      });
   }
}
