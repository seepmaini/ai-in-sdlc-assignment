using InvoiceApp.Api.Controllers;
using InvoiceApp.Domain;
using Xunit;

namespace InvoiceApp.Tests;

public class ArchitectureTests
{
    [Fact]
    public void Domain_DoesNotReferenceApiLayer()
    {
        var domainReferences = typeof(ApprovalService).Assembly.GetReferencedAssemblies();
        var apiAssemblyName = typeof(ApprovalsController).Assembly.GetName().Name;

        Assert.DoesNotContain(domainReferences, reference => reference.Name == apiAssemblyName);
    }
}
