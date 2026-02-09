/**
 * API Keys management hook
 * Handles storage and management of API keys for external services
 */

import { useState, useCallback, useEffect } from 'react'
import { ApiKeys } from '../api/types'

/**
 * Supported API key types
 */
export type ApiKeyType = keyof ApiKeys

/**
 * API key configuration
 */
export interface ApiKeyConfig {
  type: ApiKeyType
  name: string
  description: string
  placeholder: string
  maskValue?: boolean
  required?: boolean
  helpLink?: string
}

/**
 * Configuration for all supported API keys
 */
export const API_KEY_CONFIGS: Record<ApiKeyType, ApiKeyConfig> = {
  geminiApiKey: {
    type: 'geminiApiKey',
    name: 'Gemini API Key',
    description: 'Google Gemini API密钥，用于访问Gemini AI模型',
    placeholder: '输入您的Gemini API密钥',
    maskValue: true,
    required: true,
    helpLink: 'https://ai.google.dev/gemini-api/docs/api-key',
  },
  gptzeroApiKey: {
    type: 'gptzeroApiKey',
    name: 'GPTZero API Key',
    description: 'GPTZero API密钥，用于文本原创性检测',
    placeholder: '输入您的GPTZero API密钥',
    maskValue: true,
    required: false,
    helpLink: 'https://gptzero.me/',
  },
}

/**
 * Main API keys hook
 */
