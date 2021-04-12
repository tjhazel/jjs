CREATE VIEW [dbo].[vw_cust_IngredientsXrefSummary]

as

select x.*, r.Name 'RecipeName', i.Name 'Ingredient', u.Name 'UnitOfMeasure', u.PluralName 
from Ingredients_xref x
inner join Recipes r on r.RecipeId = x.RecipeFk
inner join Ingredients i on i.IngredientId = x.IngredientFk
inner join UnitOfMeasure u on u.UnitOfMeasureId = x.UnitOfMeasureFk
