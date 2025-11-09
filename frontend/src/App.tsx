import { useState, useEffect, useRef } from 'react'
import ChatWindow from './components/ChatWindow'
import InputBar from './components/InputBar'
import StatusBar from './components/StatusBar'
import { ChatHistorySidebar } from './components/ChatHistorySidebar'
import { useChat } from './hooks/useChat'
import { useTokenUsage } from './hooks/useTokenUsage'
import { useChatHistory } from './hooks/useChatHistory'

function App() {
  const [selectedModel, setSelectedModel] = useState<string>('gpt-3.5-turbo')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { totalTokens, totalPromptTokens, totalCompletionTokens, addTokenUsage, resetTokenUsage } = useTokenUsage()
  const { messages, sendMessage, isLoading, setMessages } = useChat({ onTokenUsage: addTokenUsage, model: selectedModel })
  const [showExportMenu, setShowExportMenu] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Chat history hook
  const {
    chats,
    currentChatId,
    createNewChat,
    loadChat,
    updateCurrentChat,
    deleteChat,
    renameChat,
  } = useChatHistory()

  // Auto-guardar mensajes en el chat actual
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      updateCurrentChat({
        messages,
        totalTokens,
        model: selectedModel,
      })
    }
  }, [messages, currentChatId, totalTokens, selectedModel, updateCurrentChat])

  // Manejar creación de nuevo chat
  const handleNewChat = () => {
    createNewChat(selectedModel)
    setMessages([])
    resetTokenUsage()
    setSidebarOpen(false)
  }

  // Manejar selección de chat
  const handleSelectChat = (chatId: string) => {
    const chat = loadChat(chatId)
    if (chat) {
      setMessages(chat.messages)
      setSelectedModel(chat.model)
      resetTokenUsage()
      // Recalcular tokens si es necesario
      // Note: esto es una aproximación, los tokens reales vendrán del uso
    }
    setSidebarOpen(false)
  }

  // Manejar eliminación de chat
  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId)
    if (chatId === currentChatId) {
      setMessages([])
      resetTokenUsage()
    }
  }

  // Crear primer chat si no existe ninguno
  useEffect(() => {
    if (chats.length === 0 && !currentChatId) {
      createNewChat(selectedModel)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // Load initial model from config
    fetch('/api/chat/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.model) {
          setSelectedModel(data.model)
        }
      })
      .catch((err) => console.error('Error loading config:', err))
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false)
      }
    }

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showExportMenu])

  const exportAsText = () => {
    const timestamp = new Date().toLocaleString('es-ES', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    let content = `Chat exportado - GPTMini\n`
    content += `Fecha: ${timestamp}\n`
    content += `Modelo: ${selectedModel}\n`
    content += `Total de mensajes: ${messages.length}\n`
    content += `Tokens usados: ${totalTokens}\n`
    content += `${'='.repeat(60)}\n\n`
    
    messages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'Usuario' : 'Asistente'
      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''
      content += `[${index + 1}] ${role}${time ? ` (${time})` : ''}:\n`
      content += `${msg.content}\n\n`
      content += `${'-'.repeat(60)}\n\n`
    })
    
    downloadFile(content, `chat-${Date.now()}.txt`, 'text/plain')
    setShowExportMenu(false)
  }

  const exportAsMarkdown = () => {
    const timestamp = new Date().toLocaleString('es-ES', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    
    let content = `# Chat exportado - GPTMini\n\n`
    content += `**Fecha:** ${timestamp}  \n`
    content += `**Modelo:** ${selectedModel}  \n`
    content += `**Total de mensajes:** ${messages.length}  \n`
    content += `**Tokens usados:** ${totalTokens}  \n\n`
    content += `---\n\n`
    
    messages.forEach((msg) => {
      const role = msg.role === 'user' ? '👤 Usuario' : '🤖 Asistente'
      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''
      content += `## ${role}${time ? ` _(${time})_` : ''}\n\n`
      content += `${msg.content}\n\n`
      content += `---\n\n`
    })
    
    downloadFile(content, `chat-${Date.now()}.md`, 'text/markdown')
    setShowExportMenu(false)
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <ChatHistorySidebar
        chats={chats}
        currentChatId={currentChatId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={renameChat}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">GPTMini</h1>
          {messages.length > 0 && (
            <div className="relative" ref={exportMenuRef}>
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
                title="Exportar chat"
              >
                <span>📥</span>
                <span className="text-sm font-medium">Exportar</span>
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-10">
                  <button
                    onClick={exportAsText}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 flex items-center space-x-3"
                  >
                    <span>📄</span>
                    <div>
                      <div className="font-medium text-sm">Texto plano</div>
                      <div className="text-xs text-gray-500">.txt</div>
                    </div>
                  </button>
                  <button
                    onClick={exportAsMarkdown}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors text-gray-700 flex items-center space-x-3 border-t border-gray-100"
                  >
                    <span>📝</span>
                    <div>
                      <div className="font-medium text-sm">Markdown</div>
                      <div className="text-xs text-gray-500">.md (con formato)</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <ChatWindow messages={messages} isLoading={isLoading} />
        <InputBar onSendMessage={sendMessage} disabled={isLoading} />
        <StatusBar 
          totalTokens={totalTokens}
          promptTokens={totalPromptTokens}
          completionTokens={totalCompletionTokens}
          onReset={resetTokenUsage}
          currentModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>
    </div>
  )
}

export default App


