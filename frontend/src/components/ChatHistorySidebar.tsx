import { useState, useMemo } from 'react'
import { Chat } from '../services/chatStorage'

interface ChatHistorySidebarProps {
  chats: Chat[]
  currentChatId: string | null
  onSelectChat: (chatId: string) => void
  onNewChat: () => void
  onDeleteChat: (chatId: string) => void
  onRenameChat: (chatId: string, newTitle: string) => void
  isOpen: boolean
  onToggle: () => void
}

interface GroupedChats {
  today: Chat[]
  yesterday: Chat[]
  thisWeek: Chat[]
  older: Chat[]
}

export const ChatHistorySidebar = ({
  chats,
  currentChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  isOpen,
  onToggle,
}: ChatHistorySidebarProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  // Agrupar chats por fecha
  const groupedChats = useMemo((): GroupedChats => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const thisWeek = new Date(today)
    thisWeek.setDate(thisWeek.getDate() - 7)

    const filtered = searchQuery
      ? chats.filter((chat) =>
          chat.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : chats

    return filtered.reduce(
      (acc, chat) => {
        const chatDate = new Date(chat.updatedAt)
        if (chatDate >= today) {
          acc.today.push(chat)
        } else if (chatDate >= yesterday) {
          acc.yesterday.push(chat)
        } else if (chatDate >= thisWeek) {
          acc.thisWeek.push(chat)
        } else {
          acc.older.push(chat)
        }
        return acc
      },
      { today: [], yesterday: [], thisWeek: [], older: [] } as GroupedChats
    )
  }, [chats, searchQuery])

  const handleRename = (chatId: string, currentTitle: string) => {
    setEditingId(chatId)
    setEditTitle(currentTitle)
  }

  const handleSaveRename = (chatId: string) => {
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim())
    }
    setEditingId(null)
    setEditTitle('')
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setEditTitle('')
  }

  const handleDelete = (chatId: string, title: string) => {
    if (confirm(`¿Eliminar "${title}"?`)) {
      onDeleteChat(chatId)
    }
  }

  const renderChatItem = (chat: Chat) => {
    const isActive = chat.id === currentChatId
    const isEditing = editingId === chat.id

    return (
      <div
        key={chat.id}
        className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
          isActive
            ? 'bg-blue-500 text-white'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => handleSaveRename(chat.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveRename(chat.id)
              if (e.key === 'Escape') handleCancelRename()
            }}
            className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"
            autoFocus
          />
        ) : (
          <>
            <div
              onClick={() => onSelectChat(chat.id)}
              className="flex-1 overflow-hidden"
            >
              <div className="text-sm font-medium truncate">{chat.title}</div>
              <div className="text-xs opacity-70">
                {chat.messages.length} mensaje{chat.messages.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="hidden group-hover:flex gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleRename(chat.id, chat.title)
                }}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                title="Renombrar"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(chat.id, chat.title)
                }}
                className="p-1 hover:bg-red-500 hover:text-white rounded"
                title="Eliminar"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  const renderGroup = (title: string, groupChats: Chat[]) => {
    if (groupChats.length === 0) return null

    return (
      <div className="mb-4">
        <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
          {title}
        </h3>
        <div className="space-y-1">{groupChats.map(renderChatItem)}</div>
      </div>
    )
  }

  return (
    <>
      {/* Botón toggle para móvil */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        title={isOpen ? 'Cerrar historial' : 'Abrir historial'}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </button>

      {/* Sidebar */}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onNewChat}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nuevo Chat
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            placeholder="Buscar chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto p-4">
          {chats.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p className="text-sm">No hay chats guardados</p>
              <p className="text-xs mt-2">Inicia un nuevo chat para comenzar</p>
            </div>
          ) : (
            <>
              {renderGroup('Hoy', groupedChats.today)}
              {renderGroup('Ayer', groupedChats.yesterday)}
              {renderGroup('Esta semana', groupedChats.thisWeek)}
              {renderGroup('Más antiguo', groupedChats.older)}
            </>
          )}
        </div>
      </div>

      {/* Overlay para móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  )
}
