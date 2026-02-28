// Service Worker — принимает JSON от content script,
// парсит, сохраняет историю снимков, обновляет бейдж

const MAX_HISTORY = 20;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'UNIDRAW_BACKUP') {
    handleBackup(message, sender);
  }

  if (message.type === 'BACKUP_BLOCKED') {
    console.log('[Bob] Blocked server backup:', message.url);
    // Показываем бейдж блокировки
    chrome.action.setBadgeText({ text: '✕' });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    setTimeout(() => updateBadge(), 2000);
  }
});

async function handleBackup(message, sender) {
  try {
    const parsed = JSON.parse(message.json);
    const result = parseUnidraw(parsed);
    const mermaid = toMermaid(result, 'TD');

    const snapshot = {
      id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      timestamp: Date.now(),
      boardUrl: sender.tab?.url || '',
      interceptSource: message.interceptSource || 'unknown',
      rawJson: message.json,
      mermaid: mermaid,
      nodes: result.nodes,
      edges: result.edges,
      orphanLines: result.orphanLines,
    };

    // Загружаем текущую историю
    const { history = [] } = await chrome.storage.local.get('history');

    // Добавляем новый снимок в начало
    history.unshift(snapshot);

    // Обрезаем до MAX_HISTORY
    if (history.length > MAX_HISTORY) {
      history.length = MAX_HISTORY;
    }

    // Сохраняем историю + lastBackup (для обратной совместимости)
    await chrome.storage.local.set({
      history: history,
      lastBackup: snapshot,
    });

    // Обновляем бейдж
    updateBadge();

  } catch (e) {
    console.error('[Bob] Parse error:', e);
  }
}

async function updateBadge() {
  const { history = [] } = await chrome.storage.local.get('history');
  if (history.length > 0) {
    chrome.action.setBadgeText({ text: String(history.length) });
    chrome.action.setBadgeBackgroundColor({ color: '#7c3aed' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// Инициализация бейджа при старте
updateBadge();

// ─────────────────────────────────────────────
// Парсер (порт UnidrawParser.java на JavaScript)
// ─────────────────────────────────────────────

const LINE_TYPES = new Set(['line', 'arrow', 'connector']);

function stripHtml(html) {
  if (!html || !html.trim()) return '';
  let text = html.replace(/<br\s\/?>/gi, '\n');
  text = text.replace(/<[^>]+>/g, '');
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  return lines.join(' / ').replace(/\s{2,}/g, ' ').trim();
}

function nullIfEmpty(s) {
  return s == null || s.trim() === '' ? null : s;
}

function parseNode(el) {
  const type = el.type || 'unknown';
  const rawText = el.text || '';
  let label = stripHtml(rawText);
  if (!label) {
    label = stripHtml(el.name || '');
  }
  const id = el.id || '';
  const shape = el.shape != null ? String(el.shape) : null;
  const link = nullIfEmpty(el.link);
  const groupIds = Array.isArray(el.groupIds) ? el.groupIds : [];
  const safeLabel = label || `[${type}:${id.substring(0, 8)}]`;
  return { id, label: safeLabel, kind: type, shape, link, groupIds, rawText };
}

function parseEdge(el) {
  const id = el.id || '';
  if (!id) return null;
  const tipPoints = el.tipPoints || {};
  const sourceId = nullIfEmpty(tipPoints.start?.boundToId);
  const targetId = nullIfEmpty(tipPoints.end?.boundToId);
  const hasArrow = (el.style?.let || 0) > 0;
  const label = stripHtml(el.text || '');
  return { id, sourceId, targetId, label, arrow: hasArrow };
}

function parseUnidraw(root) {
  const elements = root.elements;
  if (!Array.isArray(elements)) {
    return { nodes: [], edges: [], orphanLines: [] };
  }
  const nodes = [];
  const edges = [];
  const orphanLines = [];
  for (const el of elements) {
    if (el.isDeleted) continue;
    const type = el.type || 'unknown';
    if (LINE_TYPES.has(type)) {
      const edge = parseEdge(el);
      if (!edge) continue;
      const isOrphan = edge.sourceId == null || edge.targetId == null;
      (isOrphan ? orphanLines : edges).push(edge);
    } else {
      nodes.push(parseNode(el));
    }
  }
  return { nodes, edges, orphanLines };
}

function escapeMermaid(s) {
  return s.replace(/"/g, "'");
}

function toMermaid(board, direction = 'TD') {
  const idToAlias = new Map();
  board.nodes.forEach((node, i) => idToAlias.set(node.id, `n${i}`));
  const lines = [`graph ${direction}`];
  for (const node of board.nodes) {
    const alias = idToAlias.get(node.id);
    const label = escapeMermaid(node.label);
    lines.push(`  ${alias}["${label}"]`);
  }
  lines.push('');
  for (const edge of board.edges) {
    const src = idToAlias.get(edge.sourceId);
    const tgt = idToAlias.get(edge.targetId);
    if (!src || !tgt) continue;
    if (!edge.label) {
      const connector = edge.arrow ? '-->' : '---';
      lines.push(`  ${src} ${connector} ${tgt}`);
    } else {
      const lbl = escapeMermaid(edge.label);
      const connector = edge.arrow
        ? `-->|"${lbl}"|`
        : `---|"${lbl}"|`;
      lines.push(`  ${src} ${connector} ${tgt}`);
    }
  }
  return lines.join('\n').trimEnd();
}
