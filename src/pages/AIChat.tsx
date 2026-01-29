import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useRole, useTaxonomy, useAISettings, useDocuments } from '../hooks/useStore';
import { getMockAIAnswer, getAIAnswer, getDocument, isAIConfigured, addDocuments } from '../store';
import MultiSelect from '../components/MultiSelect';
import type { AIAnswer, KMISDocument, DocumentStatus } from '../types';

const suggestedPrompts = [
  'Summarise key findings on forest governance in Ghana for 2024–2025.',
  'What evidence do we have on markets and climate in Indonesia?',
  'List the major risks mentioned across the selected documents.',
  'What progress has been made on REDD+ across programme countries?',
  'How are communities benefiting from forest programmes?',
  'What are the trends in certified timber markets?',
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  answer?: AIAnswer;
  timestamp: string;
}

export default function AIChat() {
  const role = useRole();
  const taxonomy = useTaxonomy();
  const aiSettings = useAISettings();
  const allDocuments = useDocuments();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [prompt, setPrompt] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRefs, setShowRefs] = useState(true);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aiLive = isAIConfigured();

  // Build document options for the file selector
  const documentOptions = allDocuments.filter(d => d.status !== 'draft').map(d => d.title);
  const docTitleToId = new Map(allDocuments.map(d => [d.title, d.id]));
  const docIdToTitle = new Map(allDocuments.map(d => [d.id, d.title]));

  const activeScopeCount = countries.length + themes.length + periods.length + projects.length + selectedDocIds.length;

  // Handle URL params for pre-selecting a document and prompt
  useEffect(() => {
    const docParam = searchParams.get('doc');
    const promptParam = searchParams.get('prompt');
    if (docParam) {
      const docTitle = docIdToTitle.get(docParam);
      if (docTitle) {
        setSelectedDocIds([docParam]);
      }
    }
    if (promptParam) {
      setPrompt(promptParam);
    }
    if (docParam || promptParam) {
      setSearchParams({}, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (role === 'external') {
    return <div className="text-center py-12"><p className="text-gray-500 mb-4">AI Q&A is only available to internal users.</p><Link to="/cop" className="text-blue-600">Go to CoP Home</Link></div>;
  }

  async function handleAsk(q?: string) {
    const question = q || prompt;
    if (!question.trim()) return;

    const userMsg: ChatMessage = {
      id: 'msg-' + Date.now(),
      role: 'user',
      text: question,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    const scope = { countries, themes, reportingPeriods: periods, projects, documentIds: selectedDocIds };

    try {
      let result: AIAnswer;
      if (aiLive) {
        result = await getAIAnswer(question, scope);
      } else {
        await new Promise(r => setTimeout(r, 800));
        result = getMockAIAnswer(question, scope);
      }
      const assistantMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'assistant',
        text: result.answerText,
        answer: result,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: 'msg-' + Date.now(),
        role: 'error',
        text: err instanceof Error ? err.message : 'Failed to get AI response.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleNewChat() {
    setMessages([]);
    setPrompt('');
  }

  function handleSaveAsNote() {
    const title = saveTitle.trim() || `AI Chat Notes — ${new Date().toLocaleDateString()}`;
    // Build extracted text from conversation
    const conversationText = messages.map(m => {
      if (m.role === 'user') return `Q: ${m.text}`;
      if (m.role === 'assistant') {
        let text = `A: ${m.text}`;
        if (m.answer && m.answer.bullets.length > 0) {
          text += '\n\nKey Points:\n' + m.answer.bullets.map(b => `• ${b}`).join('\n');
        }
        if (m.answer && m.answer.sources.length > 0) {
          text += '\n\nSources:\n' + m.answer.sources.map(s => {
            const doc = getDocument(s.documentId);
            return `— ${doc?.title || s.documentId} (${s.referenceLabel})`;
          }).join('\n');
        }
        return text;
      }
      return '';
    }).filter(Boolean).join('\n\n---\n\n');

    const newDoc: KMISDocument = {
      id: `doc-note-${Date.now()}`,
      title,
      filename: `ai-chat-${Date.now()}.md`,
      sizeMb: +(conversationText.length / 1048576).toFixed(2) || 0.01,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 'v1',
      status: 'draft' as DocumentStatus,
      metadata: {
        countries: countries.length ? countries : [],
        themes: themes.length ? themes : [],
        reportingPeriods: periods.length ? periods : [],
        documentType: 'AI Chat Notes',
        project: projects.length ? projects[0] : '',
        contributor: 'AI Assistant',
      },
      extractedText: conversationText,
    };
    addDocuments([newDoc]);
    setSaveModalOpen(false);
    setSaveTitle('');
    navigate(`/documents/${newDoc.id}`);
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      {/* Top bar: title + scope + status */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">AI Q&A</h1>
            <div className="flex items-center gap-1.5">
              <span className={`inline-block w-2 h-2 rounded-full ${aiLive ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-xs text-gray-500">{aiLive ? aiSettings.model.split('/').pop() : 'Offline'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setScopeOpen(!scopeOpen)}
              className={`text-sm px-3 py-1.5 rounded border cursor-pointer ${activeScopeCount > 0 ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
              Scope{activeScopeCount > 0 ? ` (${activeScopeCount})` : ''}
            </button>
            {hasMessages && (
              <>
                <button
                  onClick={() => setSaveModalOpen(true)}
                  className="text-sm px-3 py-1.5 rounded border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 cursor-pointer"
                >
                  Save as Note
                </button>
                <button
                  onClick={handleNewChat}
                  className="text-sm px-3 py-1.5 rounded border border-gray-300 text-gray-600 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  New Chat
                </button>
              </>
            )}
          </div>
        </div>

        {/* Collapsible scope selectors */}
        {scopeOpen && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Narrow the AI search to specific documents.</p>
            <div className="flex flex-wrap gap-2">
              <div className="w-40">
                <MultiSelect label="Country" options={taxonomy.countries} selected={countries} onChange={setCountries} />
              </div>
              <div className="w-40">
                <MultiSelect label="Theme" options={taxonomy.themes} selected={themes} onChange={setThemes} />
              </div>
              <div className="w-40">
                <MultiSelect label="Period" options={taxonomy.reportingPeriods} selected={periods} onChange={setPeriods} />
              </div>
              <div className="w-40">
                <MultiSelect label="Project" options={taxonomy.projects} selected={projects} onChange={setProjects} />
              </div>
              <div className="w-56">
                <MultiSelect
                  label="Document"
                  options={documentOptions}
                  selected={selectedDocIds.map(id => docIdToTitle.get(id) || id)}
                  onChange={(titles) => setSelectedDocIds(titles.map(t => docTitleToId.get(t) || t))}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50">
        {!hasMessages && !loading ? (
          /* Empty state with suggestions */
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="text-4xl mb-4 opacity-40">AI</div>
            <p className="text-gray-500 text-sm mb-1">Ask questions about the document collection.</p>
            <p className="text-gray-400 text-xs mb-6">Answers include source references for transparency.</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
              {suggestedPrompts.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(sp)}
                  className="px-3 py-2 bg-white text-gray-700 rounded-lg text-sm hover:bg-blue-50 hover:text-blue-700 border border-gray-200 cursor-pointer transition-colors"
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {messages.map(msg => (
              <div key={msg.id}>
                {msg.role === 'user' && (
                  <div className="flex justify-end mb-1">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[75%] text-sm">
                      {msg.text}
                    </div>
                  </div>
                )}

                {msg.role === 'error' && (
                  <div className="flex justify-start mb-1">
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl rounded-bl-sm px-4 py-2.5 max-w-[75%] text-sm">
                      <span className="font-medium">Error:</span> {msg.text}
                      {role === 'admin' && (
                        <Link to="/admin" className="text-red-600 hover:text-red-800 underline ml-2 text-xs">Check settings</Link>
                      )}
                    </div>
                  </div>
                )}

                {msg.role === 'assistant' && msg.answer && (
                  <div className="flex justify-start mb-1">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] shadow-sm">
                      {/* Summary */}
                      <p className="text-sm text-gray-800 leading-relaxed">{msg.answer.answerText}</p>

                      {/* Bullets */}
                      {msg.answer.bullets.length > 0 && (
                        <ul className="mt-3 space-y-1.5">
                          {msg.answer.bullets.map((b, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <span className="text-blue-500 mt-0.5 shrink-0">•</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Sources */}
                      {msg.answer.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <button
                            onClick={() => setShowRefs(!showRefs)}
                            className="text-xs text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer mb-2"
                          >
                            {showRefs ? 'Hide' : 'Show'} sources ({msg.answer.sources.length})
                          </button>
                          {showRefs && (
                            <div className="space-y-2">
                              {msg.answer.sources.map((s, i) => {
                                const doc = getDocument(s.documentId);
                                return (
                                  <div key={i} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                                    <div className="flex items-center gap-2">
                                      <Link to={`/documents/${s.documentId}`} className="text-blue-600 hover:text-blue-800 font-medium text-xs no-underline hover:underline">
                                        {doc?.title || s.documentId}
                                      </Link>
                                      <span className="text-xs text-gray-400 bg-gray-200 px-1.5 py-0.5 rounded">{s.referenceLabel}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 italic mt-1 border-l-2 border-yellow-300 pl-2 bg-yellow-50 py-0.5 rounded-r">
                                      &ldquo;{s.snippet}&rdquo;
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timestamp */}
                      <div className="mt-2 text-xs text-gray-300">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span>{aiLive ? `Querying ${aiSettings.model.split('/').pop()}` : 'Analysing documents'}...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input bar pinned at bottom */}
      <div className="shrink-0 mt-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleAsk()}
            placeholder="Ask a question about the documents..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
            aria-label="Ask a question"
            disabled={loading}
          />
          <button
            onClick={() => handleAsk()}
            disabled={loading || !prompt.trim()}
            className="px-5 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V6m0 0l-6 6m6-6l6 6" /></svg>
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <p className="text-xs text-gray-400">
            {aiLive
              ? `Powered by ${aiSettings.model.split('/').pop()} via OpenRouter`
              : 'Using prebuilt responses'}
            {role === 'admin' && !aiLive && (
              <> · <Link to="/admin" className="text-blue-500 hover:underline no-underline">Configure AI</Link></>
            )}
          </p>
          {selectedDocIds.length > 0 && (
            <p className="text-xs text-blue-500">{selectedDocIds.length} document{selectedDocIds.length > 1 ? 's' : ''} in scope</p>
          )}
        </div>
      </div>

      {/* Save as Note Modal */}
      {saveModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={() => setSaveModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Save Chat as Note</h2>
            <p className="text-sm text-gray-500 mb-4">This will create a new document from the conversation with {messages.filter(m => m.role === 'assistant').length} AI response{messages.filter(m => m.role === 'assistant').length !== 1 ? 's' : ''}.</p>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document Title</label>
            <input
              type="text"
              value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)}
              placeholder={`AI Chat Notes — ${new Date().toLocaleDateString()}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-4 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSaveAsNote()}
            />
            <div className="text-xs text-gray-400 mb-4">
              The note will include all questions, answers, key points, and source references. It will be saved as a Draft document.
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setSaveModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">Cancel</button>
              <button onClick={handleSaveAsNote} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 cursor-pointer">Save Note</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
