import { useEffect, useState } from 'react'
import ModelSelector from './ModelSelector'

interface ConfigResponse {
  model: string
  apiKeyConfigured: boolean
  availableModels: string[]
}

interface StatusBarProps {
  totalTokens: number
  promptTokens: number
  completionTokens: number
  onReset: () => void
  currentModel: string
  onModelChange: (model: string) => void
}

const StatusBar = ({ totalTokens, promptTokens, completionTokens, onReset, currentModel, onModelChange }: StatusBarProps) => {
  const [config, setConfig] = useState<ConfigResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/chat/config')
        if (response.ok) {
          const data: ConfigResponse = await response.json()
          setConfig(data)
        }
      } catch (error) {
        console.error('Error fetching config:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-300 px-4 py-2.5 text-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-primary-600 rounded-full animate-spin"></div>
            <span className="text-gray-600">Cargando configuración...</span>
          </div>
        </div>
      </div>
    )
  }

  const getModelDisplayName = (model: string) => {
    const modelNames: { [key: string]: string } = {
      'gpt-4o': 'GPT-4o',
      'gpt-4o-realtime-preview': 'GPT-4o Realtime',
      'gpt-4o-mini': 'GPT-4o Mini',
      'gpt-4-turbo': 'GPT-4 Turbo',
      'gpt-4': 'GPT-4',
      'gpt-3.5-turbo': 'GPT-3.5 Turbo',
      'gpt-3.5-turbo-16k': 'GPT-3.5 Turbo 16K',
      'o1-preview': 'O1 Preview',
      'o1-mini': 'O1 Mini',
    }
    return modelNames[model] || model
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-300 px-4 py-2.5 text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-gray-600 font-medium">Engine:</span>
            {config?.availableModels && config.availableModels.length > 0 ? (
              <ModelSelector
                currentModel={currentModel}
                availableModels={config.availableModels}
                onModelChange={onModelChange}
                getModelDisplayName={getModelDisplayName}
              />
            ) : (
              <span className="px-3 py-1 bg-white rounded-md border border-gray-300 font-mono text-xs font-semibold text-gray-800 shadow-sm">
                {currentModel ? getModelDisplayName(currentModel) : 'N/A'}
              </span>
            )}
            {currentModel && (
              <span className="text-gray-500 text-xs font-mono">
                ({currentModel})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                config?.apiKeyConfigured 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-red-500'
              }`}
              title={config?.apiKeyConfigured ? 'API Key configurada' : 'API Key no configurada'}
            />
            <span className={`font-medium ${
              config?.apiKeyConfigured ? 'text-green-700' : 'text-red-700'
            }`}>
              {config?.apiKeyConfigured ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-300">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600 font-medium">Tokens:</span>
              {totalTokens > 0 ? (
                <div className="flex items-center space-x-1.5">
                  <span 
                    className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md font-semibold text-xs border border-blue-200 shadow-sm hover:bg-blue-100 transition-colors"
                    title="Tokens de entrada (prompt)"
                  >
                    📥 {formatNumber(promptTokens)}
                  </span>
                  <span 
                    className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-md font-semibold text-xs border border-purple-200 shadow-sm hover:bg-purple-100 transition-colors"
                    title="Tokens de salida (completion)"
                  >
                    📤 {formatNumber(completionTokens)}
                  </span>
                  <span 
                    className="px-2.5 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-md font-bold text-xs shadow-md hover:shadow-lg transition-shadow"
                    title="Total de tokens consumidos"
                  >
                    ⚡ {formatNumber(totalTokens)}
                  </span>
                  <button
                    onClick={onReset}
                    className="ml-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
                    title="Resetear contador de tokens"
                  >
                    🔄
                  </button>
                </div>
              ) : (
                <span className="text-gray-400 text-xs italic">
                  Esperando uso...
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusBar

