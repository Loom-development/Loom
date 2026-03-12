var app = WebApplication.CreateBuilder(args).Build();

app.MapGet("/", () => Results.Ok(new { message = "Hello from Loom .NET template" }));

app.Run();
