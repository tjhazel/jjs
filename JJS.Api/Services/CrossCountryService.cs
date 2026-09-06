using JJS.Api.Models.CrossCountry;
using JJS.Api.Models;
using JJS.Api.Repositories;

namespace JJS.Api.Services;

[ServiceImplementation(typeof(ICrossCountryService))]
public class CrossCountryService(ICrossCountryRepository crossCountryRepository) : ICrossCountryService
{
   private readonly ICrossCountryRepository _crossCountryRepository = crossCountryRepository;

   public Task<IEnumerable<CrossCountry>> GetAll() => _crossCountryRepository.GetAll();

   public Task<CrossCountry?> Get(int crossCountryId) => _crossCountryRepository.Get(crossCountryId);

   public Task<int> Save(CrossCountry model) => _crossCountryRepository.Save(model);
}

public interface ICrossCountryService
{
   Task<IEnumerable<CrossCountry>> GetAll();
   Task<CrossCountry?> Get(int crossCountryId);
   Task<int> Save(CrossCountry model);
}
