using ECommerce.Application.DTOs;
using FluentValidation;

namespace ECommerce.Application.Validators;

public class PaymentSimulateRequestValidator : AbstractValidator<PaymentSimulateRequest>
{
    public PaymentSimulateRequestValidator()
    {
    }
}
