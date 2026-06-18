using JJS.Api;
using JJS.Api.Middleware;
using Microsoft.Extensions.FileProviders;
using System.Reflection;

bool IS_DEBUG = false;
#if DEBUG
IS_DEBUG = true;
#endif

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
   Args = args,
   ContentRootPath = AppContext.BaseDirectory
});

builder.AddServiceDefaults();

var app = AppBuilder.BuildApp(builder, builder.Environment.EnvironmentName == "Development");

app.MapDefaultEndpoints();

app.UseSwagger(options =>
{
   // This maps the underlying raw swagger.json file schema path to:
   // http://localhost/api/swagger/v1/swagger.json
   options.RouteTemplate = "api/swagger/{documentName}/swagger.json";
});

app.UseSwaggerUI(options =>
{
   options.RoutePrefix = "api/swagger"; // Cleaned up: Swagger will live at /swagger, freeing up the site root
   options.SwaggerEndpoint("/api/swagger/v1/swagger.json", "John & Jeri API");
});

app.UseCors("AllowCors");
app.UseAuthorization();
app.UseUserValidationMiddleware();

// 2. Map standard API endpoints natively
app.MapControllers();

// 3. Map your custom Album/Image physical storage server
var imgDir = Path.Combine(AppContext.BaseDirectory, "Albums"); // Safe for IIS context root
app.UseFileServer(new FileServerOptions
{
   FileProvider = new PhysicalFileProvider(imgDir),
   RequestPath = "/Image",
   EnableDefaultFiles = true,
});

// 4. FIX ROOT CONFLICT: Isolate the React frontend static file routing entirely from the API
app.MapWhen(context =>
    !context.Request.Path.StartsWithSegments("/api/swagger") &&
    !context.Request.Path.StartsWithSegments("/api") &&
    !context.Request.Path.StartsWithSegments("/Image"), // Don't interrupt image streaming
    uiBuilder =>
    {
       // Serve the UI subfolder files relatively with your custom SPA caching rules
       uiBuilder.UseStaticFiles(new StaticFileOptions
       {
          FileProvider = new PhysicalFileProvider(Path.Combine(builder.Environment.ContentRootPath, "ui")),
          RequestPath = "",
          OnPrepareResponse = context =>
          {
             context.Context.Response.Headers.Add("Cache-Control", "no-cache, no-store");
             context.Context.Response.Headers.Add("Expires", "-1");
          }
       });

       uiBuilder.UseRouting();
       uiBuilder.UseEndpoints(endpoints =>
       {
          // Fallback route ensures React Router handles any deep-linked client routes seamlessly
          endpoints.MapFallbackToFile("ui/index.html");
       });
    });

await app.RunAsync();
