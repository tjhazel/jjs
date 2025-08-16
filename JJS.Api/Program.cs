using JJS.Api;

bool IS_DEBUG = false;
#if DEBUG
IS_DEBUG = true;
#endif

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

var app = AppBuilder.BuildApp(builder, builder.Environment.EnvironmentName == "Development");

//Expose Swagger UI
app.UseSwagger();
app.UseSwaggerUI(options =>
{
   //Expose ui as site root
   options.RoutePrefix = string.Empty;

   options.SwaggerEndpoint("/swagger/v1/swagger.json", "AssistPoint API");
});

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
app.UseCors("AllowCors");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

await app.RunAsync();
