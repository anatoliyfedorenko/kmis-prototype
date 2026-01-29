import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRole, useTaxonomy, useDocuments } from '../hooks/useStore';
import { getMockAIAnswer, getDocument } from '../store';
import MultiSelect from '../components/MultiSelect';
import type { AIAnswer } from '../types';

const suggestedPrompts = [
  'Summarise key findings on forest governance in Ghana for 2024–2025.',
  'What evidence do we have on markets and climate in Indonesia?',
  'List the major risks mentioned across the selected documents.',
  'What progress has been made on REDD+ across programme countries?',
  'How are communities benefiting from forest programmes?',
  'What are the trends in certified timber markets?',
];

export default function AIChat() {
  const role = useRole();
  const taxonomy = useTaxonomy();
  const [prompt, setPrompt] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [answer, setAnswer] = useState<AIAnswer | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRefs, setShowRefs] = useState(true);

  if (role === 'external') {
    return <div className="text-center py-12"><p className="text-gray-500 mb-4">AI Q&A is only available to internal users.</p><Link to="/cop" className="text-blue-600">Go to CoP Home</Link></div>;
  }

  function handleAsk(q?: string) {
    const question = q || prompt;
    if (!question.trim()) return;
    setLoading(true);
    setPrompt(question);
    // Simulate slight delay
    setTimeout(() => {
      const result = getMockAIAnswer(question, { countries, themes, reportingPeriods: periods });
      setAnswer(result);
      setLoading(false);
    }, 800);
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Scope Panel */}
      <div className="lg:w-64 shrink-0">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-900 mb-3">Scope Selection</h2>
          <p className="text-xs text-gray-500 mb-3">Narrow the AI search to specific documents.</p>
          <div className="space-y-3">
            <MultiSelect label="Country" options={taxonomy.countries} selected={countries} onChange={setCountries} />
            <MultiSelect label="Theme" options={taxonomy.themes} selected={themes} onChange={setThemes} />
            <MultiSelect label="Period" options={taxonomy.reportingPeriods} selected={periods} onChange={setPeriods} />
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="flex-1">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">AI Q&A</h1>
        <p className="text-sm text-gray-600 mb-4">Ask questions in plain language about the document collection. Answers include source references for transparency.</p>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAsk()}
              placeholder="Ask a question about the documents..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              aria-label="Ask a question"
            />
            <button
              onClick={() => handleAsk()}
              disabled={loading || !prompt.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] cursor-pointer"
            >
              {loading ? 'Thinking...' : 'Ask'}
            </button>
          </div>
        </div>

        {/* Suggested Prompts */}
        {!answer && (
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-2">Try a suggested question:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedPrompts.map((sp, i) => (
                <button
                  key={i}
                  onClick={() => handleAsk(sp)}
                  className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 border border-blue-200 cursor-pointer"
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <div className="animate-pulse text-gray-400">Analysing documents and generating response...</div>
          </div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-1">Question</div>
              <p className="font-medium text-gray-900">{answer.prompt}</p>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-1">Summary</div>
              <p className="text-gray-700 leading-relaxed">{answer.answerText}</p>
            </div>

            <div className="mb-4">
              <div className="text-xs text-gray-400 mb-1">Key Points</div>
              <ul className="space-y-2">
                {answer.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-blue-500 mt-1 shrink-0">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-gray-400">Sources ({answer.sources.length})</div>
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={showRefs} onChange={e => setShowRefs(e.target.checked)} className="h-4 w-4" />
                  Show reference snippets
                </label>
              </div>
              <div className="space-y-3">
                {answer.sources.map((s, i) => {
                  const doc = getDocument(s.documentId);
                  return (
                    <div key={i} className="border border-gray-100 rounded p-3 bg-gray-50">
                      <div className="flex items-center gap-2 mb-1">
                        <Link to={`/documents/${s.documentId}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm no-underline hover:underline">
                          {doc?.title || s.documentId}
                        </Link>
                        <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">{s.referenceLabel}</span>
                      </div>
                      {showRefs && (
                        <p className="text-xs text-gray-600 italic mt-1 bg-yellow-50 px-2 py-1 rounded border-l-2 border-yellow-300">
                          "{s.snippet}"
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-xs text-gray-400">Answers are ephemeral and not saved by default.</p>
              <button className="text-sm text-blue-600 hover:text-blue-800 bg-transparent border border-blue-200 px-3 py-1.5 rounded cursor-pointer hover:bg-blue-50">
                Save as Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
