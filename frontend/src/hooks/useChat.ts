import { useState, useCallback } from 'react'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

interface ChatRequest {
  messages: ChatMessage[]
  model?: string
}

interface ChatResponse {
  message: ChatMessage
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface TokenUsageCallback {
  (usage: { promptTokens: number; completionTokens: number; totalTokens: number } | null | undefined): void
}

interface UseChatOptions {
  onTokenUsage?: TokenUsageCallback
  model?: string
}

export const useChat = (options?: UseChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    // Add user message immediately and capture updated messages
    let updatedMessages: ChatMessage[] = []
    setMessages((prev) => {
      updatedMessages = [...prev, userMessage]
      return updatedMessages
    })
    setIsLoading(true)

    try {
      const requestBody: ChatRequest = {
        messages: updatedMessages.map(({ role, content }) => ({
          role,
          content,
        })),
        model: options?.model,
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMsg = errorData.error || errorData.message || 'Error al comunicarse con el servidor'
        throw new Error(errorMsg)
      }

      const data: ChatResponse = await response.json()
      const assistantMessage: ChatMessage = {
        ...data.message,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      // Notify about token usage
      if (options?.onTokenUsage && data.usage) {
        console.log('Token usage received:', data.usage)
        options.onTokenUsage(data.usage)
      } else {
        console.log('No token usage data or callback:', { hasCallback: !!options?.onTokenUsage, hasUsage: !!data.usage, usage: data.usage })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      let errorContent = 'Lo siento, ocurrió un error. Por favor intenta de nuevo.'
      
      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorContent = '🔑 Error: API key no configurada. Por favor configura tu OpenAI API key en el backend. Consulta CONFIGURAR_API_KEY.md para más información.'
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorContent = '🌐 Error de conexión: No se pudo conectar al servidor. Asegúrate de que el backend esté ejecutándose.'
        } else {
          errorContent = `❌ Error: ${error.message}`
        }
      }
      
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [options?.model, options?.onTokenUsage])

  return {
    messages,
    sendMessage,
    isLoading,
    setMessages,
    clearMessages: () => setMessages([]),
  }
}


