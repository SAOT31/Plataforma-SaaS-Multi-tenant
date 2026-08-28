using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using Microsoft.Extensions.Options;
using Pgvector;
using PlataformaSaaS.Application.Common.Interfaces;
using PlataformaSaaS.Infrastructure.AI.Options;

namespace PlataformaSaaS.Infrastructure.AI;

public class GeminiEmbeddingService(
    HttpClient httpClient,
    IOptions<GeminiOptions> options) : IEmbeddingService
{
    private readonly GeminiOptions _options = options.Value;

    public async Task<Vector> GenerateEmbeddingAsync(string text, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
        {
            return GenerateDeterministicFallbackVector(text);
        }

        try
        {
            var modelName = string.IsNullOrWhiteSpace(_options.EmbeddingModel) ? "gemini-embedding-001" : _options.EmbeddingModel;
            var url = $"https://generativelanguage.googleapis.com/v1beta/models/{modelName}:embedContent";

            var requestMessage = new HttpRequestMessage(HttpMethod.Post, url);
            requestMessage.Headers.Add("x-goog-api-key", _options.ApiKey);

            var requestBody = new
            {
                model = $"models/{modelName}",
                content = new
                {
                    parts = new[]
                    {
                        new { text }
                    }
                },
                outputDimensionality = 768
            };
            requestMessage.Content = JsonContent.Create(requestBody);

            var response = await httpClient.SendAsync(requestMessage, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return GenerateDeterministicFallbackVector(text);
            }

            var json = await response.Content.ReadFromJsonAsync<JsonObject>(cancellationToken: cancellationToken);
            var valuesNode = json?["embedding"]?["values"]?.AsArray();

            if (valuesNode is null || valuesNode.Count == 0)
            {
                return GenerateDeterministicFallbackVector(text);
            }

            var floats = new float[valuesNode.Count];
            for (var i = 0; i < valuesNode.Count; i++)
            {
                floats[i] = (float)(valuesNode[i]?.GetValue<double>() ?? 0.0);
            }

            return new Vector(floats);
        }
        catch
        {
            return GenerateDeterministicFallbackVector(text);
        }
    }

    private static Vector GenerateDeterministicFallbackVector(string text)
    {
        const int dimension = 768;
        var floats = new float[dimension];
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(text));

        for (var i = 0; i < dimension; i++)
        {
            var byteVal = hash[i % hash.Length];
            floats[i] = (byteVal / 127.5f) - 1.0f;
        }

        var sumSq = floats.Sum(f => f * f);
        var norm = (float)Math.Sqrt(sumSq);
        if (norm > 0)
        {
            for (var i = 0; i < dimension; i++)
            {
                floats[i] /= norm;
            }
        }

        return new Vector(floats);
    }
}
