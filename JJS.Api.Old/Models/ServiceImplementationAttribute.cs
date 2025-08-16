using System;


namespace JJS.Api.Models
{
   [AttributeUsage(AttributeTargets.Class)]
   public class ServiceImplementationAttribute : Attribute
   {
      public Type ServiceInterface { get; }

      public DependencyInjectionLifetime ServiceLifetime { get; }

      public ServiceImplementationAttribute(Type serviceInterface, DependencyInjectionLifetime serviceLifetime = DependencyInjectionLifetime.Transient)
      {
         ServiceInterface = serviceInterface;
         ServiceLifetime = serviceLifetime;
      }

   }
}
