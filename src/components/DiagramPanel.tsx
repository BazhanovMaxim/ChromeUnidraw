import { useEffect, useRef, useState, useCallback } from 'react'
import mermaid from 'mermaid'
import { Copy, RefreshCw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Snapshot, Diagram } from '@/hooks/use-unidraw'

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

function getDiagrams(snapshot: Snapshot): Diagram[] {
  if (snapshot.diagrams && snapshot.diagrams.length > 0) {
    return snapshot.diagrams
  }
  // Обратная совместимость: старые снимки без diagrams
  return [{ mermaid: snapshot.mermaid, nodes: snapshot.nodes, edges: snapshot.edges }]
}

export function DiagramPanel({ snapshot }: DiagramPanelProps) {
  const containersRef = useRef<Map<number, HTMLDivElement>>(new Map())
  const [direction, setDirection] = useState<Direction>('TD')
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState<Map<number, string>>(new Map())
  const renderCountRef = useRef(0)

  const diagrams = snapshot ? getDiagrams(snapshot) : []

  const render = useCallback(async () => {
    if (!snapshot) return

    const newErrors = new Map<number, string>()

    for (let i = 0; i < diagrams.length; i++) {
      const container = containersRef.current.get(i)
      if (!container) continue

      const code = rebuildMermaid(diagrams[i].mermaid, direction)
      container.innerHTML = ''

      try {
        renderCountRef.current++
        const { svg } = await mermaid.render(
          `mermaid-g-${renderCountRef.current}`,
          code
        )
        container.innerHTML = svg
      } catch (e) {
        newErrors.set(i, e instanceof Error ? e.message : String(e))
      }
    }

    setErrors(newErrors)
  }, [snapshot, direction, diagrams.length])

  useEffect(() => {
    render()
  }, [render])

  const handleCopy = async () => {
    if (!snapshot) return
    const allCode = diagrams
      .map((d, i) =>
        diagrams.length > 1
          ? `%% Подграф ${i + 1} (${d.nodes.length} узлов)\n${rebuildMermaid(d.mermaid, direction)}`
          : rebuildMermaid(d.mermaid, direction)
      )
      .join('\n\n')
    await navigator.clipboard.writeText(allCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const setContainerRef = (index: number) => (el: HTMLDivElement | null) => {
    if (el) {
      containersRef.current.set(index, el)
    } else {
      containersRef.current.delete(index)
    }
  }

  const noiseCount = snapshot?.noiseNodes?.length ?? 0

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

        <div className="ml-auto flex items-center gap-2">
          {diagrams.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {diagrams.length} подграфов
              {noiseCount > 0 && ` · ${noiseCount} отфильтровано`}
            </span>
          )}
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

      <div className="space-y-3 max-h-[400px] overflow-auto">
        {diagrams.map((d, i) => (
          <div key={i}>
            {diagrams.length > 1 && (
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Подграф {i + 1}
                </span>
                <span className="text-[10px] text-muted-foreground/60">
                  {d.nodes.length} узлов · {d.edges.length} связей
                </span>
              </div>
            )}
            <div className="rounded-lg border bg-white p-3 min-h-[80px] overflow-auto mermaid-svg">
              {errors.get(i) ? (
                <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                  Ошибка рендера: {errors.get(i)}
                </div>
              ) : (
                <div ref={setContainerRef(i)} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
