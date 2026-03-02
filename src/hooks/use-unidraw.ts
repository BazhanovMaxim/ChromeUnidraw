import { useState, useEffect, useCallback } from 'react'

export interface Diagram {
  mermaid: string
  nodes: NodeItem[]
  edges: EdgeItem[]
}

export interface Snapshot {
  id: string
  timestamp: number
  boardUrl: string
  interceptSource: string
  rawJson: string
  mermaid: string
  diagrams?: Diagram[]
  noiseNodes?: NodeItem[]
  nodes: NodeItem[]
  edges: EdgeItem[]
  orphanLines: EdgeItem[]
}

export interface NodeItem {
  id: string
  label: string
  kind: string
  shape: string | null
  link: string | null
  groupIds: string[]
  rawText: string
}

export interface EdgeItem {
  id: string
  sourceId: string | null
  targetId: string | null
  label: string
  arrow: boolean
}

export interface Settings {
  blockServerBackup: boolean
}

export function useUnidraw() {
  const [history, setHistory] = useState<Snapshot[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [settings, setSettingsState] = useState<Settings>({ blockServerBackup: false })

  useEffect(() => {
    chrome.storage.local.get(['history', 'settings'], (data) => {
      if (data.history?.length) {
        setHistory(data.history)
        setCurrentIndex(0)
      }
      if (data.settings) {
        setSettingsState(data.settings)
      }
    })

    const handler = (changes: { [key: string]: chrome.storage.StorageChange }) => {
      if (changes.history?.newValue) {
        setHistory(changes.history.newValue)
        setCurrentIndex(0)
      }
      if (changes.settings?.newValue) {
        setSettingsState(changes.settings.newValue)
      }
    }

    chrome.storage.onChanged.addListener(handler)
    return () => chrome.storage.onChanged.removeListener(handler)
  }, [])

  const currentSnapshot = history[currentIndex] ?? null

  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1))
  }, [])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.min(history.length - 1, i + 1))
  }, [history.length])

  const setBlockServerBackup = useCallback((blocked: boolean) => {
    const newSettings = { blockServerBackup: blocked }
    setSettingsState(newSettings)
    chrome.storage.local.set({ settings: newSettings })
  }, [])

  const clearHistory = useCallback(() => {
    chrome.storage.local.set({ history: [], lastBackup: null })
    setHistory([])
    setCurrentIndex(0)
  }, [])

  return {
    history,
    currentIndex,
    currentSnapshot,
    settings,
    goNext,
    goPrev,
    setBlockServerBackup,
    clearHistory,
  }
}
