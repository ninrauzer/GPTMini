# GPTMini - Backend

Backend API for GPTMini application built with ASP.NET Core.

## Setup

1. Install .NET 8.0 SDK
2. Copy `.env` file and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your-actual-api-key-here
   ```
3. Install dependencies:
   ```bash
   dotnet restore
   ```
4. Run the application:
   ```bash
   dotnet run
   ```

The API will be available at `https://localhost:5001` or `http://localhost:5000`.

## Configuration

- API key can be set via `.env` file or environment variable `OPENAI_API_KEY`
- Default model is `gpt-3.5-turbo` (configurable in `appsettings.json`)
- CORS is configured to allow requests from `http://localhost:5173` and `http://localhost:3000`

## API Endpoints

### POST /api/chat
Send a chat message and receive a response from OpenAI.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ]
}
```

**Response:**
```json
{
  "message": {
    "role": "assistant",
    "content": "I'm doing well, thank you for asking!",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```


