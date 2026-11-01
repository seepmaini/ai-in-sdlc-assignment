using System.Reflection;
using InvoiceApp.Api.Auth;
using InvoiceApp.Api.Controllers;
using InvoiceApp.Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Abstractions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Routing;
using Xunit;

namespace InvoiceApp.Tests;

public class ApprovalsControllerAuthorizationTests
{
    [Theory]
    [InlineData("Manager")]
    [InlineData("Director")]
    [InlineData("Approver")]
    [InlineData("Admin")]
    public void Approve_AllowsApprovalRoles(string role)
    {
        var filter = GetRoleFilter(nameof(ApprovalsController.Approve));
        var context = CreateActionContext(role);

        filter.OnActionExecuting(context);

        Assert.Null(context.Result);
    }

    [Fact]
    public void Approve_RejectsUnauthorizedRole()
    {
        var filter = GetRoleFilter(nameof(ApprovalsController.Approve));
        var context = CreateActionContext("Viewer");

        filter.OnActionExecuting(context);

        var result = Assert.IsType<StatusCodeResult>(context.Result);
        Assert.Equal(StatusCodes.Status403Forbidden, result.StatusCode);
    }

    [Fact]
    public void Reject_RemainsLimitedToApproverAndAdmin()
    {
        var managerContext = CreateActionContext("Manager");
        GetRoleFilter(nameof(ApprovalsController.Reject)).OnActionExecuting(managerContext);

        var managerResult = Assert.IsType<StatusCodeResult>(managerContext.Result);
        Assert.Equal(StatusCodes.Status403Forbidden, managerResult.StatusCode);

        var approverContext = CreateActionContext("Approver");
        GetRoleFilter(nameof(ApprovalsController.Reject)).OnActionExecuting(approverContext);

        Assert.Null(approverContext.Result);
    }

    [Fact]
    public void Approve_PassesSessionRoleToApprovalService()
    {
        var invoice = new Invoice
        {
            Id = "INV-1",
            Amount = 50_000m,
            Status = InvoiceStatus.PendingApproval
        };
        var controller = new ApprovalsController(
            new ApprovalService(new FakeInvoiceRepository(invoice)))
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = CreateHttpContext("Manager")
            }
        };

        var actionResult = controller.Approve("INV-1");

        var result = Assert.IsType<OkObjectResult>(actionResult.Result);
        var approvedInvoice = Assert.IsType<Invoice>(result.Value);
        Assert.Equal(InvoiceStatus.Approved, approvedInvoice.Status);
        Assert.Equal("test.user", approvedInvoice.DecidedBy);
    }

    private static RequireRoleAttribute GetRoleFilter(string actionName) =>
        typeof(ApprovalsController)
            .GetMethod(actionName)!
            .GetCustomAttribute<RequireRoleAttribute>()
        ?? throw new InvalidOperationException($"{actionName} must declare a role filter.");

    private static ActionExecutingContext CreateActionContext(string role)
    {
        var httpContext = CreateHttpContext(role);
        var actionContext = new ActionContext(httpContext, new RouteData(), new ActionDescriptor());

        return new ActionExecutingContext(
            actionContext,
            new List<IFilterMetadata>(),
            new Dictionary<string, object?>(),
            new object());
    }

    private static HttpContext CreateHttpContext(string role)
    {
        var httpContext = new DefaultHttpContext();
        httpContext.Items[HttpContextExtensions.SessionKey] = new UserSession("test.user", role);
        return httpContext;
    }
}
