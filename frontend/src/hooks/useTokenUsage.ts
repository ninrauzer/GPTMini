import { useState, useCallback } from 'react'

export interface TokenUsage {
  promptTokens: number
  completionTokens: number
  totalTokens: number
}

export const useTokenUsage = () => {
  const [totalTokens, setTotalTokens] = useState(0)
  const [totalPromptTokens, setTotalPromptTokens] = useState(0)
  const [totalCompletionTokens, setTotalCompletionTokens] = useState(0)

  const addTokenUsage = useCallback((usage: TokenUsage | null | undefined) => {
    if (!usage) return

    console.log('Adding token usage:', usage)
    setTotalTokens((prev) => prev + usage.totalTokens)
    setTotalPromptTokens((prev) => prev + usage.promptTokens)
    setTotalCompletionTokens((prev) => prev + usage.completionTokens)
  }, [])

  const resetTokenUsage = useCallback(() => {
    setTotalTokens(0)
    setTotalPromptTokens(0)
    setTotalCompletionTokens(0)
  }, [])

  return {
    totalTokens,
    totalPromptTokens,
    totalCompletionTokens,
    addTokenUsage,
    resetTokenUsage,
  }
}

