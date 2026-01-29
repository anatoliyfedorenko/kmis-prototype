import type { Role, KMISDocument, EvidenceUpdate, AIAnswer, Taxonomy, CoPEvent } from './types';
import { seedDocuments } from './data/documents';
import { seedEvidenceUpdates } from './data/evidence';
import { mockAIAnswers } from './data/aiAnswers';
import { taxonomy as defaultTaxonomy } from './data/taxonomy';
import { seedEvents } from './data/events';

const STORAGE_KEY = 'kmis-prototype';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
}

export const userAccounts: UserAccount[] = [
  { id: 'user-1', name: 'Sarah Johnson', email: 'sarah.johnson@fcdo.gov.uk', role: 'admin', initials: 'SJ' },
  { id: 'user-2', name: 'James Osei', email: 'james.osei@fcdo.gov.uk', role: 'admin', initials: 'JO' },
  { id: 'user-3', name: 'Maria Silva', email: 'maria.silva@fcdo.gov.uk', role: 'viewer', initials: 'MS' },
  { id: 'user-4', name: 'Ahmad Wijaya', email: 'ahmad.wijaya@fcdo.gov.uk', role: 'viewer', initials: 'AW' },
  { id: 'user-5', name: 'Claire Dupont', email: 'claire.dupont@fgmc-cop.org', role: 'external', initials: 'CD' },
  { id: 'user-6', name: 'David Mensah', email: 'david.mensah@fgmc-cop.org', role: 'external', initials: 'DM' },
];

interface StoreState {
  role: Role;
  currentUserId: string | null;
  documents: KMISDocument[];
  evidenceUpdates: EvidenceUpdate[];
  taxonomy: Taxonomy;
  events: CoPEvent[];
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch { /* ignore */ }
  return getDefaultState();
}

function getDefaultState(): StoreState {
  return {
    role: 'viewer',
    currentUserId: null,
    documents: seedDocuments,
    evidenceUpdates: seedEvidenceUpdates,
    taxonomy: defaultTaxonomy,
    events: seedEvents,
  };
}

function saveState(state: StoreState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// Listeners
type Listener = () => void;
const listeners: Set<Listener> = new Set();

export function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify() {
  saveState(state);
  listeners.forEach(fn => fn());
}

// Auth
export function getRole(): Role { return state.role; }
export function setRole(r: Role) { state.role = r; notify(); }
export function getCurrentUserId(): string | null { return state.currentUserId; }
export function getCurrentUser(): UserAccount | null {
  if (!state.currentUserId) return null;
  return userAccounts.find(u => u.id === state.currentUserId) || null;
}
export function login(userId: string) {
  const user = userAccounts.find(u => u.id === userId);
  if (user) {
    state.currentUserId = userId;
    state.role = user.role;
    notify();
  }
}
export function logout() {
  state.currentUserId = null;
  state.role = 'viewer';
  notify();
}

// Documents
export function getDocuments(): KMISDocument[] { return state.documents; }
export function getDocument(id: string): KMISDocument | undefined { return state.documents.find(d => d.id === id); }

export function addDocuments(docs: KMISDocument[]) {
  state.documents = [...state.documents, ...docs];
  notify();
}

export function updateDocument(id: string, updates: Partial<KMISDocument>) {
  state.documents = state.documents.map(d => d.id === id ? { ...d, ...updates, updatedAt: new Date().toISOString() } : d);
  notify();
}

// Evidence
export function getEvidenceUpdates(): EvidenceUpdate[] { return state.evidenceUpdates; }
export function getEvidenceForPage(pageType: 'country' | 'theme', pageKey: string): EvidenceUpdate[] {
  return state.evidenceUpdates.filter(e => e.pageType === pageType && e.pageKey === pageKey).sort((a, b) => b.date.localeCompare(a.date));
}

export function addEvidenceUpdate(update: EvidenceUpdate) {
  state.evidenceUpdates = [update, ...state.evidenceUpdates];
  notify();
}

export function deleteEvidenceUpdate(id: string) {
  state.evidenceUpdates = state.evidenceUpdates.filter(e => e.id !== id);
  notify();
}

// AI
export function getMockAIAnswer(prompt: string, scope: { countries: string[]; themes: string[]; reportingPeriods: string[] }): AIAnswer {
  const lower = prompt.toLowerCase();
  // Try to match a prebuilt answer
  for (const a of mockAIAnswers) {
    const keywords = a.prompt.toLowerCase().split(/\s+/);
    const matchCount = keywords.filter(kw => kw.length > 3 && lower.includes(kw)).length;
    if (matchCount > 3) return a;
  }
  // Check scope-based matching
  for (const a of mockAIAnswers) {
    const scopeMatch = (
      (scope.countries.length > 0 && scope.countries.some(c => a.scope.countries.includes(c))) ||
      (scope.themes.length > 0 && scope.themes.some(t => a.scope.themes.includes(t)))
    );
    const promptMatch = a.prompt.toLowerCase().split(/\s+/).filter(kw => kw.length > 3 && lower.includes(kw)).length > 1;
    if (scopeMatch && promptMatch) return a;
  }
  // Fallback: return a generic answer based on scope
  const relevantDocs = state.documents.filter(d => {
    if (scope.countries.length > 0 && !d.metadata.countries.some(c => scope.countries.includes(c))) return false;
    if (scope.themes.length > 0 && !d.metadata.themes.some(t => scope.themes.includes(t))) return false;
    return true;
  }).slice(0, 4);

  return {
    id: 'ai-fallback-' + Date.now(),
    createdAt: new Date().toISOString(),
    prompt,
    scope,
    answerText: `Based on the available documents${scope.countries.length ? ' for ' + scope.countries.join(', ') : ''}${scope.themes.length ? ' on ' + scope.themes.join(', ') : ''}, here is a summary of the relevant findings and evidence.`,
    bullets: [
      'Multiple reports document progress in programme implementation across the selected scope.',
      'Key achievements include improvements in governance systems, market access, and community participation.',
      'Challenges remain in enforcement capacity, cross-border coordination, and reaching remote communities.',
      'Climate finance and results-based payments are growing, creating new opportunities.'
    ],
    sources: relevantDocs.map(d => ({
      documentId: d.id,
      snippet: d.extractedText.substring(0, 120) + '...',
      referenceLabel: 'Section 1, p. 5'
    })),
  };
}

// Taxonomy
export function getTaxonomy(): Taxonomy { return state.taxonomy; }

// Events
export function getEvents(): CoPEvent[] { return state.events; }

// Reset
export function resetData() {
  state = getDefaultState();
  saveState(state);
  notify();
}
