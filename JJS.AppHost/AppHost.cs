var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.JJS_Api>("jjs-api");

builder.Build().Run();
