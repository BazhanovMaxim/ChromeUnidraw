export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <img src="/icons/bob_white.svg" alt="Bob" className="w-14 h-14 mb-4" />
      <h2 className="text-base font-semibold mb-1">Боб доволен</h2>
      <p className="text-sm text-muted-foreground max-w-[340px] leading-relaxed">
        Он пока не видит вашу диаграмму и ему хорошо. Но если хотите его разозлить:
      </p>
      <ol className="text-sm text-muted-foreground max-w-[340px] leading-relaxed mt-2 text-left list-decimal list-inside space-y-1">
        <li>
          Откройте борд на{' '}
          <span className="font-medium text-foreground">unidraw.io</span>
        </li>
        <li>
          Нажмите{' '}
          <span className="font-medium text-foreground">
            «Сохранить бэкап на компьютер»
          </span>
        </li>
        <li>Боб увидит вашу диаграмму и будет в ярости</li>
      </ol>
    </div>
  )
}
