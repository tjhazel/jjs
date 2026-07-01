var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.JJS_Api>("jjs-api")
   //.WithHttpEndpoint(port: 5000, targetPort: 5000, name: "http", isProxied: false)
   .WithHttpsEndpoint(port: 5001, targetPort: 5001, name: "https", isProxied: false)
   .WithExternalHttpEndpoints()
;

var ui = builder.AddNpmApp(name: "jjs-web-ui", workingDirectory: "../../jjs-web", scriptName: "dev")
    .WithHttpEndpoint(port: 5173, targetPort: 5173, env: "dev", name: "dev-ui", isProxied: false)
    .WithExternalHttpEndpoints()
    .WithReference(api)
    .WaitFor(api);


builder.Build().Run();
