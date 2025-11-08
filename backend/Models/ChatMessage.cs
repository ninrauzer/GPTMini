namespace GPTMini.Models;

public class ChatMessage
{
    public string Role { get; set; } = string.Empty; // "user" or "assistant"
    public string Content { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}

public class ChatRequest
{
    public List<ChatMessage> Messages { get; set; } = new();
    public string? Model { get; set; }
}

public class ChatResponse
{
    public ChatMessage Message { get; set; } = new();
    public TokenUsage? Usage { get; set; }
}

public class TokenUsage
{
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
    public int TotalTokens { get; set; }
}


