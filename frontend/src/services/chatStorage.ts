import { ChatMessage } from '../hooks/useChat'

export interface Chat {
  id: string
  title: string
  messages: ChatMessage[]
  model: string
  totalTokens: number
  createdAt: string
  updatedAt: string
  folder?: string | null
}

export interface ChatHistory {
  version: string
  currentChatId: string | null
  chats: Chat[]
  settings: {
    maxChatsInHistory: number
    autoSaveEnabled: boolean
    autoDeleteAfterDays: number
  }
}

const STORAGE_KEY = 'gptmini-chat-history'
const DEFAULT_HISTORY: ChatHistory = {
  version: '1.0',
  currentChatId: null,
  chats: [],
  settings: {
    maxChatsInHistory: 100,
    autoSaveEnabled: true,
    autoDeleteAfterDays: 30,
  },
}

class ChatStorageService {
  /**
   * Obtiene el historial completo de chats desde LocalStorage
   */
  getHistory(): ChatHistory {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return DEFAULT_HISTORY

      const parsed = JSON.parse(stored) as ChatHistory
      return {
        ...DEFAULT_HISTORY,
        ...parsed,
        settings: {
          ...DEFAULT_HISTORY.settings,
          ...parsed.settings,
        },
      }
    } catch (error) {
      console.error('Error loading chat history:', error)
      return DEFAULT_HISTORY
    }
  }

  /**
   * Guarda el historial completo en LocalStorage
   */
  saveHistory(history: ChatHistory): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
      console.error('Error saving chat history:', error)
      // Si hay error de cuota, intentar limpiar chats antiguos
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.cleanOldChats()
        // Reintentar
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
        } catch (retryError) {
          console.error('Error saving after cleanup:', retryError)
          throw new Error('No hay suficiente espacio para guardar el chat')
        }
      }
    }
  }

  /**
   * Obtiene todos los chats
   */
  getAllChats(): Chat[] {
    const history = this.getHistory()
    return history.chats
  }

  /**
   * Obtiene un chat por ID
   */
  getChat(chatId: string): Chat | null {
    const history = this.getHistory()
    return history.chats.find((chat) => chat.id === chatId) || null
  }

  /**
   * Crea un nuevo chat
   */
  createChat(messages: ChatMessage[] = [], model: string = 'gpt-4o-mini'): Chat {
    const now = new Date().toISOString()
    const newChat: Chat = {
      id: this.generateId(),
      title: this.generateTitle(messages),
      messages,
      model,
      totalTokens: 0,
      createdAt: now,
      updatedAt: now,
      folder: null,
    }

    const history = this.getHistory()
    history.chats.unshift(newChat) // Agregar al inicio
    history.currentChatId = newChat.id

    // Limitar número de chats
    if (history.chats.length > history.settings.maxChatsInHistory) {
      history.chats = history.chats.slice(0, history.settings.maxChatsInHistory)
    }

    this.saveHistory(history)
    return newChat
  }

  /**
   * Actualiza un chat existente
   */
  updateChat(chatId: string, updates: Partial<Omit<Chat, 'id' | 'createdAt'>>): Chat | null {
    const history = this.getHistory()
    const chatIndex = history.chats.findIndex((chat) => chat.id === chatId)

    if (chatIndex === -1) return null

    const currentChat = history.chats[chatIndex]
    
    // Auto-generar título si el chat tenía "Nuevo chat" y ahora tiene mensajes
    let finalUpdates = { ...updates }
    if (updates.messages && updates.messages.length > 0) {
      if (currentChat.title === 'Nuevo chat' || currentChat.messages.length === 0) {
        finalUpdates.title = this.generateTitle(updates.messages)
      }
    }

    const updatedChat = {
      ...currentChat,
      ...finalUpdates,
      updatedAt: new Date().toISOString(),
    }

    history.chats[chatIndex] = updatedChat
    this.saveHistory(history)
    return updatedChat
  }

  /**
   * Elimina un chat
   */
  deleteChat(chatId: string): boolean {
    const history = this.getHistory()
    const initialLength = history.chats.length
    history.chats = history.chats.filter((chat) => chat.id !== chatId)

    if (history.currentChatId === chatId) {
      history.currentChatId = history.chats[0]?.id || null
    }

    this.saveHistory(history)
    return history.chats.length < initialLength
  }

  /**
   * Establece el chat actual
   */
  setCurrentChat(chatId: string | null): void {
    const history = this.getHistory()
    history.currentChatId = chatId
    this.saveHistory(history)
  }

  /**
   * Obtiene el ID del chat actual
   */
  getCurrentChatId(): string | null {
    const history = this.getHistory()
    return history.currentChatId
  }

  /**
   * Busca chats por título o contenido
   */
  searchChats(query: string): Chat[] {
    const history = this.getHistory()
    const lowerQuery = query.toLowerCase()

    return history.chats.filter((chat) => {
      // Buscar en título
      if (chat.title.toLowerCase().includes(lowerQuery)) return true

      // Buscar en mensajes
      return chat.messages.some((msg) =>
        msg.content.toLowerCase().includes(lowerQuery)
      )
    })
  }

  /**
   * Limpia chats antiguos según configuración
   */
  cleanOldChats(): void {
    const history = this.getHistory()
    const { autoDeleteAfterDays } = history.settings

    if (autoDeleteAfterDays <= 0) return

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - autoDeleteAfterDays)

    history.chats = history.chats.filter((chat) => {
      const chatDate = new Date(chat.updatedAt)
      return chatDate >= cutoffDate
    })

    this.saveHistory(history)
  }

  /**
   * Exporta todo el historial como JSON
   */
  exportHistory(): string {
    const history = this.getHistory()
    return JSON.stringify(history, null, 2)
  }

  /**
   * Importa historial desde JSON
   */
  importHistory(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString) as ChatHistory
      
      // Validar estructura básica
      if (!imported.version || !Array.isArray(imported.chats)) {
        throw new Error('Invalid history format')
      }

      this.saveHistory(imported)
      return true
    } catch (error) {
      console.error('Error importing history:', error)
      return false
    }
  }

  /**
   * Limpia todo el historial
   */
  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY)
  }

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Genera un título automático basado en el primer mensaje
   */
  private generateTitle(messages: ChatMessage[]): string {
    if (messages.length === 0) return 'Nuevo chat'

    const firstUserMessage = messages.find((msg) => msg.role === 'user')
    if (!firstUserMessage) return 'Nuevo chat'

    // Tomar las primeras palabras del mensaje
    const words = firstUserMessage.content.trim().split(/\s+/)
    const title = words.slice(0, 6).join(' ')
    
    return title.length < firstUserMessage.content.length
      ? `${title}...`
      : title
  }

  /**
   * Obtiene el tamaño aproximado del almacenamiento usado
   */
  getStorageSize(): number {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? new Blob([stored]).size : 0
  }

  /**
   * Obtiene el tamaño en formato legible
   */
  getStorageSizeFormatted(): string {
    const bytes = this.getStorageSize()
    if (bytes < 1024) return `${bytes} bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }
}

// Exportar instancia singleton
export const chatStorage = new ChatStorageService()
