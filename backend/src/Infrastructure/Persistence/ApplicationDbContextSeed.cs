using Microsoft.EntityFrameworkCore;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Domain.Entities;
using PlataformaSaaS.Domain.Enums;
using PlataformaSaaS.Infrastructure.Persistence;

namespace PlataformaSaaS.Infrastructure.Persistence;

public static class ApplicationDbContextSeed
{
    public static async Task SeedInitialDataAsync(
        ApplicationDbContext context,
        IPasswordHasher passwordHasher,
        IEmbeddingService embeddingService,
        CancellationToken cancellationToken = default)
    {
        var tenant1Id = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var tenant2Id = Guid.Parse("22222222-2222-2222-2222-222222222222");

        if (!await context.Tenants.AnyAsync(t => t.Id == tenant1Id, cancellationToken))
        {
            context.Tenants.Add(new Tenant
            {
                Id = tenant1Id,
                Name = "TechNova Solutions",
                AllowedDomain = "*",
                WidgetApiKey = "tech_key_889210_live",
                IsActive = true
            });
        }

        if (!await context.Tenants.AnyAsync(t => t.Id == tenant2Id, cancellationToken))
        {
            context.Tenants.Add(new Tenant
            {
                Id = tenant2Id,
                Name = "Apex Global Store",
                AllowedDomain = "*",
                WidgetApiKey = "apex_key_334911_live",
                IsActive = true
            });
        }

        await context.SaveChangesAsync(cancellationToken);

        if (!await context.Users.AnyAsync(u => u.Email == "admin@technova.com", cancellationToken))
        {
            context.Users.Add(new User
            {
                TenantId = tenant1Id,
                FullName = "Elena Rostova",
                Email = "admin@technova.com",
                PasswordHash = passwordHasher.HashPassword("Password123!"),
                Role = UserRole.Admin,
                IsActive = true
            });
        }

        if (!await context.Users.AnyAsync(u => u.Email == "agent@technova.com", cancellationToken))
        {
            context.Users.Add(new User
            {
                TenantId = tenant1Id,
                FullName = "Alex Mercer",
                Email = "agent@technova.com",
                PasswordHash = passwordHasher.HashPassword("Password123!"),
                Role = UserRole.Agent,
                IsActive = true
            });
        }

        if (!await context.Users.AnyAsync(u => u.Email == "admin@apexstore.com", cancellationToken))
        {
            context.Users.Add(new User
            {
                TenantId = tenant2Id,
                FullName = "Marcus Vance",
                Email = "admin@apexstore.com",
                PasswordHash = passwordHasher.HashPassword("Password123!"),
                Role = UserRole.Admin,
                IsActive = true
            });
        }

        await context.SaveChangesAsync(cancellationToken);

        var standardFaqs = new (string Title, string Category, string Content)[]
        {
            (
                "Refund and Cancellation Policy / Política de Reembolsos",
                "Billing & Subscriptions",
                "You can request a full refund within 14 days of your purchase. Subscriptions can be cancelled anytime from the Billing section. Refunds take 3 to 5 business days to process back to your original payment method. / Puedes solicitar un reembolso completo dentro de los 14 días posteriores a la compra. Los reembolsos tardan de 3 a 5 días hábiles en procesarse."
            ),
            (
                "How to reset your account password / Cómo restablecer la contraseña",
                "Account & Security",
                "To reset your password, click on the 'Forgot Password' link on the login page. An email with a secure verification link will be sent to your registered email address. The link expires after 15 minutes. / Para restablecer tu contraseña, haz clic en 'Olvidé mi contraseña' en la pantalla de inicio de sesión."
            ),
            (
                "Invoices, Tax Receipts and Billing / Facturas y Recibos",
                "Billing & Subscriptions",
                "Download monthly invoices and official tax receipts directly from Settings > Billing > Invoices. You can export as PDF or CSV with your corporate tax ID. / Descarga tus facturas y recibos tributarios desde Configuración > Facturación en formato PDF o CSV."
            ),
            (
                "API Rate Limits and Quotas / Límites de la API",
                "Technical & Developers",
                "The standard tier allows up to 120 requests per minute per API key. If you exceed this threshold, the API returns HTTP 429 Too Many Requests. Enterprise tiers support up to 5,000 requests per minute."
            ),
            (
                "¿Cuál es la política de devoluciones y cómo solicito un reembolso?",
                "Facturación y Pagos",
                "Aceptamos devoluciones dentro de los 30 días posteriores a la recepción de su pedido, siempre y cuando el artículo no haya sido usado y se encuentre en su embalaje original. Para solicitar una devolución, inicie sesión en su cuenta, vaya a 'Mis Pedidos', seleccione el artículo y haga clic en 'Solicitar Devolución'. Una vez que recibamos el producto en nuestras bodegas, el reembolso se procesará automáticamente a su método de pago original en un plazo de 5 a 7 días hábiles. Los gastos de envío originales no son reembolsables a menos que el producto haya llegado defectuoso."
            ),
            (
                "Tiempos de envío, mensajería y costos de entrega",
                "Logística y Envíos",
                "Ofrecemos dos métodos principales de envío: Envío Estándar (3 a 5 días hábiles) y Envío Express (1 a 2 días hábiles). El envío estándar es gratuito para pedidos superiores a $50 dólares. Para pedidos menores a ese monto, el costo fijo es de $5.99. Todos nuestros envíos se realizan a través de FedEx y UPS. Una vez que su pedido sea despachado, recibirá un correo electrónico automático con el número de guía para que pueda rastrear su paquete en tiempo real. Tenga en cuenta que no realizamos entregas en días feriados nacionales."
            ),
            (
                "¿Qué hago si olvidé mi contraseña o mi cuenta está bloqueada?",
                "Soporte Técnico",
                "Si olvidó su contraseña, vaya a la página de inicio de sesión y haga clic en '¿Olvidaste tu contraseña?'. Ingrese el correo electrónico asociado a su cuenta y le enviaremos un enlace seguro para restablecerla. Este enlace caduca en 24 horas por motivos de seguridad. Si ingresa la contraseña incorrecta más de 5 veces consecutivas, su cuenta se bloqueará temporalmente durante 30 minutos. Si necesita desbloqueo inmediato, por favor contacte a nuestro equipo de soporte enviando un ticket con el asunto 'Desbloqueo de Cuenta'."
            )
        };

        foreach (var (title, category, content) in standardFaqs)
        {
            var existing = await context.KnowledgeBaseArticles
                .FirstOrDefaultAsync(a => a.TenantId == tenant1Id && a.Title == title, cancellationToken);

            if (existing is null)
            {
                var textToEmbed = $"{title}\n{category}\n{content}";
                var embedding = await embeddingService.GenerateEmbeddingAsync(textToEmbed, cancellationToken);

                context.KnowledgeBaseArticles.Add(new KnowledgeBaseArticle
                {
                    TenantId = tenant1Id,
                    Title = title,
                    Category = category,
                    Content = content,
                    Embedding = embedding,
                    IsPublished = true
                });
            }
        }

        await context.SaveChangesAsync(cancellationToken);
    }
}
