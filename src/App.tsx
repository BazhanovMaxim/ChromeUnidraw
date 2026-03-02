import { TooltipProvider } from '@/components/ui/tooltip'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GitGraph, Code2, List } from 'lucide-react'
import { useUnidraw } from '@/hooks/use-unidraw'
import { Header } from '@/components/Header'
import { HistoryBar } from '@/components/HistoryBar'
import { DiagramPanel } from '@/components/DiagramPanel'
import { CodePanel } from '@/components/CodePanel'
import { ElementsPanel } from '@/components/ElementsPanel'
import { EmptyState } from '@/components/EmptyState'
import { BobQuote } from '@/components/BobQuote'

export function App() {
  const {
    history,
    currentIndex,
    currentSnapshot,
    settings,
    goNext,
    goPrev,
    setBlockServerBackup,
    clearHistory,
  } = useUnidraw()

  const hasData = history.length > 0

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex flex-col min-h-0">
        <Header
          snapshot={currentSnapshot}
          settings={settings}
          onBlockToggle={setBlockServerBackup}
        />

        {!hasData ? (
          <EmptyState />
        ) : (
          <>
            <HistoryBar
              history={history}
              currentIndex={currentIndex}
              snapshot={currentSnapshot}
              onPrev={goPrev}
              onNext={goNext}
              onClear={clearHistory}
            />

            <BobQuote snapshot={currentSnapshot} />

            <Tabs defaultValue="diagram" className="flex-1">
              <TabsList className="w-full justify-start rounded-none border-b bg-background px-3 h-10">
                <TabsTrigger value="diagram" className="gap-1.5 text-xs">
                  <GitGraph className="h-3.5 w-3.5" />
                  Диаграмма
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-1.5 text-xs">
                  <Code2 className="h-3.5 w-3.5" />
                  Код
                </TabsTrigger>
                <TabsTrigger value="elements" className="gap-1.5 text-xs">
                  <List className="h-3.5 w-3.5" />
                  Элементы
                </TabsTrigger>
              </TabsList>

              <TabsContent value="diagram" className="mt-0">
                <DiagramPanel snapshot={currentSnapshot} />
              </TabsContent>

              <TabsContent value="code" className="mt-0">
                <CodePanel snapshot={currentSnapshot} />
              </TabsContent>

              <TabsContent value="elements" className="mt-0">
                <ElementsPanel snapshot={currentSnapshot} />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </TooltipProvider>
  )
}
