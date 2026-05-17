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

// Configure base path early so middleware (Swagger, static files, etc.) see the trimmed path.
app.UsePathBase("/api");

//Expose Swagger UI
app.UseSwagger();
app.UseSwaggerUI(options =>
{
   //Expose ui as site root under the path base
   options.RoutePrefix = string.Empty;

   options.SwaggerEndpoint("/swagger/v1/swagger.json", "AssistPoint API");
});

app.MapDefaultEndpoints();

var imgDir = Path.Combine(Directory.GetCurrentDirectory(), "Album");
app.UseFileServer(new FileServerOptions
{
   FileProvider = new PhysicalFileProvider(imgDir),
   RequestPath = "/Image",
   EnableDefaultFiles = true,
});

// Configure the HTTP request pipeline.
app.UseCors("AllowCors");

app.UseHttpsRedirection();

app.UseAuthorization();

app.UseUserValidationMiddleware();

app.MapControllers();

await app.RunAsync();
