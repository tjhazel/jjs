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

// ==========================================
// 1. GLOBAL HTTP PIPELINE CONFIGURATIONS
// ==========================================
app.UseSwagger(options => {
   options.RouteTemplate = "api/swagger/{documentName}/swagger.json";
});

app.UseSwaggerUI(options => {
   options.RoutePrefix = "api/swagger";
   options.SwaggerEndpoint("/api/swagger/v1/swagger.json", "John & Jeri API");
});

app.UseCors("AllowCors");

// ==========================================
// 2. SECURITY & CUSTOM IDENTITY MIDDLEWARE
// ==========================================
// FIX: Placed sequentially BEFORE any mapping filters run
app.UseAuthentication();
app.UseUserValidationMiddleware();
app.UseAuthorization();


// ==========================================
// 3. PHYSICAL STATIC FILE SERVERS
// ==========================================
var imgDir = Path.Combine(AppContext.BaseDirectory, "Albums");
if (!Directory.Exists(imgDir)) Directory.CreateDirectory(imgDir);

app.UseFileServer(new FileServerOptions
{
   FileProvider = new PhysicalFileProvider(imgDir),
   RequestPath = "/Image",
   EnableDefaultFiles = true,
});


// ==========================================
// 4. TERMINAL ENDPOINT MAPPINGS (MUST BE LAST)
// ==========================================
app.MapDefaultEndpoints();

//adding visibility
app.MapGet("/diag", () => {
   var uiPath = Path.Combine(builder.Environment.ContentRootPath, "ui");
   var indexPath = Path.Combine(uiPath, "index.html");
   return Results.Ok(new
   {
      ContentRoot = builder.Environment.ContentRootPath,
      UiPath = uiPath,
      UiDirExists = Directory.Exists(uiPath),
      IndexExists = File.Exists(indexPath),
      IsDebug = IS_DEBUG
   });
})
.WithMetadata(new Microsoft.AspNetCore.Mvc.ProducesResponseTypeAttribute(200)); //show in swagger

app.MapGet("/api/debug-auth", (HttpContext context) =>
{
   var user = context.User;
   return Results.Ok(new
   {
      IsAuthenticated = user.Identity?.IsAuthenticated,
      AuthenticationType = user.Identity?.AuthenticationType, // If null or empty, Authorize fails!
      HasAdminRole = user.IsInRole("Admin"),
      Claims = user.Claims.Select(c => new { c.Type, c.Value }).ToList()
   });
})
.WithMetadata(new Microsoft.AspNetCore.Mvc.ProducesResponseTypeAttribute(200));

// 2. Map standard API endpoints natively
app.MapControllers();


// 4. FIX ROOT CONFLICT: Isolate the React frontend static file routing entirely from the API
app.MapWhen(context => !IS_DEBUG
    && !context.Request.Path.StartsWithSegments("/api/swagger")
    && !context.Request.Path.StartsWithSegments("/api")
   // && !context.Request.Path.StartsWithSegments("/Image")
   ,
uiBuilder => {

   var uiPhysicalPath = Path.Combine(builder.Environment.ContentRootPath, "ui");
   var uiFileProvider = new PhysicalFileProvider(uiPhysicalPath);

   // Set back to "" to pass validation rules natively
   uiBuilder.UseStaticFiles(new StaticFileOptions
   {
      FileProvider = uiFileProvider,
      RequestPath = "",
      OnPrepareResponse = context => {
         context.Context.Response.Headers.Add("Cache-Control", "no-cache, no-store");
         context.Context.Response.Headers.Add("Expires", "-1");
      }
   });

   uiBuilder.UseRouting();

   uiBuilder.UseEndpoints(endpoints => {
      // Fallback natively delivers index.html content when root "/" is requested
      endpoints.MapFallbackToFile("index.html", new StaticFileOptions
      {
         FileProvider = uiFileProvider,
         RequestPath = ""
      });
   });
});


await app.RunAsync();
