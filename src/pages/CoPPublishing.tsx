import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocuments, useRole } from '../hooks/useStore';
import { updateDocument } from '../store';
import StatusBadge from '../components/StatusBadge';

export default function CoPPublishing() {
  const documents = useDocuments();
  const role = useRole();
  const [, setTick] = useState(0);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [pubDescription, setPubDescription] = useState('');
  const [pubSection, setPubSection] = useState('Learning Library');

  if (role !== 'admin') {
    return <div className="text-center py-12"><p className="text-gray-500 mb-4">This page is only available to Internal Admin users.</p><Link to="/" className="text-blue-600">Go to home</Link></div>;
  }

  const readyToPublish = documents.filter(d => d.status === 'validated');
  const published = documents.filter(d => d.status === 'published');

  function handlePublish(id: string) {
    updateDocument(id, { status: 'published' as any });
    setPublishingId(null);
    setPubDescription('');
    setTick(t => t + 1);
  }

  function handleUnpublish(id: string) {
    updateDocument(id, { status: 'validated' as any });
    setTick(t => t + 1);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">CoP Publishing</h1>

      {/* Publish modal */}
      {publishingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Publish to Community of Practice</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CoP Section</label>
                <select value={pubSection} onChange={e => setPubSection(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[44px]">
                  <option>Learning Library</option>
                  <option>Thematic Page</option>
                  <option>Featured Resource</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Public Description</label>
                <textarea value={pubDescription} onChange={e => setPubDescription(e.target.value)} rows={3} placeholder="Short description for external audience..." className="w-full border border-gray-300 rounded px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setPublishingId(null)} className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 min-h-[44px] cursor-pointer bg-white">Cancel</button>
              <button onClick={() => handlePublish(publishingId)} className="px-6 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 min-h-[44px] cursor-pointer">Confirm Publish</button>
            </div>
          </div>
        </div>
      )}

      {/* Ready to publish */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Ready to Publish ({readyToPublish.length})</h2>
        {readyToPublish.length === 0 ? (
          <p className="text-gray-500 text-sm">No validated documents ready for publishing.</p>
        ) : (
          <div className="space-y-3">
            {readyToPublish.map(d => (
              <div key={d.id} className="flex items-center justify-between border border-gray-100 rounded px-4 py-3 hover:bg-gray-50">
                <div>
                  <Link to={"/documents/" + d.id} className="text-blue-600 hover:text-blue-800 font-medium text-sm no-underline hover:underline">{d.title}</Link>
                  <div className="text-xs text-gray-500 mt-0.5">{d.metadata.countries.join(', ')} — {d.metadata.themes.join(', ')}</div>
                </div>
                <button onClick={() => setPublishingId(d.id)} className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700 min-h-[44px] cursor-pointer text-sm">
                  Publish to CoP
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Published */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Published ({published.length})</h2>
        {published.length === 0 ? (
          <p className="text-gray-500 text-sm">No published documents yet.</p>
        ) : (
          <div className="space-y-3">
            {published.map(d => (
              <div key={d.id} className="flex items-center justify-between border border-gray-100 rounded px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <StatusBadge status={d.status} />
                  <div>
                    <Link to={"/documents/" + d.id} className="text-blue-600 hover:text-blue-800 font-medium text-sm no-underline hover:underline">{d.title}</Link>
                    <div className="text-xs text-gray-500 mt-0.5">{d.metadata.countries.join(', ')} — {d.metadata.themes.join(', ')}</div>
                  </div>
                </div>
                <button onClick={() => handleUnpublish(d.id)} className="px-4 py-2 border border-red-300 text-red-600 rounded font-medium hover:bg-red-50 min-h-[44px] cursor-pointer text-sm bg-white">
                  Unpublish
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
