import { useState, useRef, useEffect } from 'react'

interface ModelSelectorProps {
  currentModel: string
  availableModels: string[]
  onModelChange: (model: string) => void
  getModelDisplayName: (model: string) => string
}

const ModelSelector = ({ currentModel, availableModels, onModelChange, getModelDisplayName }: ModelSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleModelSelect = (model: string) => {
    onModelChange(model)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-1 bg-white rounded-md border border-gray-300 font-mono text-xs font-semibold text-gray-800 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors"
        title="Cambiar modelo"
      >
        <span>{getModelDisplayName(currentModel)}</span>
        <svg
          className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
              Seleccionar Modelo
            </div>
            {availableModels.map((model) => (
              <button
                key={model}
                onClick={() => handleModelSelect(model)}
                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                  model === currentModel
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{getModelDisplayName(model)}</div>
                    <div className="text-xs text-gray-500 font-mono">{model}</div>
                  </div>
                  {model === currentModel && (
                    <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ModelSelector

