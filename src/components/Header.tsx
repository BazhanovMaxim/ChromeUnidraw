import { Shield, ShieldOff } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Snapshot, Settings } from '@/hooks/use-unidraw'

interface HeaderProps {
  snapshot: Snapshot | null
  settings: Settings
  onBlockToggle: (blocked: boolean) => void
}

export function Header({ snapshot, settings, onBlockToggle }: HeaderProps) {
  const time = snapshot
    ? new Date(snapshot.timestamp).toLocaleTimeString('ru')
    : null

  return (
    <header className="bg-gradient-to-r from-violet-600 to-purple-700 text-white px-4 py-3 flex items-center gap-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold">
          B
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-none">Bob Hates Your Diagrams</h1>
          {time && (
            <span className="text-[10px] text-white/60">{time}</span>
          )}
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-white/80">
              {settings.blockServerBackup ? (
                <ShieldOff className="w-3.5 h-3.5 text-red-300" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-white/50" />
              )}
              <span className="hidden min-[480px]:inline">Не сохранять на сервер</span>
              <Switch
                checked={settings.blockServerBackup}
                onCheckedChange={onBlockToggle}
                className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-white/25"
              />
            </label>
          </TooltipTrigger>
          <TooltipContent>
            <p>Блокировать отправку бэкапа на сервер Unidraw</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
