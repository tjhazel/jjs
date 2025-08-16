using System;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using JJS.Api.Models.Exceptions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace JJS.Api.Middleware
{
   public class ExceptionHandlingMiddleware
   {
      private readonly RequestDelegate _next;

      public ExceptionHandlingMiddleware(RequestDelegate next)
      {
         _next = next;
      }

      public async Task Invoke(HttpContext httpContext)
      {
         try
         {
            await _next(httpContext);
         }
         catch (ValidationException e)
         {
            var responseBody = JsonSerializer.Serialize(e.ValidationExceptions);

            httpContext.Response.StatusCode = StatusCodes.Status422UnprocessableEntity;
            httpContext.Response.ContentType = "application/json";
            await httpContext.Response.WriteAsync(responseBody, Encoding.UTF8);

            //Stop processing - this return is needed to prevent pipeline from continuing
            // ReSharper disable once RedundantJumpStatement
            return;
         }
         catch (Exception e)
             when ((e is BadHttpRequestException || e is BadHttpRequestException) && e.Message == "Request body too large.")
         {
            httpContext.Response.StatusCode = StatusCodes.Status413RequestEntityTooLarge;

            //Stop processing - this return is needed to prevent pipeline from continuing
            // ReSharper disable once RedundantJumpStatement
            return;
         }
      }
   }

   // Extension method used to add the middleware to the HTTP request pipeline.
   public static class ExceptionHandlingMiddlewareExtensions
   {
      public static IApplicationBuilder UseExceptionHandlingMiddleware(this IApplicationBuilder builder)
      {
         return builder.UseMiddleware<ExceptionHandlingMiddleware>();
      }
   }
}