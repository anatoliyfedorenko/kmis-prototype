import type { Role, KMISDocument, EvidenceUpdate, AIAnswer, Taxonomy, CoPEvent, ChatSession, ChatMessage } from './types';
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
  status: 'Active' | 'Inactive';
}

const defaultUsers: UserAccount[] = [
  { id: 'user-1', name: 'Sarah Johnson', email: 'sarah.johnson@example.org', role: 'admin', initials: 'SJ', status: 'Active' },
  { id: 'user-2', name: 'James Osei', email: 'james.osei@example.org', role: 'admin', initials: 'JO', status: 'Active' },
  { id: 'user-3', name: 'Maria Silva', email: 'maria.silva@example.org', role: 'viewer', initials: 'MS', status: 'Active' },
  { id: 'user-4', name: 'Ahmad Wijaya', email: 'ahmad.wijaya@example.org', role: 'viewer', initials: 'AW', status: 'Active' },
  { id: 'user-5', name: 'Claire Dupont', email: 'claire.dupont@community.example.org', role: 'external', initials: 'CD', status: 'Active' },
  { id: 'user-6', name: 'David Mensah', email: 'david.mensah@community.example.org', role: 'external', initials: 'DM', status: 'Active' },
];

export interface AISettings {
  openRouterKey: string;
  model: string;
  systemPrompt: string;
}

const defaultAISettings: AISettings = {
  openRouterKey: '',
  model: 'anthropic/claude-sonnet-4',
  systemPrompt: 'You are a knowledge management assistant. Answer questions based on the provided document excerpts. Always cite your sources by document title. Be concise and factual. Structure your response with a short summary paragraph, then bullet points for key findings.',
};

interface StoreState {
  role: Role;
  currentUserId: string | null;
  users: UserAccount[];
  aiSettings: AISettings;
  documents: KMISDocument[];
  evidenceUpdates: EvidenceUpdate[];
  taxonomy: Taxonomy;
  events: CoPEvent[];
  chatSessions: ChatSession[];
}

function loadState(): StoreState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Migrate old state that may lack newer fields
      if (!parsed.users) parsed.users = defaultUsers;
      if (!parsed.aiSettings) parsed.aiSettings = defaultAISettings;
      if (!parsed.chatSessions) parsed.chatSessions = [];
      return parsed;
    }
  } catch { /* ignore */ }
  return getDefaultState();
}

