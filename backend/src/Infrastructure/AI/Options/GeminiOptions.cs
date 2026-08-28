namespace PlataformaSaaS.Infrastructure.AI.Options;

public class GeminiOptions
{
    public const string SectionName = "Gemini";

    public string ApiKey { get; set; } = string.Empty;
    public string EmbeddingModel { get; set; } = "text-embedding-004";
    public string ChatModel { get; set; } = "gemini-1.5-flash";
}
