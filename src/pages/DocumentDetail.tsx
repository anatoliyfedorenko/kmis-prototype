import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useRole } from '../hooks/useStore';
import { getDocument, updateDocument } from '../store';
import { useTaxonomy } from '../hooks/useStore';
import StatusBadge from '../components/StatusBadge';
import type { DocumentStatus } from '../types';

export default function DocumentDetail() {
  const { id } = useParams<{ id: string }>();
  const role = useRole();
  const taxonomy = useTaxonomy();
  const doc = getDocument(id || '');
  const [tab, setTab] = useState<'preview' | 'versions' | 'audit'>('preview');
  const [editing, setEditing] = useState(false);
  const [editMeta, setEditMeta] = useState(doc?.metadata);
  const [, setTick] = useState(0);

  if (!doc) return <div className="text-center py-12 text-gray-500">Document not found. <Link to="/documents" className="text-blue-600">Back to documents</Link></div>;

  function handleValidate() {
    updateDocument(doc!.id, { status: 'validated' as DocumentStatus });
    setTick(t => t + 1);
  }

  function handlePublish() {
    updateDocument(doc!.id, { status: 'published' as DocumentStatus });
    setTick(t => t + 1);
  }

  function handleSaveMeta() {
    if (editMeta) {
      updateDocument(doc!.id, { metadata: editMeta });
      setEditing(false);
      setTick(t => t + 1);
    }
  }

  const refreshedDoc = getDocument(id || '') || doc;

  const mockVersions = [
    { version: refreshedDoc.version, date: refreshedDoc.updatedAt, note: 'Current version' },
    ...(refreshedDoc.version !== 'v1' ? [{ version: 'v1', date: refreshedDoc.createdAt, note: 'Initial upload' }] : []),
  ];

  const mockAudit = [
    { action: 'Uploaded', by: refreshedDoc.metadata.contributor, date: refreshedDoc.createdAt },
    ...(refreshedDoc.status !== 'draft' ? [{ action: 'Validated', by: 'Admin User', date: refreshedDoc.updatedAt }] : []),
    ...(refreshedDoc.status === 'published' ? [{ action: 'Published to CoP', by: 'Admin User', date: refreshedDoc.updatedAt }] : []),
  ];

  const mockCitations = [
    { prompt: 'Summarise key findings on forest governance...', id: 'ai-001' },
    { prompt: 'What evidence do we have on markets...', id: 'ai-002' },
  ];

  return (
    <div>
      <div className="mb-4">
        <Link to="/documents" className="text-sm text-blue-600 hover:text-blue-800 no-underline">← Back to Documents</Link>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{refreshedDoc.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <StatusBadge status={refreshedDoc.status} />
              <span>Version {refreshedDoc.version}</span>
              <span>Updated {new Date(refreshedDoc.updatedAt).toLocaleDateString()}</span>
              <span>{refreshedDoc.filename} ({refreshedDoc.sizeMb} MB)</span>
            </div>
          </div>
          {role === 'admin' && (
            <div className="flex gap-2">
              {refreshedDoc.status === 'draft' && (
                <button onClick={handleValidate} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 min-h-[44px] cursor-pointer">Mark as Validated</button>
              )}
              {refreshedDoc.status === 'validated' && (
                <button onClick={handlePublish} className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 min-h-[44px] cursor-pointer">Publish to CoP</button>
              )}
              <button onClick={() => { setEditing(!editing); setEditMeta(refreshedDoc.metadata); }} className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 min-h-[44px] cursor-pointer bg-white">
                {editing ? 'Cancel Edit' : 'Edit Metadata'}
              </button>
            </div>
          )}
          {role === 'viewer' && (
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 min-h-[44px] cursor-pointer bg-white" onClick={() => alert('Download simulated')}>Download</button>
              <button className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 min-h-[44px] cursor-pointer bg-white" onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Link copied!'); }}>Copy Link</button>
            </div>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Metadata</h2>
        {editing && editMeta ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Countries</label>
              <select multiple value={editMeta.countries} onChange={e => setEditMeta({...editMeta, countries: Array.from(e.target.selectedOptions, o => o.value)})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                {taxonomy.countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Themes</label>
              <select multiple value={editMeta.themes} onChange={e => setEditMeta({...editMeta, themes: Array.from(e.target.selectedOptions, o => o.value)})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                {taxonomy.themes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
              <select value={editMeta.documentType} onChange={e => setEditMeta({...editMeta, documentType: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                {taxonomy.documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select value={editMeta.project} onChange={e => setEditMeta({...editMeta, project: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                {taxonomy.projects.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contributor</label>
              <select value={editMeta.contributor} onChange={e => setEditMeta({...editMeta, contributor: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm">
                {taxonomy.contributors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={handleSaveMeta} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 min-h-[44px] cursor-pointer">Save Changes</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><span className="text-gray-500">Countries:</span> <span className="font-medium">{refreshedDoc.metadata.countries.join(', ')}</span></div>
            <div><span className="text-gray-500">Themes:</span> <span className="font-medium">{refreshedDoc.metadata.themes.join(', ')}</span></div>
            <div><span className="text-gray-500">Periods:</span> <span className="font-medium">{refreshedDoc.metadata.reportingPeriods.join(', ')}</span></div>
            <div><span className="text-gray-500">Type:</span> <span className="font-medium">{refreshedDoc.metadata.documentType}</span></div>
            <div><span className="text-gray-500">Project:</span> <span className="font-medium">{refreshedDoc.metadata.project}</span></div>
            <div><span className="text-gray-500">Contributor:</span> <span className="font-medium">{refreshedDoc.metadata.contributor}</span></div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="border-b border-gray-200 flex">
          {(['preview', 'versions', 'audit'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px cursor-pointer bg-transparent ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {t === 'preview' ? 'Document Preview' : t === 'versions' ? 'Versions' : 'Audit Trail'}
            </button>
          ))}
        </div>
        <div className="p-6">
          {tab === 'preview' && (
            <div>
              <div className="bg-gray-100 border border-gray-200 rounded-lg p-8 mb-4 text-center text-gray-500">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-sm">PDF Preview</p>
                <p className="text-xs text-gray-400 mt-1">{refreshedDoc.filename}</p>
              </div>
              <h3 className="font-medium text-gray-700 mb-2">Extracted Text</h3>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded">{refreshedDoc.extractedText}</p>
            </div>
          )}
          {tab === 'versions' && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th className="pb-2">Version</th><th className="pb-2">Date</th><th className="pb-2">Note</th></tr></thead>
              <tbody>
                {mockVersions.map((v, i) => (
                  <tr key={i} className="border-t border-gray-100"><td className="py-2 font-medium">{v.version}</td><td className="py-2">{new Date(v.date).toLocaleDateString()}</td><td className="py-2 text-gray-500">{v.note}</td></tr>
                ))}
              </tbody>
            </table>
          )}
          {tab === 'audit' && (
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-500"><th className="pb-2">Action</th><th className="pb-2">By</th><th className="pb-2">Date</th></tr></thead>
              <tbody>
                {mockAudit.map((a, i) => (
                  <tr key={i} className="border-t border-gray-100"><td className="py-2 font-medium">{a.action}</td><td className="py-2">{a.by}</td><td className="py-2 text-gray-500">{new Date(a.date).toLocaleDateString()}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Ask AI about this document */}
      {role !== 'external' && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">Ask AI About This Document</h2>
          <p className="text-sm text-gray-600 mb-3">Start an AI conversation scoped to this document.</p>
          <div className="flex flex-wrap gap-2">
            <Link
              to={`/ai?doc=${refreshedDoc.id}&prompt=${encodeURIComponent('Summarise the key findings of this document.')}`}
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 border border-blue-200 no-underline"
            >
              Summarise key findings
            </Link>
            <Link
              to={`/ai?doc=${refreshedDoc.id}&prompt=${encodeURIComponent('What are the main risks identified in this document?')}`}
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 border border-blue-200 no-underline"
            >
              Identify main risks
            </Link>
            <Link
              to={`/ai?doc=${refreshedDoc.id}&prompt=${encodeURIComponent('What recommendations does this document make?')}`}
              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 border border-blue-200 no-underline"
            >
              List recommendations
            </Link>
            <Link
              to={`/ai?doc=${refreshedDoc.id}`}
              className="px-3 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 no-underline"
            >
              Ask a custom question
            </Link>
          </div>
        </div>
      )}

      {/* Cited in AI answers */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-3">Cited in AI Answers</h2>
        <ul className="space-y-2">
          {mockCitations.map(c => (
            <li key={c.id} className="text-sm">
              <Link to="/ai" className="text-blue-600 hover:text-blue-800 no-underline hover:underline">"{c.prompt}"</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
