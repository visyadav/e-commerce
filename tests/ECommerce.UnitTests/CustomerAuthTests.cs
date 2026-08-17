using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using ECommerce.Api.Modules.Authentication.DTOs;
using ECommerce.Api.Modules.Authentication.Mappings;
using ECommerce.Api.Modules.Authentication.Services;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using ECommerce.Infrastructure.Identity;
using ECommerce.Shared.Constants;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Xunit;

namespace ECommerce.UnitTests;

public class CustomerAuthTests
{
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Mock<RoleManager<IdentityRole>> _roleManagerMock;
    private readonly Mock<IJwtTokenService> _jwtTokenServiceMock;
    private readonly Mock<IUnitOfWork> _unitOfWorkMock;
    private readonly Mock<ILogger<AuthService>> _loggerMock;
    private readonly IMapper _mapper;

    public CustomerAuthTests()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();
        _userManagerMock = new Mock<UserManager<ApplicationUser>>(store.Object, null!, null!, null!, null!, null!, null!, null!, null!);

        var roleStore = new Mock<IRoleStore<IdentityRole>>();
        _roleManagerMock = new Mock<RoleManager<IdentityRole>>(roleStore.Object, null!, null!, null!, null!);

        _jwtTokenServiceMock = new Mock<IJwtTokenService>();
        _unitOfWorkMock = new Mock<IUnitOfWork>();
        _loggerMock = new Mock<ILogger<AuthService>>();

        var mapperMock = new Mock<IMapper>();
        mapperMock.Setup(m => m.Map<ApplicationUser>(It.IsAny<CustomerRegisterRequest>()))
            .Returns((CustomerRegisterRequest req) => new ApplicationUser
            {
                UserName = req.PhoneNumber,
                PhoneNumber = req.PhoneNumber,
                FirstName = req.FirstName,
                LastName = req.LastName,
                Email = req.Email
            });
        _mapper = mapperMock.Object;
    }

    [Fact]
    public async Task RegisterCustomerAsync_WithValidPhoneNumber_ShouldSucceedAndAssignCustomerRole()
    {
        // Arrange
        var jwtSettings = Options.Create(new JwtSettings
        {
            Secret = "SuperSecretKeyForTestingJwtTokenGeneration12345!",
            AccessTokenExpirationMinutes = 60,
            RefreshTokenExpirationDays = 7
        });

        var usersList = new List<ApplicationUser>();
        var asyncUsers = new TestAsyncEnumerable<ApplicationUser>(usersList);

        _userManagerMock.Setup(u => u.Users).Returns(asyncUsers);
        _userManagerMock.Setup(u => u.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);
        _roleManagerMock.Setup(r => r.RoleExistsAsync(AppConstants.Roles.Customer))
            .ReturnsAsync(true);
        _userManagerMock.Setup(u => u.AddToRoleAsync(It.IsAny<ApplicationUser>(), AppConstants.Roles.Customer))
            .ReturnsAsync(IdentityResult.Success);
        _userManagerMock.Setup(u => u.GetRolesAsync(It.IsAny<ApplicationUser>()))
            .ReturnsAsync(new List<string> { AppConstants.Roles.Customer });

        _jwtTokenServiceMock.Setup(j => j.GenerateAccessToken(It.IsAny<ApplicationUser>(), It.IsAny<IList<string>>()))
            .Returns("fake-jwt-token");
        _jwtTokenServiceMock.Setup(j => j.GenerateRefreshToken())
            .Returns("fake-refresh-token");

        var repoMock = new Mock<IRepository<RefreshToken>>();
        _unitOfWorkMock.Setup(u => u.Repository<RefreshToken>()).Returns(repoMock.Object);

        var authService = new AuthService(
            _userManagerMock.Object,
            _roleManagerMock.Object,
            _jwtTokenServiceMock.Object,
            _mapper,
            _unitOfWorkMock.Object,
            jwtSettings,
            _loggerMock.Object);

        var request = new CustomerRegisterRequest
        {
            PhoneNumber = "+1234567890",
            Password = "Password123!",
            FirstName = "John",
            LastName = "Doe",
            Email = null
        };

        // Act
        var result = await authService.RegisterCustomerAsync(request, CancellationToken.None);

        // Assert
        result.Success.Should().BeTrue();
        result.Data.Should().NotBeNull();
        result.Data!.AccessToken.Should().Be("fake-jwt-token");
        result.Data.Roles.Should().Contain(AppConstants.Roles.Customer);

        _userManagerMock.Verify(u => u.AddToRoleAsync(It.IsAny<ApplicationUser>(), AppConstants.Roles.Customer), Times.Once);
    }
}

internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
{
    private readonly IQueryProvider _inner;

    internal TestAsyncQueryProvider(IQueryProvider inner) => _inner = inner;

    public IQueryable CreateQuery(Expression expression) => new TestAsyncEnumerable<TEntity>(expression);

    public IQueryable<TElement> CreateQuery<TElement>(Expression expression) => new TestAsyncEnumerable<TElement>(expression);

    public object? Execute(Expression expression) => _inner.Execute(expression);

    public TResult Execute<TResult>(Expression expression) => _inner.Execute<TResult>(expression);

    public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default)
    {
        var expectedResultType = typeof(TResult).GetGenericArguments()[0];
        var executionResult = ((IQueryProvider)this).Execute(expression);

        return (TResult)typeof(Task).GetMethod(nameof(Task.FromResult))!
            .MakeGenericMethod(expectedResultType)
            .Invoke(null, new[] { executionResult })!;
    }
}

internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
{
    public TestAsyncEnumerable(IEnumerable<T> enumerable) : base(enumerable) { }
    public TestAsyncEnumerable(Expression expression) : base(expression) { }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
        => new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());

    IQueryProvider IQueryable.Provider => new TestAsyncQueryProvider<T>(this);
}

internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _inner;
    public TestAsyncEnumerator(IEnumerator<T> inner) => _inner = inner;
    public T Current => _inner.Current;
    public ValueTask<bool> MoveNextAsync() => ValueTask.FromResult(_inner.MoveNext());
    public ValueTask DisposeAsync() { _inner.Dispose(); return ValueTask.CompletedTask; }
}