function getDefaultState(): StoreState {
  return {
    role: 'viewer',
    currentUserId: null,
    users: defaultUsers,
    aiSettings: defaultAISettings,
    documents: seedDocuments,
    evidenceUpdates: seedEvidenceUpdates,
    taxonomy: defaultTaxonomy,
    events: seedEvents,
    chatSessions: [],
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
  return state.users.find(u => u.id === state.currentUserId) || null;
}
export function getUsers(): UserAccount[] { return state.users; }
export function login(userId: string) {
  const user = state.users.find(u => u.id === userId);
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

// User management
export function addUser(user: UserAccount) {
  state.users = [...state.users, user];
  notify();
}
export function updateUser(id: string, updates: Partial<UserAccount>) {
  state.users = state.users.map(u => u.id === id ? { ...u, ...updates } : u);
  notify();
}
export function deleteUser(id: string) {
  state.users = state.users.filter(u => u.id !== id);
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

// AI Settings
export function getAISettings(): AISettings { return state.aiSettings; }
export function updateAISettings(updates: Partial<AISettings>) {
  state.aiSettings = { ...state.aiSettings, ...updates };
  notify();
}
export function isAIConfigured(): boolean {
  return state.aiSettings.openRouterKey.length > 0;
}

// AI - live call via OpenRouter
export async function getAIAnswer(prompt: string, scope: { countries: string[]; themes: string[]; reportingPeriods: string[]; projects: string[]; documentIds: string[] }): Promise<AIAnswer> {
  const settings = state.aiSettings;

  // If specific documents are selected, use those directly
  const pinnedDocs = scope.documentIds.length > 0
    ? state.documents.filter(d => scope.documentIds.includes(d.id))
    : [];

  // Gather relevant document context
  const filteredDocs = state.documents.filter(d => {
    if (scope.documentIds.length > 0 && scope.documentIds.includes(d.id)) return false; // already in pinnedDocs
    if (scope.countries.length > 0 && !d.metadata.countries.some(c => scope.countries.includes(c))) return false;
    if (scope.themes.length > 0 && !d.metadata.themes.some(t => scope.themes.includes(t))) return false;
    if (scope.reportingPeriods.length > 0 && !d.metadata.reportingPeriods.some(p => scope.reportingPeriods.includes(p))) return false;
    if (scope.projects.length > 0 && d.metadata.project && !scope.projects.includes(d.metadata.project)) return false;
    return d.status !== 'draft';
  }).slice(0, 8 - pinnedDocs.length);

  const relevantDocs = [...pinnedDocs, ...filteredDocs];

  const docContext = relevantDocs.map((d, i) =>
    `[Document ${i + 1}: "${d.title}" | ${d.metadata.countries.join(', ')} | ${d.metadata.themes.join(', ')} | ${d.metadata.documentType}]\n${d.extractedText}`
  ).join('\n\n');

  const userMessage = `Based on the following documents, answer this question: "${prompt}"

${docContext}

Respond in this exact JSON format (no markdown fencing):
{
  "summary": "A short summary paragraph",
  "bullets": ["bullet point 1", "bullet point 2", "..."],
  "sources": [
    {"documentIndex": 0, "snippet": "relevant quote from the document", "referenceLabel": "e.g. Section 2, p. 8"},
    ...
  ]
}`;

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.openRouterKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: 'system', content: settings.systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  // Parse the JSON response
  let parsed: { summary: string; bullets: string[]; sources: { documentIndex: number; snippet: string; referenceLabel: string }[] };
  try {
    const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    parsed = JSON.parse(jsonStr);
  } catch {
    // If parsing fails, use the raw text
    return {
      id: 'ai-live-' + Date.now(),
      createdAt: new Date().toISOString(),
      prompt,
      scope,
      answerText: content,
      bullets: [],
      sources: relevantDocs.slice(0, 3).map(d => ({
        documentId: d.id,
        snippet: d.extractedText.substring(0, 120) + '...',
        referenceLabel: 'Document',
      })),
    };
  }

  return {
    id: 'ai-live-' + Date.now(),
    createdAt: new Date().toISOString(),
    prompt,
    scope,
    answerText: parsed.summary,
    bullets: parsed.bullets,
    sources: parsed.sources.map(s => ({
      documentId: relevantDocs[s.documentIndex]?.id || relevantDocs[0]?.id || '',
      snippet: s.snippet,
      referenceLabel: s.referenceLabel,
    })).filter(s => s.documentId),
  };
}

// AI - fallback with prebuilt answers
export function getMockAIAnswer(prompt: string, scope: { countries: string[]; themes: string[]; reportingPeriods: string[]; projects: string[]; documentIds: string[] }): AIAnswer {
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
  const pinnedDocs = scope.documentIds.length > 0
    ? state.documents.filter(d => scope.documentIds.includes(d.id))
    : [];
  const filteredDocs = state.documents.filter(d => {
    if (scope.documentIds.length > 0 && scope.documentIds.includes(d.id)) return false;
    if (scope.countries.length > 0 && !d.metadata.countries.some(c => scope.countries.includes(c))) return false;
    if (scope.themes.length > 0 && !d.metadata.themes.some(t => scope.themes.includes(t))) return false;
    if (scope.projects.length > 0 && d.metadata.project && !scope.projects.includes(d.metadata.project)) return false;
    return true;
  }).slice(0, 4 - pinnedDocs.length);
  const relevantDocs = [...pinnedDocs, ...filteredDocs];

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

// Chat Sessions
export function getChatSessions(): ChatSession[] { return state.chatSessions; }
export function getChatSession(id: string): ChatSession | undefined { return state.chatSessions.find(s => s.id === id); }
export function createChatSession(title: string): ChatSession {
  const session: ChatSession = {
    id: 'chat-' + Date.now(),
    title,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.chatSessions = [session, ...state.chatSessions];
  notify();
  return session;
}
export function updateChatSession(id: string, updates: Partial<ChatSession>) {
  state.chatSessions = state.chatSessions.map(s => s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s);
  notify();
}
export function addMessageToChatSession(sessionId: string, message: ChatMessage) {
  state.chatSessions = state.chatSessions.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, message], updatedAt: new Date().toISOString() } : s);
  notify();
}
export function deleteChatSession(id: string) {
  state.chatSessions = state.chatSessions.filter(s => s.id !== id);
  notify();
}

// Taxonomy
export function getTaxonomy(): Taxonomy { return state.taxonomy; }
export function addTaxonomyItem(key: keyof Taxonomy, value: string) {
  const list = state.taxonomy[key];
  if (!list.includes(value)) {
    state.taxonomy = { ...state.taxonomy, [key]: [...list, value] };
    notify();
  }
}
export function removeTaxonomyItem(key: keyof Taxonomy, value: string) {
  state.taxonomy = { ...state.taxonomy, [key]: state.taxonomy[key].filter(v => v !== value) };
  notify();
}
export function renameTaxonomyItem(key: keyof Taxonomy, oldValue: string, newValue: string) {
  state.taxonomy = { ...state.taxonomy, [key]: state.taxonomy[key].map(v => v === oldValue ? newValue : v) };
  notify();
}

// Events
export function getEvents(): CoPEvent[] { return state.events; }

// Reset
export function resetData() {
  state = getDefaultState();
  saveState(state);
  notify();
}
