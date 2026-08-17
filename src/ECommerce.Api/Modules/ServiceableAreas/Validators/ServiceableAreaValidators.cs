using ECommerce.Api.Modules.ServiceableAreas.DTOs;
using FluentValidation;

namespace ECommerce.Api.Modules.ServiceableAreas.Validators;

public class CreateServiceableAreaRequestValidator : AbstractValidator<CreateServiceableAreaRequest>
{
    public CreateServiceableAreaRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Hub or area name is required.")
            .MaximumLength(150).WithMessage("Hub name cannot exceed 150 characters.");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State is required.");

        RuleFor(x => x.Pincode)
            .NotEmpty().WithMessage("Pincode is required.")
            .Matches(@"^\d{6}$").WithMessage("Pincode must be a valid 6-digit number.");

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90.0, 90.0).WithMessage("Latitude must be between -90 and 90 degrees.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180.0, 180.0).WithMessage("Longitude must be between -180 and 180 degrees.");

        RuleFor(x => x.RadiusInKm)
            .GreaterThan(0).WithMessage("Delivery radius must be greater than 0 KM.");
    }
}

public class UpdateServiceableAreaRequestValidator : AbstractValidator<UpdateServiceableAreaRequest>
{
    public UpdateServiceableAreaRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Hub or area name is required.")
            .MaximumLength(150).WithMessage("Hub name cannot exceed 150 characters.");

        RuleFor(x => x.City)
            .NotEmpty().WithMessage("City is required.");

        RuleFor(x => x.State)
            .NotEmpty().WithMessage("State is required.");

        RuleFor(x => x.Pincode)
            .NotEmpty().WithMessage("Pincode is required.")
            .Matches(@"^\d{6}$").WithMessage("Pincode must be a valid 6-digit number.");

        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90.0, 90.0).WithMessage("Latitude must be between -90 and 90 degrees.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180.0, 180.0).WithMessage("Longitude must be between -180 and 180 degrees.");

        RuleFor(x => x.RadiusInKm)
            .GreaterThan(0).WithMessage("Delivery radius must be greater than 0 KM.");
    }
}
