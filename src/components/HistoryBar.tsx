import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Snapshot } from '@/hooks/use-unidraw'

interface HistoryBarProps {
  history: Snapshot[]
  currentIndex: number
  snapshot: Snapshot | null
  onPrev: () => void
  onNext: () => void
  onClear: () => void
}

const sourceLabels: Record<string, string> = {
  blob: 'blob',
  xhr: 'XHR',
  fetch: 'fetch',
  unknown: '?',
}

export function HistoryBar({
  history,
  currentIndex,
  snapshot,
  onPrev,
  onNext,
  onClear,
}: HistoryBarProps) {
  const total = history.length
  const num = total - currentIndex

  const timeStr = snapshot
    ? new Date(snapshot.timestamp).toLocaleString('ru', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : ''

  const source = snapshot
    ? sourceLabels[snapshot.interceptSource] || snapshot.interceptSource
    : ''

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 border-b text-xs">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        disabled={currentIndex >= total - 1}
        onClick={onPrev}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </Button>

      <div className="flex-1 text-center flex items-center justify-center gap-2">
        <span className="font-semibold text-primary">
          {num} / {total}
        </span>
        <span className="text-muted-foreground">{timeStr}</span>
        {source && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{source}</Badge>}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        disabled={currentIndex <= 0}
        onClick={onNext}
      >
        <ChevronRight className="h-3.5 w-3.5" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-muted-foreground hover:text-destructive"
        onClick={() => {
          if (confirm('Очистить всю историю снимков?')) onClear()
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  )
}
