using JJS.Api.Middleware;
using JJS.Api.Models;
using JJS.Api.Models.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace JJS.Api
{
   public class Startup
   {
      public Startup(IConfiguration configuration)
      {
         Configuration = configuration;

//#if DEBUG
//         // Using to get more explicit exception details when auth has failed
//         IdentityModelEventSource.ShowPII = true;
//#endif
      }

      // This method gets called by the runtime. Use this method to add services to the container.
      // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
      public void ConfigureServices(IServiceCollection services)
      {
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

               options.SwaggerEndpoint("/swagger/v1/swagger.json", "Assistpoint API");
            });
         }

         app.UseRouting();
         app.UseCors("AllowCors");

         app.UseEndpoints(endpoints =>
         {
            endpoints.MapControllers();
            //endpoints.MapGet("/", async context =>
            //   {
            //    await context.Response.WriteAsync("Hello World!");
            // });
         });
      }

      private void RegisterAppConfiguration(IServiceCollection services)
      {
         const string DATABASE_CONNECTION_STRING = "ConnectionStrings:DatabaseConnectionString";
 
         services.AddSingleton(new AppConfig
         {
            DatabaseConnectionString = Configuration[DATABASE_CONNECTION_STRING]
         });
      }

      private void RegisterAppServices(IServiceCollection services)
      {
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