export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load API keys from localStorage on mount
   */
  useEffect(() => {
    try {
      const savedKeys = localStorage.getItem('api_keys')
      if (savedKeys) {
        setApiKeys(JSON.parse(savedKeys))
      }
    } catch (err) {
      console.error('Failed to load API keys from localStorage:', err)
    }
  }, [])

  /**
   * Save API keys to localStorage
   */
  const saveKeys = useCallback((keys: ApiKeys) => {
    try {
      localStorage.setItem('api_keys', JSON.stringify(keys))
    } catch (err) {
      console.error('Failed to save API keys to localStorage:', err)
    }
  }, [])

  /**
   * Get a specific API key
   */
  const getApiKey = useCallback(
    (type: ApiKeyType) => {
      return apiKeys[type]
    },
    [apiKeys]
  )

  /**
   * Set a specific API key
   */
  const setApiKey = useCallback(
    (type: ApiKeyType, value: string) => {
      const newKeys = { ...apiKeys, [type]: value }
      setApiKeys(newKeys)
      saveKeys(newKeys)
    },
    [apiKeys, saveKeys]
  )

  /**
   * Remove a specific API key
   */
  const removeApiKey = useCallback(
    (type: ApiKeyType) => {
      const newKeys = { ...apiKeys }
      delete newKeys[type]
      setApiKeys(newKeys)
      saveKeys(newKeys)
    },
    [apiKeys, saveKeys]
  )

  /**
   * Clear all API keys
   */
  const clearApiKeys = useCallback(() => {
    setApiKeys({})
    localStorage.removeItem('api_keys')
  }, [])

  /**
   * Check if a specific API key is set
   */
  const hasApiKey = useCallback(
    (type: ApiKeyType) => {
      return !!apiKeys[type] && apiKeys[type]!.trim().length > 0
    },
    [apiKeys]
  )

  /**
   * Check if all required API keys are set
   */
  const hasRequiredApiKeys = useCallback(() => {
    return Object.entries(API_KEY_CONFIGS)
      .filter(([_, config]) => config.required)
      .every(([type]) => hasApiKey(type as ApiKeyType))
  }, [hasApiKey])

  /**
   * Get missing required API keys
   */
  const getMissingApiKeys = useCallback(() => {
    return Object.entries(API_KEY_CONFIGS)
      .filter(([_, config]) => config.required)
      .filter(([type]) => !hasApiKey(type as ApiKeyType))
      .map(([type]) => API_KEY_CONFIGS[type as ApiKeyType])
  }, [hasApiKey])

  /**
   * Mask API key for display
   */
  const maskApiKey = useCallback((key: string | undefined) => {
    if (!key) return ''
    if (key.length <= 8) return '••••••••'
    return `${key.substring(0, 4)}••••${key.substring(key.length - 4)}`
  }, [])

  /**
   * Test API key connectivity (simulated)
   */
  const testApiKey = useCallback(
    async (type: ApiKeyType): Promise<{ success: boolean; message: string }> => {
      const key = apiKeys[type]
      if (!key) {
        return {
          success: false,
          message: 'API密钥未设置',
        }
      }

      setIsLoading(true)
      setError(null)

      try {
        // Simulate API test with delay
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Mock test result - in real app, this would make an actual API call
        const isKeyValid = key.length > 10 && key.includes('sk-')

        if (isKeyValid) {
          return {
            success: true,
            message: `API密钥验证成功 (${API_KEY_CONFIGS[type].name})`,
          }
        } else {
          return {
            success: false,
            message: 'API密钥格式无效，请检查密钥格式',
          }
        }
      } catch (err: any) {
        const errorMessage = err.message || 'API密钥测试失败'
        setError(errorMessage)
        return {
          success: false,
          message: errorMessage,
        }
      } finally {
        setIsLoading(false)
      }
    },
    [apiKeys]
  )

  /**
   * Test all API keys
   */
  const testAllApiKeys = useCallback(async () => {
    const results: Record<ApiKeyType, { success: boolean; message: string }> = {} as any

    for (const type of Object.keys(API_KEY_CONFIGS) as ApiKeyType[]) {
      if (hasApiKey(type)) {
        results[type] = await testApiKey(type)
      }
    }

    return results
  }, [hasApiKey, testApiKey])

  /**
   * Export API keys (secure, masked for safety)
   */
  const exportApiKeys = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      keys: Object.entries(apiKeys).reduce(
        (acc, [type, value]) => ({
          ...acc,
          [type]: maskApiKey(value),
        }),
        {}
      ),
      configs: Object.entries(API_KEY_CONFIGS).reduce(
        (acc, [type, config]) => ({
          ...acc,
          [type]: {
            name: config.name,
            description: config.description,
            isSet: hasApiKey(type as ApiKeyType),
          },
        }),
        {}
      ),
    }

    return JSON.stringify(exportData, null, 2)
  }, [apiKeys, maskApiKey, hasApiKey])

  /**
   * Import API keys from JSON
   */
  const importApiKeys = useCallback(
    (jsonString: string): { success: boolean; message: string; importedCount: number } => {
      try {
        const data = JSON.parse(jsonString)
        let importedCount = 0

        if (data.keys && typeof data.keys === 'object') {
          Object.entries(data.keys).forEach(([type, value]) => {
            if (type in API_KEY_CONFIGS && typeof value === 'string' && value.trim().length > 0) {
              setApiKey(type as ApiKeyType, value as string)
              importedCount++
            }
          })
        }

        return {
          success: true,
          message: `成功导入 ${importedCount} 个API密钥`,
          importedCount,
        }
      } catch (err: any) {
        return {
          success: false,
          message: `导入失败: ${err.message}`,
          importedCount: 0,
        }
      }
    },
    [setApiKey]
  )

  return {
    // State
    apiKeys,
    isLoading,
    error,

    // Configuration
    configs: API_KEY_CONFIGS,
    allConfigs: Object.values(API_KEY_CONFIGS),

    // Actions
    getApiKey,
    setApiKey,
    removeApiKey,
    clearApiKeys,
    testApiKey,
    testAllApiKeys,
    exportApiKeys,
    importApiKeys,

    // Checks
    hasApiKey,
    hasRequiredApiKeys,
    getMissingApiKeys,

    // Utilities
    maskApiKey,

    // Error handling
    setError,
  }
}

/**
 * Hook for API key form management
 */
export const useApiKeyForm = (type: ApiKeyType) => {
  const { getApiKey, setApiKey, removeApiKey, maskApiKey, configs } = useApiKeys()
  const [value, setValue] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const config = configs[type]
  const currentKey = getApiKey(type)
  const maskedKey = maskApiKey(currentKey)

  const handleEdit = () => {
    setIsEditing(true)
    setValue(currentKey || '')
  }

  const handleSave = () => {
    if (value.trim()) {
      setApiKey(type, value.trim())
    } else {
      removeApiKey(type)
    }
    setIsEditing(false)
    setShowKey(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setShowKey(false)
    setValue('')
  }

  const handleRemove = () => {
    removeApiKey(type)
    setIsEditing(false)
    setShowKey(false)
    setValue('')
  }

  const toggleShowKey = () => {
    setShowKey(!showKey)
  }

  return {
    config,
    currentKey,
    maskedKey,
    value,
    setValue,
    isEditing,
    showKey,
    handleEdit,
    handleSave,
    handleCancel,
    handleRemove,
    toggleShowKey,
  }
}
