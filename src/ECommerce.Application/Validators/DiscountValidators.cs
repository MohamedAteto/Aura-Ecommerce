using ECommerce.Application.DTOs;
using ECommerce.Domain.Entities;
using FluentValidation;

namespace ECommerce.Application.Validators;

public class UpsertCouponRequestValidator : AbstractValidator<UpsertCouponRequest>
{
    public UpsertCouponRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Type).Must(t => t == DiscountTypes.Percentage || t == DiscountTypes.FixedAmount)
            .WithMessage("Type must be 'Percentage' or 'FixedAmount'.");
        RuleFor(x => x.Value).GreaterThan(0).WithMessage("Value must be greater than 0.");
        RuleFor(x => x.MinOrderAmount).GreaterThanOrEqualTo(0);
    }
}

public class ApplyCouponRequestValidator : AbstractValidator<ApplyCouponRequest>
{
    public ApplyCouponRequestValidator()
    {
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50);
    }
}
