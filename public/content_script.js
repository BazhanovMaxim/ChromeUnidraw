// world: "MAIN" — выполняется в контексте страницы напрямую
// Перехватываем URL.createObjectURL, XMLHttpRequest и fetch
// до загрузки React-приложения Unidraw
(function () {
  const EXT_SOURCE = 'unidraw-ext';
  let blockServerBackup = false;

  // ── Слушаем настройку блокировки от bridge (isolated world) ──
  window.addEventListener('message', (event) => {
    if (
      event.source === window &&
      event.data?.source === EXT_SOURCE &&
      event.data?.type === 'SETTINGS_UPDATE'
    ) {
      blockServerBackup = !!event.data.blockServerBackup;
    }
  });

  // ── Отправка перехваченных данных ───────────────────────────
  function sendIntercepted(json, source) {
    window.postMessage(
      { source: EXT_SOURCE, type: 'UNIDRAW_BACKUP', json: json, interceptSource: source },
      '*'
    );
  }

  // ── 1. Перехват URL.createObjectURL (blob-скачивание) ───────
  const origCreateObjectURL = URL.createObjectURL.bind(URL);
  URL.createObjectURL = function (blob) {
    const blobUrl = origCreateObjectURL(blob);
    if (blob && blob.type === 'application/vnd.unidraw+json') {
      blob.text().then((json) => sendIntercepted(json, 'blob'));
    }
    return blobUrl;
  };

  // ── 2. Перехват XMLHttpRequest (POST /backup) ──────────────
  const origXhrOpen = XMLHttpRequest.prototype.open;
  const origXhrSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this._unidrawMethod = method;
    this._unidrawUrl = String(url);
    return origXhrOpen.call(this, method, url, ...rest);
  };

  XMLHttpRequest.prototype.send = function (body) {
    if (
      this._unidrawMethod &&
      this._unidrawMethod.toUpperCase() === 'POST' &&
      this._unidrawUrl.includes('/backup')
    ) {
      // Извлекаем тело запроса
      if (body) {
        const text = typeof body === 'string' ? body : null;
        if (text) {
          sendIntercepted(text, 'xhr');
        } else if (body instanceof Blob) {
          body.text().then((t) => sendIntercepted(t, 'xhr'));
        }
      }

      // Блокируем запрос если настройка включена
      if (blockServerBackup) {
        // Имитируем успешный ответ, не отправляя запрос
        const self = this;
        setTimeout(() => {
          Object.defineProperty(self, 'status', { value: 200, writable: false });
          Object.defineProperty(self, 'readyState', { value: 4, writable: false });
          Object.defineProperty(self, 'responseText', { value: '{}', writable: false });
          Object.defineProperty(self, 'response', { value: '{}', writable: false });
          self.dispatchEvent(new Event('readystatechange'));
          self.dispatchEvent(new Event('load'));
          self.dispatchEvent(new Event('loadend'));
        }, 10);
        window.postMessage(
          { source: EXT_SOURCE, type: 'BACKUP_BLOCKED', url: this._unidrawUrl },
          '*'
        );
        return; // Не вызываем origXhrSend — запрос не уходит
      }
    }
    return origXhrSend.call(this, body);
  };

  // ── 3. Перехват fetch (POST /backup) ───────────────────────
  const origFetch = window.fetch.bind(window);
  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : input?.url || '';
    const method = (init?.method || (typeof input !== 'string' ? input?.method : null) || 'GET').toUpperCase();

    if (method === 'POST' && url.includes('/backup')) {
      let body = init?.body;
      if (body) {
        try {
          const text = typeof body === 'string'
            ? body
            : (body instanceof Blob ? await body.text() : await new Response(body).text());
          sendIntercepted(text, 'fetch');
        } catch (_) { /* ignore extraction errors */ }
      }

      // Блокируем запрос
      if (blockServerBackup) {
        window.postMessage(
          { source: EXT_SOURCE, type: 'BACKUP_BLOCKED', url: url },
          '*'
        );
        return new Response('{}', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return origFetch(input, init);
  };
})();
