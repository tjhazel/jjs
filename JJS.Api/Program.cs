using JJS.Api;
using JJS.Api.Middleware;
using Microsoft.Extensions.FileProviders;

bool IS_DEBUG = false;
#if DEBUG
IS_DEBUG = true;
#endif

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

var app = AppBuilder.BuildApp(builder, builder.Environment.EnvironmentName == "Development");

// 1. SERVE NEXT.JS STATIC FILES AT '/' FIRST
// Looks for index.html inside the 'wwwroot' folder
app.UseDefaultFiles();
//prevent from caching spa pages
app.UseStaticFiles(new StaticFileOptions()
{
   OnPrepareResponse = context =>
   {
      context.Context.Response.Headers.Add("Cache-Control", "no-cache, no-store");
      context.Context.Response.Headers.Add("Expires", "-1");
   }
});

// Configure base path early so middleware (Swagger, static files, etc.) see the trimmed path.
app.UsePathBase("/api");

if (IS_DEBUG)
{
   //Expose Swagger UI
   app.UseSwagger();
   app.UseSwaggerUI(options =>
   {
      options.RoutePrefix = string.Empty; // Becomes site root inside /api base
      options.SwaggerEndpoint("swagger/v1/swagger.json", "John & Jeri API");
   });
}

app.MapDefaultEndpoints();
app.UseCors("AllowCors");
app.UseHttpsRedirection();
app.UseAuthorization();
app.UseUserValidationMiddleware();
app.MapControllers();

var imgDir = Path.Combine(Directory.GetCurrentDirectory(), "Albums");
app.UseFileServer(new FileServerOptions
{
   FileProvider = new PhysicalFileProvider(imgDir),
   RequestPath = "/Image",
   EnableDefaultFiles = true,
});

// 3. FALLBACK FOR NEXT.JS CLIENT-SIDE ROUTER
// If a request hits the root domain but doesn't match an API controller or static file, 
// serve Next.js index.html so the React router handles it.
app.MapFallbackToFile("index.html");

await app.RunAsync();
