using JJS.Api.Models.Recipe;
using JJS.Api.Repositories.Recipe;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class IngredientController(IIngredientRepository ingredientRepository) : Controller
{
    private readonly IIngredientRepository _ingredientRepository = ingredientRepository;

    [HttpGet]
    public async Task<IEnumerable<IngredientLookupViewModel>> GetAll()
    {
        return await _ingredientRepository.GetAll();
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<int> Create([FromBody] CreateIngredientRequest request)
    {
        return await _ingredientRepository.Create(request.Name);
    }
}

public record CreateIngredientRequest(string Name);
