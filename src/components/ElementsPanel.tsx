import { Box, ArrowRight, Minus, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Snapshot } from '@/hooks/use-unidraw'

interface ElementsPanelProps {
  snapshot: Snapshot | null
}

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export function ElementsPanel({ snapshot }: ElementsPanelProps) {
  if (!snapshot) return null

  const { nodes, edges, orphanLines } = snapshot
  const idToLabel = new Map(nodes.map((n) => [n.id, n.label]))

  return (
    <div className="p-3 space-y-3">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard icon={<Box className="h-4 w-4" />} value={nodes.length} label="узлов" />
        <StatCard icon={<ArrowRight className="h-4 w-4" />} value={edges.length} label="связей" />
        <StatCard
          icon={<AlertTriangle className="h-4 w-4" />}
          value={orphanLines.length}
          label="висящих"
          muted={orphanLines.length === 0}
        />
      </div>

      {/* Nodes */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-1.5 px-1">
          Узлы ({nodes.length})
        </h3>
        <ScrollArea className="h-[180px] rounded-md border">
          <div className="p-1">
            {nodes.map((n, i) => (
              <div
                key={n.id || i}
                className="flex items-baseline gap-2 px-2 py-1.5 rounded-sm hover:bg-muted/50 text-sm"
              >
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                  {n.kind}
                </Badge>
                <span className="truncate">{escapeHtml(n.label)}</span>
                {n.link && (
                  <a
                    href={n.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary text-[11px] ml-auto shrink-0"
                  >
                    ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Edges */}
      <div>
        <h3 className="text-xs font-medium text-muted-foreground mb-1.5 px-1">
          Связи ({edges.length})
        </h3>
        <ScrollArea className="h-[120px] rounded-md border">
          <div className="p-1">
            {edges.map((e, i) => {
              const src = idToLabel.get(e.sourceId ?? '') ?? e.sourceId ?? '?'
              const tgt = idToLabel.get(e.targetId ?? '') ?? e.targetId ?? '?'
              return (
                <div
                  key={e.id || i}
                  className="flex items-center gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:bg-muted/50 rounded-sm"
                >
                  <span className="truncate max-w-[160px]">{escapeHtml(src)}</span>
                  {e.arrow ? (
                    <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                  ) : (
                    <Minus className="h-3 w-3 shrink-0" />
                  )}
                  <span className="truncate max-w-[160px]">{escapeHtml(tgt)}</span>
                  {e.label && (
                    <span className="text-[10px] text-muted-foreground/60 ml-auto truncate max-w-[100px]">
                      ({escapeHtml(e.label)})
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  muted = false,
}: {
  icon: React.ReactNode
  value: number
  label: string
  muted?: boolean
}) {
  return (
    <div className={`rounded-lg border p-2.5 text-center ${muted ? 'opacity-50' : ''}`}>
      <div className="flex items-center justify-center gap-1 text-primary mb-0.5">
        {icon}
        <span className="text-xl font-bold">{value}</span>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}
