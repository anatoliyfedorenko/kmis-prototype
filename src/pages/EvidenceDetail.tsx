import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRole, useDocuments } from '../hooks/useStore';
import { getEvidenceForPage, addEvidenceUpdate, deleteEvidenceUpdate, getDocument } from '../store';
import type { EvidenceUpdate } from '../types';

const pageNames: Record<string, string> = {
  ghana: 'Ghana', indonesia: 'Indonesia', brazil: 'Brazil',
  'forest-governance': 'Forest Governance', markets: 'Markets', climate: 'Climate',
};

const riskSnapshots: Record<string, { risks: string[]; confidence: string }> = {
  ghana: { risks: ['Cross-border timber trade enforcement gaps', 'Community benefit-sharing compliance at 68%', 'FLEGT licensing readiness gaps in chain-of-custody', 'Cocoa-forest landscape coordination challenges'], confidence: 'Medium' },
  indonesia: { risks: ['Elevated fire risk during El Nino years', 'Peatland degradation in some social forestry areas', 'Coordination gaps between national and sub-national authorities', 'Drought threat to 3.5 million hectares'], confidence: 'Medium' },
  brazil: { risks: ['Cerrado deforestation acceleration (+15% Q2 2024)', 'Illegal mining and land grabbing in Amazon', 'Agricultural expansion pressures', 'Enforcement gaps in new municipalities'], confidence: 'High' },
  'forest-governance': { risks: ['Enforcement capacity constraints across all countries', 'Cross-border trade monitoring gaps', 'Digital engagement connectivity barriers', 'Benefit-sharing mechanism inconsistencies'], confidence: 'Medium' },
  markets: { risks: ['EU Deforestation Regulation adjustment costs', 'SME participation barriers in certification', 'Price volatility for non-certified timber', 'Supply chain due diligence implementation gaps'], confidence: 'Medium' },
  climate: { risks: ['Drought frequency increasing across regions', 'Fire risk in peatlands and dry forests', 'Carbon market integrity concerns', 'Restoration survival rates varying (72% average)'], confidence: 'Medium' },
};

const tagColors: Record<string, string> = {
  risk: 'bg-red-100 text-red-700',
  context: 'bg-blue-100 text-blue-700',
  policy: 'bg-purple-100 text-purple-700',
  stakeholders: 'bg-green-100 text-green-700',
  signals: 'bg-orange-100 text-orange-700',
};

const predefinedTags = ['risk', 'context', 'policy', 'stakeholders', 'signals'];

export default function EvidenceDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || '';
  const role = useRole();
  const documents = useDocuments();

  const isCountry = window.location.pathname.includes('/countries/');
  const pageType = isCountry ? 'country' : 'theme';
  const pageName = pageNames[slug] || slug;

  const [, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);

  const updates = getEvidenceForPage(pageType, slug);
  const snapshot = riskSnapshots[slug];

  // Add update form
  const [showForm, setShowForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formBody, setFormBody] = useState('');
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formSources, setFormSources] = useState<string[]>([]);

  function handleAddUpdate() {
    if (!formTitle.trim() || !formBody.trim()) return;
    const update: EvidenceUpdate = {
      id: 'eu-new-' + Date.now(),
      pageType,
      pageKey: slug,
      date: new Date().toISOString(),
      title: formTitle,
      body: formBody,
      tags: formTags,
      sourceDocumentIds: formSources,
    };
    addEvidenceUpdate(update);
    setFormTitle(''); setFormBody(''); setFormTags([]); setFormSources([]); setShowForm(false);
    refresh();
  }

  function handleDelete(id: string) {
    deleteEvidenceUpdate(id);
    refresh();
  }

  const confidenceColors: Record<string, string> = { Low: 'text-red-600', Medium: 'text-yellow-600', High: 'text-green-600' };

  return (
    <div>
      <div className="mb-4">
        <Link to="/evidence" className="text-sm text-blue-600 hover:text-blue-800 no-underline">← Back to Evidence Pages</Link>
      </div>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageName}</h1>
          <p className="text-sm text-gray-500 mt-1">{isCountry ? 'Country' : 'Thematic'} Evidence Page · {updates.length} updates</p>
        </div>
        {role === 'admin' && (
          <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 min-h-[44px] cursor-pointer">
            {showForm ? 'Cancel' : '+ Add Update'}
          </button>
        )}
      </div>

      {/* Admin add form */}
      {showForm && role === 'admin' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Add Update</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={formTitle} onChange={e => setFormTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
              <textarea value={formBody} onChange={e => setFormBody(e.target.value)} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div className="flex flex-wrap gap-2">
                {predefinedTags.map(tag => (
                  <button key={tag} type="button" onClick={() => setFormTags(formTags.includes(tag) ? formTags.filter(t => t !== tag) : [...formTags, tag])}
                    className={(formTags.includes(tag) ? 'ring-2 ring-blue-400 ' : '') + (tagColors[tag] || 'bg-gray-100 text-gray-700') + ' px-3 py-1 rounded-full text-sm cursor-pointer border-none'}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link Sources</label>
              <select multiple value={formSources} onChange={e => setFormSources(Array.from(e.target.selectedOptions, o => o.value))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[80px]">
                {documents.slice(0, 15).map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
              </select>
            </div>
            <button onClick={handleAddUpdate} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 min-h-[44px] cursor-pointer">Save Update</button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Timeline */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Living Updates</h2>
          {updates.length === 0 ? (
            <p className="text-gray-500 text-sm">No updates yet for this page.</p>
          ) : (
            <div className="space-y-4">
              {updates.map(u => (
                <div key={u.id} className="bg-white rounded-lg border border-gray-200 p-5 relative">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs text-gray-400 mb-1">{new Date(u.date).toLocaleDateString()}</div>
                      <h3 className="font-semibold text-gray-900 mb-2">{u.title}</h3>
                    </div>
                    {role === 'admin' && (
                      <button onClick={() => handleDelete(u.id)} className="text-xs text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">Delete</button>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed mb-3">{u.body}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {u.tags.map(tag => (
                      <span key={tag} className={(tagColors[tag] || 'bg-gray-100 text-gray-700') + ' px-2.5 py-0.5 rounded-full text-xs font-medium'}>{tag}</span>
                    ))}
                  </div>
                  {u.sourceDocumentIds.length > 0 && (
                    <div className="text-xs text-gray-500">
                      Sources:{' '}
                      {u.sourceDocumentIds.map((sid, i) => {
                        const sdoc = getDocument(sid);
                        return (
                          <span key={sid}>
                            {i > 0 && ', '}
                            <Link to={'/documents/' + sid} className="text-blue-600 hover:text-blue-800 no-underline hover:underline">{sdoc?.title || sid}</Link>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Snapshot */}
        {snapshot && (
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Risk Snapshot</h2>
              <ul className="space-y-2 mb-4">
                {snapshot.risks.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-red-400 mt-0.5 shrink-0">⚠</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="text-sm">
                <span className="text-gray-500">Confidence: </span>
                <span className={'font-semibold ' + (confidenceColors[snapshot.confidence] || 'text-gray-700')}>{snapshot.confidence}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
