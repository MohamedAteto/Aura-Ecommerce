using ECommerce.Application.DTOs;
using FluentValidation;

namespace ECommerce.Application.Validators;

public class NewsletterSubscribeRequestValidator : AbstractValidator<NewsletterSubscribeRequest>
{
    public NewsletterSubscribeRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .WithMessage("Please enter a valid email address.");
    }
}
