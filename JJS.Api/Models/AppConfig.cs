namespace JJS.Api.Models;

public class AppConfig
{
   public const string DATABASE_CONNECTION_STRING = "ConnectionStrings:DbConnectionString";

   public required string DbConnectionString { get; set; }
   public required string RootPath { get; set; }
   public required string HttpPath { get; set; }
}
