using JJS.Api.Models;
using JJS.Api.Models.Article;
using JJS.Api.Repositories;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace JJS.Api.Services
{
   [ServiceImplementation(typeof(CategoryService))]
   public class CategoryService
   {
      private readonly ICategoryRepository _categoryRepository;

      public CategoryService(ICategoryRepository categoryRepository)
      {
         _categoryRepository = categoryRepository;
      }

      public async Task<IEnumerable<Category>> Get()
      {
         return await _categoryRepository.Get();
      }
   }
}
