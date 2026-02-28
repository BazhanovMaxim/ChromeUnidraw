import { useEffect, useRef, useState, useCallback } from 'react'
import mermaid from 'mermaid'
import { Copy, RefreshCw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Snapshot } from '@/hooks/use-unidraw'

// Инициализируем mermaid один раз при загрузке модуля
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: { curve: 'basis' },
})

interface DiagramPanelProps {
  snapshot: Snapshot | null
}

type Direction = 'TD' | 'LR' | 'BT' | 'RL'

const directions: { value: Direction; label: string }[] = [
  { value: 'TD', label: 'Сверху вниз' },
  { value: 'LR', label: 'Слева направо' },
  { value: 'BT', label: 'Снизу вверх' },
  { value: 'RL', label: 'Справа налево' },
]

function rebuildMermaid(code: string, direction: Direction) {
  return code.replace(/^graph \w+/, `graph ${direction}`)
}

export function DiagramPanel({ snapshot }: DiagramPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [direction, setDirection] = useState<Direction>('TD')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const renderCountRef = useRef(0)

  const render = useCallback(async () => {
    if (!snapshot || !containerRef.current) return

    const code = rebuildMermaid(snapshot.mermaid, direction)
    const container = containerRef.current
    container.innerHTML = ''
    setError(null)

    try {
      renderCountRef.current++
      const { svg } = await mermaid.render(
        `mermaid-g-${renderCountRef.current}`,
        code
      )
      container.innerHTML = svg
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [snapshot, direction])

  useEffect(() => {
    render()
  }, [render])

  const handleCopy = async () => {
    if (!snapshot) return
    const code = rebuildMermaid(snapshot.mermaid, direction)
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={direction}
          onChange={(e) => setDirection(e.target.value as Direction)}
          className="h-8 px-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {directions.map((d) => (
            <option key={d.value} value={d.value}>
              {d.value} — {d.label}
            </option>
          ))}
        </select>

        <Button variant="outline" size="sm" onClick={render}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" />
          Перерисовать
        </Button>

        <div className="ml-auto">
          <Button size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="h-3.5 w-3.5 mr-1" />
            ) : (
              <Copy className="h-3.5 w-3.5 mr-1" />
            )}
            {copied ? 'Скопировано' : 'Копировать'}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-3 min-h-[120px] max-h-[340px] overflow-auto mermaid-svg">
        {error ? (
          <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            Ошибка рендера: {error}
          </div>
        ) : (
          <div ref={containerRef} />
        )}
      </div>
    </div>
  )
}
