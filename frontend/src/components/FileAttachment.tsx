export interface AttachedFile {
  file: File
  id: string
  preview?: string // URL for image preview
  type: 'image' | 'document'
}

interface FileAttachmentProps {
  files: AttachedFile[]
  onRemove: (id: string) => void
  maxFiles?: number
}

export const FileAttachment = ({ files, onRemove, maxFiles = 2 }: FileAttachmentProps) => {
  if (files.length === 0) return null

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return '🖼️'
    if (file.type === 'application/pdf') return '📄'
    if (file.type.includes('word') || file.name.endsWith('.docx')) return '📝'
    if (file.type === 'text/plain') return '📋'
    return '📎'
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="flex flex-wrap gap-2 mb-2">
      {files.map((attachedFile) => (
        <div
          key={attachedFile.id}
          className="relative group bg-gray-50 border border-gray-300 rounded-lg p-2 flex items-center space-x-2 max-w-xs"
        >
          {/* Preview or Icon */}
          {attachedFile.type === 'image' && attachedFile.preview ? (
            <img
              src={attachedFile.preview}
              alt={attachedFile.file.name}
              className="w-12 h-12 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 flex items-center justify-center text-2xl bg-white rounded border border-gray-200">
              {getFileIcon(attachedFile.file)}
            </div>
          )}

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {attachedFile.file.name}
            </p>
            <p className="text-xs text-gray-500">
              {formatFileSize(attachedFile.file.size)}
            </p>
          </div>

          {/* Remove Button */}
          <button
            onClick={() => onRemove(attachedFile.id)}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
            title="Eliminar archivo"
          >
            ✕
          </button>
        </div>
      ))}

      {/* File count indicator */}
      {files.length > 0 && maxFiles && (
        <div className="text-xs text-gray-500 self-center">
          {files.length}/{maxFiles} archivos
        </div>
      )}
    </div>
  )
}

export default FileAttachment
