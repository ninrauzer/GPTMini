import { useState, useCallback, useEffect } from 'react'
import { chatStorage, Chat } from '../services/chatStorage'

interface UseChatHistoryReturn {
  chats: Chat[]
  currentChatId: string | null
  currentChat: Chat | null
  createNewChat: (model?: string) => Chat
  loadChat: (chatId: string) => Chat | null
  updateCurrentChat: (updates: Partial<Omit<Chat, 'id' | 'createdAt'>>) => void
  deleteChat: (chatId: string) => void
  renameChat: (chatId: string, newTitle: string) => void
  searchChats: (query: string) => Chat[]
  exportHistory: () => string
  importHistory: (jsonString: string) => boolean
  clearAllHistory: () => void
  storageSize: string
  refreshChats: () => void
}

export const useChatHistory = (): UseChatHistoryReturn => {
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)

  // Cargar historial inicial
  useEffect(() => {
    const history = chatStorage.getHistory()
    setChats(history.chats)
    setCurrentChatId(history.currentChatId)
  }, [])

  // Refrescar la lista de chats
  const refreshChats = useCallback(() => {
    const history = chatStorage.getHistory()
    setChats(history.chats)
    setCurrentChatId(history.currentChatId)
  }, [])

  // Crear nuevo chat
  const createNewChat = useCallback((model: string = 'gpt-4o-mini') => {
    const newChat = chatStorage.createChat([], model)
    setChats(chatStorage.getAllChats())
    setCurrentChatId(newChat.id)
    return newChat
  }, [])

  // Cargar un chat específico
  const loadChat = useCallback((chatId: string) => {
    const chat = chatStorage.getChat(chatId)
    if (chat) {
      chatStorage.setCurrentChat(chatId)
      setCurrentChatId(chatId)
    }
    return chat
  }, [])

  // Actualizar el chat actual
  const updateCurrentChat = useCallback((updates: Partial<Omit<Chat, 'id' | 'createdAt'>>) => {
    if (!currentChatId) return

    chatStorage.updateChat(currentChatId, updates)
    setChats(chatStorage.getAllChats())
  }, [currentChatId])

  // Eliminar un chat
  const deleteChat = useCallback((chatId: string) => {
    const success = chatStorage.deleteChat(chatId)
    if (success) {
      const newCurrentId = chatStorage.getCurrentChatId()
      setChats(chatStorage.getAllChats())
      setCurrentChatId(newCurrentId)
    }
  }, [])

  // Renombrar un chat
  const renameChat = useCallback((chatId: string, newTitle: string) => {
    chatStorage.updateChat(chatId, { title: newTitle })
    setChats(chatStorage.getAllChats())
  }, [])

  // Buscar chats
  const searchChats = useCallback((query: string) => {
    return chatStorage.searchChats(query)
  }, [])

  // Exportar historial
  const exportHistory = useCallback(() => {
    return chatStorage.exportHistory()
  }, [])

  // Importar historial
  const importHistory = useCallback((jsonString: string) => {
    const success = chatStorage.importHistory(jsonString)
    if (success) {
      refreshChats()
    }
    return success
  }, [refreshChats])

  // Limpiar todo el historial
  const clearAllHistory = useCallback(() => {
    chatStorage.clearHistory()
    setChats([])
    setCurrentChatId(null)
  }, [])

  // Obtener chat actual
  const currentChat = currentChatId ? chats.find(c => c.id === currentChatId) || null : null

  return {
    chats,
    currentChatId,
    currentChat,
    createNewChat,
    loadChat,
    updateCurrentChat,
    deleteChat,
    renameChat,
    searchChats,
    exportHistory,
    importHistory,
    clearAllHistory,
    storageSize: chatStorage.getStorageSizeFormatted(),
    refreshChats,
  }
}
