using GPTMini.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace GPTMini.Services;

public interface IOpenAIService
{
    Task<(ChatMessage message, TokenUsage? usage)> GetChatResponseAsync(List<ChatMessage> messages, string? model = null);
    Task<(ChatMessage message, TokenUsage? usage)> GetChatResponseWithFilesAsync(List<ChatMessage> messages, List<IFormFile>? files, string? model = null);
}

public class OpenAIService : IOpenAIService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _apiUrl;

    public OpenAIService(IConfiguration configuration, HttpClient httpClient, ILogger<OpenAIService> logger)
    {
        _configuration = configuration;
        _httpClient = httpClient;
        
        // Try to get API key from different sources
        var apiKeyFromConfig = _configuration["OpenAI:ApiKey"];
        var apiKeyFromEnv = Environment.GetEnvironmentVariable("OPENAI_API_KEY");
        
        _apiKey = apiKeyFromConfig ?? apiKeyFromEnv ?? "";
        _apiUrl = _configuration["OpenAI:ApiUrl"] ?? "https://api.openai.com/v1/chat/completions";
        
        // Log where the API key is coming from
        if (!string.IsNullOrWhiteSpace(_apiKey))
        {
            var source = !string.IsNullOrEmpty(apiKeyFromConfig) ? "appsettings.json" 
                        : !string.IsNullOrEmpty(apiKeyFromEnv) ? "variable de entorno o archivo .env" 
                        : "desconocido";
            logger.LogInformation($"✅ OpenAI API key cargada desde: {source}");
            logger.LogInformation($"   API Key (primeros 10 caracteres): {_apiKey.Substring(0, Math.Min(10, _apiKey.Length))}...");
        }
        else
        {
            logger.LogWarning("⚠️  OpenAI API key NO configurada.");
            logger.LogWarning("   Opciones:");
            logger.LogWarning("   1. Crear archivo .env en el directorio backend con: OPENAI_API_KEY=tu-api-key");
            logger.LogWarning("   2. Usar variable de entorno: $env:OPENAI_API_KEY='tu-api-key'");
            logger.LogWarning("   3. Crear appsettings.Development.json con: OpenAI:ApiKey");
        }
        
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _apiKey);
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    }

    public async Task<(ChatMessage message, TokenUsage? usage)> GetChatResponseAsync(List<ChatMessage> messages, string? model = null)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            throw new Exception("OpenAI API key is not configured. Please set OpenAI:ApiKey in appsettings.json or OPENAI_API_KEY environment variable.");
        }

        var selectedModel = model ?? _configuration["OpenAI:Model"] ?? "gpt-3.5-turbo";

        var requestBody = new
        {
            model = selectedModel,
            messages = messages.Select(m => new { role = m.Role, content = m.Content }).ToArray(),
            temperature = 0.7,
            max_tokens = 1000
        };

        var json = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(_apiUrl, content);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"OpenAI API error ({response.StatusCode}): {responseBody}");
            }

            var responseObject = JsonSerializer.Deserialize<OpenAIResponse>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (responseObject?.Choices == null || responseObject.Choices.Length == 0)
            {
                throw new Exception("No response from OpenAI. Response body: " + responseBody);
            }

            var firstChoice = responseObject.Choices[0];
            if (firstChoice?.Message == null)
            {
                throw new Exception("No message in OpenAI response. Response body: " + responseBody);
            }

            var message = firstChoice.Message;
            var messageContent = message.Content ?? throw new Exception("No content in OpenAI response. Response body: " + responseBody);
            
            if (string.IsNullOrWhiteSpace(messageContent))
            {
                throw new Exception("Empty content in OpenAI response. Response body: " + responseBody);
            }

            var chatMessage = new ChatMessage
            {
                Role = "assistant",
                Content = messageContent
            };

            TokenUsage? tokenUsage = null;
            if (responseObject.Usage != null)
            {
                tokenUsage = new TokenUsage
                {
                    PromptTokens = responseObject.Usage.PromptTokens,
                    CompletionTokens = responseObject.Usage.CompletionTokens,
                    TotalTokens = responseObject.Usage.TotalTokens
                };
            }

            return (chatMessage, tokenUsage);
        }
        catch (HttpRequestException ex)
        {
            throw new Exception($"Failed to connect to OpenAI API: {ex.Message}", ex);
        }
    }

    public async Task<(ChatMessage message, TokenUsage? usage)> GetChatResponseWithFilesAsync(List<ChatMessage> messages, List<IFormFile>? files, string? model = null)
    {
        try
        {
            model ??= _configuration["OpenAI:Model"] ?? "gpt-4o-mini";

            // Construir los mensajes para Vision API
            var openAIMessages = new List<object>();

            // Agregar mensajes históricos
            foreach (var msg in messages.Take(messages.Count - 1))
            {
                openAIMessages.Add(new
                {
                    role = msg.Role,
                    content = msg.Content
                });
            }

            // Último mensaje con imágenes
            var lastMessage = messages.Last();
            var contentParts = new List<object>();

            // Agregar texto
            if (!string.IsNullOrWhiteSpace(lastMessage.Content))
            {
                contentParts.Add(new
                {
                    type = "text",
                    text = lastMessage.Content
                });
            }

            // Agregar imágenes si existen
            if (files != null && files.Count > 0)
            {
                foreach (var file in files)
                {
                    if (file.ContentType.StartsWith("image/"))
                    {
                        using var memoryStream = new MemoryStream();
                        await file.CopyToAsync(memoryStream);
                        var imageBytes = memoryStream.ToArray();
                        var base64Image = Convert.ToBase64String(imageBytes);
                        var dataUrl = $"data:{file.ContentType};base64,{base64Image}";

                        contentParts.Add(new
                        {
                            type = "image_url",
                            image_url = new
                            {
                                url = dataUrl
                            }
                        });
                    }
                    // TODO: Procesar PDFs y DOCX para extraer texto
                }
            }

            openAIMessages.Add(new
            {
                role = "user",
                content = contentParts.ToArray()
            });

            var requestBody = new
            {
                model,
                messages = openAIMessages.ToArray(),
                max_tokens = 4096
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(_apiUrl, content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new Exception($"OpenAI API error ({response.StatusCode}): {errorContent}");
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            var responseObject = JsonSerializer.Deserialize<OpenAIResponse>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (responseObject?.Choices == null || responseObject.Choices.Length == 0)
            {
                throw new Exception($"No choices in OpenAI response. Response: {responseBody}");
            }

            var firstChoice = responseObject.Choices[0];
            if (firstChoice.Message == null)
            {
                throw new Exception($"No message in first choice. Response: {responseBody}");
            }

            var message = firstChoice.Message;
            var messageContent = message.Content ?? throw new Exception("No content in OpenAI response. Response body: " + responseBody);
            
            if (string.IsNullOrWhiteSpace(messageContent))
            {
                throw new Exception("Empty content in OpenAI response. Response body: " + responseBody);
            }

            var chatMessage = new ChatMessage
            {
                Role = "assistant",
                Content = messageContent
            };

            TokenUsage? tokenUsage = null;
            if (responseObject.Usage != null)
            {
                tokenUsage = new TokenUsage
                {
                    PromptTokens = responseObject.Usage.PromptTokens,
                    CompletionTokens = responseObject.Usage.CompletionTokens,
                    TotalTokens = responseObject.Usage.TotalTokens
                };
            }

            return (chatMessage, tokenUsage);
        }
        catch (HttpRequestException ex)
        {
            throw new Exception($"Failed to connect to OpenAI API: {ex.Message}", ex);
        }
    }

    private class OpenAIResponse
    {
        public Choice[]? Choices { get; set; }
        public UsageInfo? Usage { get; set; }
    }

    private class Choice
    {
        public Message? Message { get; set; }
    }

    private class Message
    {
        public string? Content { get; set; }
    }

    private class UsageInfo
    {
        public int PromptTokens { get; set; }
        public int CompletionTokens { get; set; }
        public int TotalTokens { get; set; }
    }
}


