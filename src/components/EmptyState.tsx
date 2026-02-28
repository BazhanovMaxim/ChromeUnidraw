import { FileDown } from 'lucide-react'

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <FileDown className="h-7 w-7 text-primary" />
      </div>
      <h2 className="text-base font-semibold mb-1">Нет данных</h2>
      <p className="text-sm text-muted-foreground max-w-[280px] leading-relaxed">
        Откройте борд на{' '}
        <span className="font-medium text-foreground">unidraw.io</span>,
        нажмите{' '}
        <span className="font-medium text-foreground">
          «Сохранить бэкап на компьютер»
        </span>{' '}
        — расширение перехватит файл и покажет диаграмму здесь.
      </p>
    </div>
  )
}
