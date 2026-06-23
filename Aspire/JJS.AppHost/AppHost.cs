var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.JJS_Api>("jjs-api")
   .WithExternalHttpEndpoints()
;

////shows the correct port on dashboard, but console logs show a random port.  
//var ui = builder.AddViteApp(name: "todo-ui", workingDirectory: "../todoUi")
//   .WithHttpEndpoint(port: 3000, name: "frontend", env: "PORT")
//   .WithExternalHttpEndpoints()
//   .WithReference(api)
//   .WaitFor(api)
//   .WithNpmPackageInstallation()
//   ;

////produces a clean startup dashboard
//var ui = builder.AddNpmApp(name: "jjs-web-ui", workingDirectory: "../../jjs-web", scriptName: "dev")
//    .WithHttpEndpoint(port: 3000, env: "PORT")
//    .WithExternalHttpEndpoints()
//    .WithReference(api)
//    .WaitFor(api);

var ui = builder.AddNpmApp(name: "jjs-web-ui", workingDirectory: "../../jjs-web", scriptName: "dev")
    //.WithHttpEndpoint(port: 5173, env: "PORT")
    .WithExternalHttpEndpoints()
    .WithReference(api)
    .WaitFor(api);


builder.Build().Run();
