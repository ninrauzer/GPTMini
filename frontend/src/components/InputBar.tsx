import { useState, KeyboardEvent, useRef, useEffect, ClipboardEvent, DragEvent } from 'react'
import FileAttachment, { AttachedFile } from './FileAttachment'

interface InputBarProps {
  onSendMessage: (message: string, files?: File[]) => void
  disabled: boolean
}

const InputBar = ({ onSendMessage, disabled }: InputBarProps) => {
  const [input, setInput] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const MAX_FILES = 2
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
  const ACCEPTED_TYPES = {
    image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
    document: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  }

  // Mantener el foco en el textarea cuando el disabled cambia
  useEffect(() => {
    if (!disabled && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [disabled])

  const isFileTypeAccepted = (file: File): boolean => {
    return [...ACCEPTED_TYPES.image, ...ACCEPTED_TYPES.document].includes(file.type)
  }

  const isImage = (file: File): boolean => {
    return ACCEPTED_TYPES.image.includes(file.type)
  }

  const addFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Validaciones
    if (attachedFiles.length + fileArray.length > MAX_FILES) {
      alert(`Máximo ${MAX_FILES} archivos permitidos`)
      return
    }

    for (const file of fileArray) {
      if (!isFileTypeAccepted(file)) {
        alert(`Tipo de archivo no soportado: ${file.name}`)
        continue
      }

      if (file.size > MAX_FILE_SIZE) {
        alert(`Archivo muy grande: ${file.name} (máximo 10MB)`)
        continue
      }

      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const type = isImage(file) ? 'image' : 'document'
      
      // Crear preview para imágenes
      let preview: string | undefined
      if (type === 'image') {
        preview = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.readAsDataURL(file)
        })
      }

      setAttachedFiles(prev => [...prev, { file, id, type, preview }])
    }
  }

  const removeFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleSend = () => {
    if ((input.trim() || attachedFiles.length > 0) && !disabled) {
      const files = attachedFiles.map(af => af.file)
      onSendMessage(input.trim(), files.length > 0 ? files : undefined)
      setInput('')
      setAttachedFiles([])
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Paste handler
  const handlePaste = async (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items
    if (!items) return

    const files: File[] = []
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) {
          files.push(file)
          e.preventDefault() // Prevent pasting the image as text
        }
      }
    }

    if (files.length > 0) {
      await addFiles(files)
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await addFiles(files)
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addFiles(e.target.files)
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div 
      className={`border-t border-gray-200 p-4 bg-white rounded-b-lg ${isDragging ? 'bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* File Attachments Preview */}
      <FileAttachment 
        files={attachedFiles} 
        onRemove={removeFile}
        maxFiles={MAX_FILES}
      />

      <div className="flex items-end space-x-2">
        {/* Attach Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || attachedFiles.length >= MAX_FILES}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Adjuntar archivo (imágenes, PDF, DOCX, TXT)"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={[...ACCEPTED_TYPES.image, ...ACCEPTED_TYPES.document].join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          disabled={disabled}
          placeholder="Type your message... (Ctrl+V to paste images)"
          rows={1}
          className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          style={{ minHeight: '44px', maxHeight: '120px' }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={disabled || (!input.trim() && attachedFiles.length === 0)}
          className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </div>

      {/* Drag overlay hint */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-50 border-2 border-dashed border-blue-400 rounded-lg flex items-center justify-center pointer-events-none">
          <p className="text-blue-600 font-medium">Suelta los archivos aquí</p>
        </div>
      )}
    </div>
  )
}

export default InputBar


