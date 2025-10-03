// Inmate form draft persistence (localStorage)
// Keys are namespaced per form type

const STORAGE_KEY = 'bjmp.inmates.formDraft';

function safeParse(jsonText) {
  try {
    return JSON.parse(jsonText) || {};
  } catch {
    return {};
  }
}

export function saveDraft(draft) {
  if (!draft || typeof draft !== 'object') return;
  const payload = {
    ...draft,
    _savedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadDraft() {
  const raw = localStorage.getItem(STORAGE_KEY);
  return safeParse(raw);
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY);
}

// Map modal value object to draft shape
export function toDraftFromModalValue(value) {
  return { ...value };
}


