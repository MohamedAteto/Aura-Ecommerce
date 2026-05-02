using ECommerce.Application.DTOs;
using FluentValidation;

namespace ECommerce.Application.Validators;

public class BulkProductRequestValidator : AbstractValidator<BulkProductRequest>
{
    public BulkProductRequestValidator(IValidator<ProductUpsertRequest> productValidator)
    {
        RuleFor(x => x.Items).NotNull();
        RuleFor(x => x.Items!.Count).InclusiveBetween(1, 100);
        RuleForEach(x => x.Items!).SetValidator(productValidator);
    }
}
