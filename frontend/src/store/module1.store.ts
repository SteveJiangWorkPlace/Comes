/**
 * Module 1 store (placeholder)
 * Manages state for module 1 functionality
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Module 1 state interface
 */
export interface Module1State {
  // Data state
  data: any[]
  currentData: any | null
  isLoading: boolean
  error: string | null

  // UI state
  inputText: string
  selectedOption: string
  showAdvanced: boolean

  // Pagination
  page: number
  limit: number
  total: number
  hasMore: boolean

  // Filter state
  filters: Record<string, any>
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

/**
 * Module 1 actions interface
 */
export interface Module1Actions {
  // Data actions
  setData: (data: any[]) => void
  setCurrentData: (data: any) => void
  clearData: () => void

  // UI actions
  setInputText: (text: string) => void
  setSelectedOption: (option: string) => void
  toggleAdvanced: () => void

  // Pagination actions
  setPage: (page: number) => void
  setLimit: (limit: number) => void
  loadMore: () => void

  // Filter actions
  setFilters: (filters: Record<string, any>) => void
  setSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void
  resetFilters: () => void

  // API simulation actions
  fetchData: () => Promise<void>
  submitData: (input: string) => Promise<any>
  deleteData: (id: string) => Promise<void>

  // Utility actions
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

// Initial state
const initialState: Module1State = {
  data: [],
  currentData: null,
  isLoading: false,
  error: null,

  inputText: '',
  selectedOption: 'default',
  showAdvanced: false,

  page: 1,
  limit: 10,
  total: 0,
  hasMore: false,

  filters: {},
  sortBy: 'createdAt',
  sortOrder: 'desc',
}

/**
 * Create module 1 store
 */
export const useModule1Store = create<Module1State & Module1Actions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Data actions
      setData: data => set({ data }),
      setCurrentData: data => set({ currentData: data }),
      clearData: () => set({ data: [], currentData: null, total: 0, hasMore: false }),

      // UI actions
      setInputText: text => set({ inputText: text }),
      setSelectedOption: option => set({ selectedOption: option }),
      toggleAdvanced: () => set(state => ({ showAdvanced: !state.showAdvanced })),

      // Pagination actions
      setPage: page => set({ page }),
      setLimit: limit => set({ limit, page: 1 }), // Reset to page 1 when limit changes
      loadMore: () => {
        const { page, hasMore } = get()
        if (hasMore) {
          set({ page: page + 1 })
        }
      },

      // Filter actions
      setFilters: filters => set({ filters, page: 1 }), // Reset to page 1 when filters change
      setSort: (sortBy, sortOrder) => set({ sortBy, sortOrder, page: 1 }),
      resetFilters: () =>
        set({
          filters: {},
          sortBy: 'createdAt',
          sortOrder: 'desc',
          page: 1,
          inputText: '',
          selectedOption: 'default',
          showAdvanced: false,
        }),

      // API simulation actions
      fetchData: async () => {
        const { page, limit, filters, inputText } = get()

        set({ isLoading: true, error: null })

        try {
          // Simulate API call delay
          await new Promise(resolve => setTimeout(resolve, 800))

          // Generate mock data
          const mockData = Array.from({ length: limit }, (_, i) => ({
            id: `item-${(page - 1) * limit + i + 1}`,
            title: `模块一项目 ${(page - 1) * limit + i + 1}`,
            description: `这是模块一的示例项目描述 ${inputText || '默认文本'}`,
            status: i % 3 === 0 ? 'active' : i % 3 === 1 ? 'pending' : 'completed',
            priority:
              i % 4 === 0 ? 'high' : i % 4 === 1 ? 'medium' : i % 4 === 2 ? 'low' : 'normal',
            createdAt: new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            updatedAt: new Date().toISOString(),
            value: Math.floor(Math.random() * 1000),
            tags: ['标签1', '标签2', '标签3'].slice(0, Math.floor(Math.random() * 3) + 1),
            ...filters,
          }))

          const total = 45 // Mock total count
          const hasMore = page * limit < total

          // If it's the first page, replace data; otherwise append
          const currentData = page === 1 ? mockData : [...get().data, ...mockData]

          set({
            data: currentData,
            total,
            hasMore,
            isLoading: false,
            error: null,
          })

          console.log(
            `Module 1 data fetched: page ${page}, limit ${limit}, total ${currentData.length}`
          )
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to fetch module 1 data'
          set({
            isLoading: false,
            error: errorMessage,
            data: page === 1 ? [] : get().data, // Keep existing data if not first page
          })
          console.error('Module 1 fetch error:', error)
        }
      },

      submitData: async (input: string) => {
        set({ isLoading: true, error: null })

        try {
          // Simulate API processing delay
          await new Promise(resolve => setTimeout(resolve, 1200))

          if (!input.trim()) {
            throw new Error('输入内容不能为空')
          }

          // Generate mock result
          const result = {
            id: `result-${Date.now()}`,
            input,
            output: `模块一处理结果: ${input} (已处理)`,
            status: 'success',
            timestamp: new Date().toISOString(),
            metadata: {
              processingTime: Math.random() * 1000 + 500,
              confidence: Math.random() * 0.5 + 0.5,
              suggestions: ['建议1', '建议2', '建议3'].slice(0, Math.floor(Math.random() * 3) + 1),
            },
          }

          // Add to data
          const { data } = get()
          const newData = [result, ...data.slice(0, 9)] // Keep only latest 10 items

          set({
            data: newData,
            currentData: result,
            inputText: '', // Clear input after submission
            isLoading: false,
            error: null,
          })

          console.log('Module 1 data submitted:', input)
          return result
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to submit module 1 data'
          set({ isLoading: false, error: errorMessage })
          console.error('Module 1 submit error:', error)
          throw error
        }
      },

      deleteData: async (id: string) => {
        set({ isLoading: true, error: null })

        try {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 600))

          const { data, currentData } = get()
          const newData = data.filter(item => item.id !== id)

          set({
            data: newData,
            currentData: currentData?.id === id ? null : currentData,
            isLoading: false,
            error: null,
          })

          console.log(`Module 1 data deleted: ${id}`)
        } catch (error: any) {
          const errorMessage = error.message || 'Failed to delete module 1 data'
          set({ isLoading: false, error: errorMessage })
          console.error('Module 1 delete error:', error)
          throw error
        }
      },

      // Utility actions
      setLoading: isLoading => set({ isLoading }),
      setError: error => set({ error }),
      reset: () => set(initialState),
    }),
    {
      name: 'module1-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        // Persist UI preferences but not data
        inputText: state.inputText,
        selectedOption: state.selectedOption,
        showAdvanced: state.showAdvanced,
        filters: state.filters,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        limit: state.limit,
      }),
    }
  )
)
