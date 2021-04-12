namespace JJS.Api.Models.Exceptions
{
    public class ValidationExceptionField
    {
        public string FieldName { get; set; }
        public string Message { get; set; }

        public ValidationExceptionField() { }

        public ValidationExceptionField(string fieldName, string message)
        {
            FieldName = fieldName;
            Message = message;
        }
    }
}
