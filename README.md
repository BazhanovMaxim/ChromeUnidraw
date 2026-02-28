# Bob Hates Your Diagrams

> Боб ненавидит твои диаграммы, но всё равно переводит.

Chrome-расширение, которое перехватывает бэкап [unidraw.io](https://unidraw.io) и конвертирует его в [Mermaid](https://mermaid.js.org/)-диаграмму прямо в браузере.

---

## Что делает

- Перехватывает файл бэкапа при нажатии **"Сохранить бэкап на компьютер"** на unidraw.io
- Парсит JSON-структуру unidraw (узлы, связи, группы)
- Генерирует Mermaid-код (`graph TD/LR/BT/RL`)
- Рисует SVG-диаграмму прямо в popup расширения
- Хранит до 20 последних снимков с навигацией по истории
- Может блокировать отправку бэкапа на сервер (опционально)

## Установка для пользователей

1. Скачайте ZIP-файл из [Releases](../../releases)
2. Распакуйте в любую папку
3. Откройте `chrome://extensions/`
4. Включите **"Режим разработчика"** (переключатель в правом верхнем углу)
5. Нажмите **"Загрузить распакованное расширение"**
6. Выберите распакованную папку
7. Готово! Иконка расширения появится на панели Chrome

## Как пользоваться

1. Откройте борд на [unidraw.io](https://unidraw.io/app/board/)
2. Нажмите **"Сохранить бэкап на компьютер"** в меню unidraw
3. Кликните на иконку расширения — диаграмма уже готова
4. Переключайте направление графа (TD / LR / BT / RL)
5. Копируйте Mermaid-код или скачивайте исходный `.unidraw` JSON

### Вкладки в popup

| Вкладка | Что внутри |
|---------|-----------|
| **Диаграмма** | SVG-визуализация Mermaid-графа с выбором направления |
| **Код** | Mermaid-код (копирование) + скачивание исходного JSON |
| **Элементы** | Статистика, список узлов и связей |

### Блокировка серверного бэкапа

Переключатель **"Не сохранять на сервер"** в шапке расширения блокирует отправку бэкапа на серверы unidraw.io. Запрос перехватывается и имитируется успешный ответ — данные остаются только локально.

## Разработка

### Требования

- Node.js 18+
- npm

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Сборка
npm run build

# Сборка + ZIP
npm run pack
```

После `npm run build` загрузите расширение из папки `dist/` в Chrome.

### Стек

- **React 19** + TypeScript
- **Vite 6** (сборка)
- **Tailwind CSS 3** + **shadcn/ui** (компоненты)
- **Mermaid 11** (рендеринг диаграмм)
- **Chrome Extension Manifest V3**

### Структура проекта

```
├── public/                  # Статические файлы расширения
│   ├── manifest.json        # Манифест Chrome Extension (MV3)
│   ├── background.js        # Service Worker (парсер + хранение)
│   ├── content_script.js    # MAIN world — перехват blob/XHR/fetch
│   ├── content_script_bridge.js  # Isolated world — мост к chrome API
│   └── icons/               # Иконки расширения
├── src/
│   ├── main.tsx             # Точка входа React
│   ├── App.tsx              # Корневой компонент
│   ├── globals.css          # Tailwind + тема
│   ├── hooks/
│   │   └── use-unidraw.ts   # Хук: chrome.storage, история, настройки
│   ├── components/
│   │   ├── Header.tsx       # Шапка с переключателем блокировки
│   │   ├── HistoryBar.tsx   # Навигация по снимкам
│   │   ├── DiagramPanel.tsx # Mermaid SVG-рендер
│   │   ├── CodePanel.tsx    # Код + скачивание JSON
│   │   ├── ElementsPanel.tsx# Статистика и списки
│   │   ├── EmptyState.tsx   # Пустое состояние
│   │   └── ui/              # shadcn/ui компоненты
│   └── lib/
│       └── utils.ts         # cn() утилита
├── index.html               # Входная HTML-страница (Vite)
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── pack.ps1                 # Скрипт упаковки в ZIP
```

### Как работает перехват

1. `content_script.js` выполняется в `world: "MAIN"` (контекст страницы) и патчит `URL.createObjectURL` — при скачивании бэкапа blob с типом `application/vnd.unidraw+json` перехватывается
2. Данные передаются через `window.postMessage` в `content_script_bridge.js` (isolated world)
3. Bridge пересылает данные в `background.js` через `chrome.runtime.sendMessage`
4. Background парсит JSON, генерирует Mermaid-код, сохраняет снимок в `chrome.storage.local`
5. Popup React-приложение слушает `chrome.storage.onChanged` и обновляется в реальном времени

## Лицензия

MIT
