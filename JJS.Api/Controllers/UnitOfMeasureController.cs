using JJS.Api.Models.Recipe;
using JJS.Api.Repositories.Recipe;
using Microsoft.AspNetCore.Mvc;

namespace JJS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UnitOfMeasureController(IUnitOfMeasureRepository unitOfMeasureRepository) : Controller
{
    private readonly IUnitOfMeasureRepository _unitOfMeasureRepository = unitOfMeasureRepository;

    [HttpGet]
    public async Task<IEnumerable<UnitOfMeasureViewModel>> GetAll()
    {
        return await _unitOfMeasureRepository.GetAll();
    }
}
