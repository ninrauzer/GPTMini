using GPTMini.Models;
using GPTMini.Services;
using Microsoft.AspNetCore.Mvc;

namespace GPTMini.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatController : ControllerBase
{
    private readonly IOpenAIService _openAIService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<ChatController> _logger;

    public ChatController(IOpenAIService openAIService, IConfiguration configuration, ILogger<ChatController> logger)
    {
        _openAIService = openAIService;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpGet("config")]
    public ActionResult<ConfigResponse> GetConfig()
    {
        var model = _configuration["OpenAI:Model"] ?? "gpt-3.5-turbo";
        var apiKeyConfigured = !string.IsNullOrWhiteSpace(_configuration["OpenAI:ApiKey"]) 
            || !string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("OPENAI_API_KEY"));
        
        var availableModels = new List<string>
        {
            "gpt-5",
            "gpt-5-mini",
            "gpt-5-nano",
            "gpt-5-chat-latest",
            "gpt-5-codex",
            "gpt-5-pro",
            "gpt-4o",
            "gpt-4o-realtime-preview",
            "gpt-4o-mini",
            "gpt-4-turbo",
            "gpt-4",
            "gpt-3.5-turbo",
            "gpt-3.5-turbo-16k",
            "o1-preview",
            "o1-mini"
        };
        
        return Ok(new ConfigResponse
        {
            Model = model,
            ApiKeyConfigured = apiKeyConfigured,
            AvailableModels = availableModels
        });
    }

    [HttpPost]
    public async Task<ActionResult<ChatResponse>> PostMessage([FromForm] string? messages = null, [FromForm] string? model = null, [FromForm] List<IFormFile>? files = null)
    {
        try
        {
            // Intentar leer como FormData primero
            if (messages != null)
            {
                var messageList = System.Text.Json.JsonSerializer.Deserialize<List<ChatMessage>>(messages);
                if (messageList == null || messageList.Count == 0)
                {
                    return BadRequest("Messages cannot be empty");
                }

                // Si hay archivos de imagen, forzar el uso de un modelo con Vision
                var selectedModel = model;
                if (files != null && files.Any(f => f.ContentType.StartsWith("image/")))
                {
                    // Usar gpt-4o que soporta vision y es más económico que gpt-4-vision-preview
                    selectedModel = "gpt-4o";
                    _logger.LogInformation("Switching to gpt-4o for image processing (has files: {HasFiles})", files?.Count ?? 0);
                }

                var (message, usage) = await _openAIService.GetChatResponseWithFilesAsync(messageList, files, selectedModel);
                
                _logger.LogInformation("Returning response with usage: PromptTokens={PromptTokens}, CompletionTokens={CompletionTokens}, TotalTokens={TotalTokens}", 
                    usage?.PromptTokens ?? 0, usage?.CompletionTokens ?? 0, usage?.TotalTokens ?? 0);
                
                return Ok(new ChatResponse { Message = message, Usage = usage });
            }

            // Si no es FormData, intentar leer como JSON
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();
            
            if (string.IsNullOrWhiteSpace(body))
            {
                return BadRequest("Request body cannot be empty");
            }

            var request = System.Text.Json.JsonSerializer.Deserialize<ChatRequest>(body);
            if (request?.Messages == null || request.Messages.Count == 0)
            {
                return BadRequest("Messages cannot be empty");
            }

            var (msg, usg) = await _openAIService.GetChatResponseAsync(request.Messages, request.Model);
            
            _logger.LogInformation("Returning response with usage: PromptTokens={PromptTokens}, CompletionTokens={CompletionTokens}, TotalTokens={TotalTokens}", 
                usg?.PromptTokens ?? 0, usg?.CompletionTokens ?? 0, usg?.TotalTokens ?? 0);
            
            return Ok(new ChatResponse { Message = msg, Usage = usg });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing chat request: {Message}", ex.Message);
            var errorMessage = ex.Message.Contains("API key") 
                ? "API key no configurada. Por favor configura tu OpenAI API key."
                : $"Error: {ex.Message}";
            return StatusCode(500, new { error = errorMessage, message = ex.Message });
        }
    }
}

public class ConfigResponse
{
    public string Model { get; set; } = string.Empty;
    public bool ApiKeyConfigured { get; set; }
    public List<string> AvailableModels { get; set; } = new();
}


