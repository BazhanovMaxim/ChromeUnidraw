// Мост: isolated world ↔ MAIN world ↔ background (service worker)
// Слушает postMessage от MAIN world и пересылает в background.
// Передаёт настройки из chrome.storage в MAIN world.
(function () {
  const EXT_SOURCE = 'unidraw-ext';

  // ── Пересылка данных: MAIN world → background ──────────────
  window.addEventListener('message', (event) => {
    if (event.source !== window || event.data?.source !== EXT_SOURCE) return;

    const { type } = event.data;

    if (type === 'UNIDRAW_BACKUP') {
      chrome.runtime.sendMessage({
        type: 'UNIDRAW_BACKUP',
        json: event.data.json,
        interceptSource: event.data.interceptSource || 'unknown',
      });
    }

    if (type === 'BACKUP_BLOCKED') {
      chrome.runtime.sendMessage({
        type: 'BACKUP_BLOCKED',
        url: event.data.url,
      });
    }
  });

  // ── Передача настроек: chrome.storage → MAIN world ─────────
  function sendSettingsToMainWorld(settings) {
    window.postMessage(
      {
        source: EXT_SOURCE,
        type: 'SETTINGS_UPDATE',
        blockServerBackup: !!settings.blockServerBackup,
      },
      '*'
    );
  }

  // Отправляем текущие настройки при загрузке
  chrome.storage.local.get('settings', ({ settings }) => {
    sendSettingsToMainWorld(settings || {});
  });

  // Слушаем изменения настроек в реальном времени
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings?.newValue) {
      sendSettingsToMainWorld(changes.settings.newValue);
    }
  });
})();
