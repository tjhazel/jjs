using Google.Apis.Auth.AspNetCore3;
using JJS.Api.Middleware;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using JJS.Api.Services.Cache;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;


namespace JJS.Api
{
   public class Startup
   {
      public Startup(IConfiguration configuration, IWebHostEnvironment env)
      {
         Configuration = configuration;
         WebHostEnvironment = env;

#if DEBUG
         // Using to get more explicit exception details when auth has failed
         IdentityModelEventSource.ShowPII = true;
#endif
      }

      // This method gets called by the runtime. Use this method to add services to the container.
      // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
      public void ConfigureServices(IServiceCollection services)
      {
         AddAuthentication(services);
         services.AddSwaggerGen();

         //Set up cors
         services.AddCors(options =>
         {
            options.AddPolicy("AllowCors",
                builder => builder
                    .WithOrigins("http://localhost:3000",
                        "https://localhost:3000",
                        "https://*.johnandjeri.com")
                    .SetIsOriginAllowedToAllowWildcardSubdomains()
                    .AllowAnyMethod()
                    .AllowAnyHeader());
         });

         RegisterAppConfiguration(services);
         RegisterAppServices(services);

         services.AddControllers(mvc =>
         {
            //var policy = new AuthorizationPolicyBuilder()
            //    .RequireAuthenticatedUser()
            //    .Build();

            //mvc.Filters.Add(new AuthorizeFilter(policy));
         }).AddJsonOptions(options => { options.JsonSerializerOptions.Converters.Add(new UtcDateTimeConverter()); });
      }

      public IConfiguration Configuration { get; }
      public IWebHostEnvironment WebHostEnvironment { get; }

      // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
      public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
      {
         if (env.IsDevelopment())
         {
            app.UseDeveloperExceptionPage();

            //Expose Swagger UI
            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
               //Expose ui as site root
               options.RoutePrefix = string.Empty;

               options.SwaggerEndpoint("/swagger/v1/swagger.json", "John, Jeri, & Sidney API");
            });
         }

         app.UseRouting();
         app.UseCors("AllowCors");
         app.UseAuthentication();

         app.UseAuthorization();

         app.UseUserValidationMiddleware();

         app.UseEndpoints(endpoints =>
         {
            endpoints.MapControllers();
            //endpoints.MapGet("/", async context =>
            //   {
            //    await context.Response.WriteAsync("Hello World!");
            // });
         });
      }

      private void AddAuthentication(IServiceCollection services)
      {
         //// This configures Google.Apis.Auth.AspNetCore3 for use in this app.
         //services
         //    .AddAuthentication(o =>
         //    {
         //       // This forces challenge results to be handled by Google OpenID Handler, so there's no
         //       // need to add an AccountController that emits challenges for Login.
         //       o.DefaultChallengeScheme = GoogleOpenIdConnectDefaults.AuthenticationScheme;
         //       // This forces forbid results to be handled by Google OpenID Handler, which checks if
         //       // extra scopes are required and does automatic incremental auth.
         //       o.DefaultForbidScheme = GoogleOpenIdConnectDefaults.AuthenticationScheme;
         //       // Default scheme that will handle everything else.
         //       // Once a user is authenticated, the OAuth2 token info is stored in cookies.
         //       o.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
         //    })
         //    .AddCookie()
         //    .AddGoogleOpenIdConnect(options =>
         //    {
         //       IConfigurationSection googleAuthNSection =
         //                Configuration.GetSection("AppSetting");

         //       options.ClientId = googleAuthNSection["GoogleClientId"];
         //       options.ClientSecret = googleAuthNSection["GoogleClientSecret"];
         //    });

         //services.AddAuthentication()
         //  .AddGoogle(options =>
         //  {
         //     IConfigurationSection googleAuthNSection =
         //         Configuration.GetSection("AppSetting");

         //     options.ClientId = googleAuthNSection["GoogleClientId"];
         //     options.ClientSecret = googleAuthNSection["GoogleClientSecret"];
         //  });

         //services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
         // .AddJwtBearer(jwt => jwt.UseGoogle(
         //     clientId: "<client-id-from-Google-API-console>",
         //     hostedDomain: "<optional-hosted-domain>"));

         //services.AddIdentity(options => 
         //{
         //   options.de
         //});

         services.AddAuthentication(options =>
         {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
           // options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;

         })
         .AddJwtBearer(options =>
         {
            options.SecurityTokenValidators.Clear();
            options.SecurityTokenValidators.Add(new GoogleTokenValidator());
         });

         //services.AddAuthentication(sharedOptions =>
         //{
         //   sharedOptions.DefaultScheme = GoogleDefaults.AuthenticationScheme;
         //})
         //.AddJwtBearer(GoogleDefaults.AuthenticationScheme, options =>
         // {
         //    var authSettings = Configuration.GetSection("AppSetting").Get<AppSetting>();
         //    options.Audience = authSettings.GoogleClientId;
         //    //options.Authority = authSettings.Authority;

         //    options.TokenValidationParameters = new TokenValidationParameters()
         //    {
         //       ValidateLifetime = false,
         //       ValidateAudience = false,
         //       ValidAudience = authSettings.GoogleClientId,
         //       ValidateIssuer = false,
         //       ValidateIssuerSigningKey = false,
         //    };
         // });

      }

      private void RegisterAppConfiguration(IServiceCollection services)
      {
         const string DATABASE_CONNECTION_STRING = "ConnectionStrings:DatabaseConnectionString";
 
         services.AddSingleton(new AppConfig
         {
            DatabaseConnectionString = Configuration[DATABASE_CONNECTION_STRING],
            RootPath = WebHostEnvironment.ContentRootPath
         });

         services.AddSingleton<AppSetting>(y => Configuration.GetSection("AppSetting").Get<AppSetting>());
      }

      private void RegisterAppServices(IServiceCollection services)
      {
         //Specify which caching provider to use
         services.AddSingleton<ICacheService, MemoryCacheService>();

         //Manually register services
         services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        // services.AddTransient<IAppContextService, AppContextService>();

         //Dynamically register remaining services
         
         RegisterAssemblyServices(this.GetType().Assembly.GetName().Name, services);
         //RegisterAssemblyServices("JJS.Api", services);
      }

      private static void RegisterAssemblyServices(string assemblyName, IServiceCollection services)
      {
         Assembly.Load(assemblyName);
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
   }
}
