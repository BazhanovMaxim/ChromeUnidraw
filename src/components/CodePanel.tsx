import { useState } from 'react'
import { Copy, Check, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Snapshot, Diagram } from '@/hooks/use-unidraw'

interface CodePanelProps {
  snapshot: Snapshot | null
}

function getDiagrams(snapshot: Snapshot): Diagram[] {
  if (snapshot.diagrams && snapshot.diagrams.length > 0) {
    return snapshot.diagrams
  }
  return [{ mermaid: snapshot.mermaid, nodes: snapshot.nodes, edges: snapshot.edges }]
}

function buildFullCode(snapshot: Snapshot): string {
  const diagrams = getDiagrams(snapshot)
  if (diagrams.length === 1) {
    return diagrams[0].mermaid
  }
  return diagrams
    .map(
      (d, i) =>
        `%% Подграф ${i + 1} (${d.nodes.length} узлов, ${d.edges.length} связей)\n${d.mermaid}`
    )
    .join('\n\n')
}

export function CodePanel({ snapshot }: CodePanelProps) {
  const [copied, setCopied] = useState(false)

  if (!snapshot) return null

  const fullCode = buildFullCode(snapshot)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDownload = () => {
    const blob = new Blob([snapshot.rawJson], {
      type: 'application/vnd.unidraw+json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `backup-${new Date(snapshot.timestamp).toISOString().slice(0, 19).replace(/:/g, '-')}.unidraw`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleCopy}>
          {copied ? (
            <Check className="h-3.5 w-3.5 mr-1" />
          ) : (
            <Copy className="h-3.5 w-3.5 mr-1" />
          )}
          {copied ? 'Скопировано' : 'Копировать код'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-3.5 w-3.5 mr-1" />
          Скачать .unidraw
        </Button>
      </div>

      <ScrollArea className="h-[340px] rounded-lg">
        <pre className="code-block rounded-lg p-4 text-xs leading-relaxed overflow-x-auto">
          {fullCode}
        </pre>
      </ScrollArea>
    </div>
  )
}
