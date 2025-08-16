using System;
using System.Collections.Generic;

namespace JJS.Api.Models.Exceptions
{
    public class ValidationException : Exception
    {
        public List<ValidationExceptionField> ValidationExceptions { get; }

        public ValidationException(List<ValidationExceptionField> validationExceptions)
        {
            ValidationExceptions = validationExceptions;
        }
    }
}
