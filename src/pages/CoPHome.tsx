import { Link } from 'react-router-dom';
import { useDocuments, useEvents } from '../hooks/useStore';

export default function CoPHome() {
  const documents = useDocuments();
  const events = useEvents();
  const published = documents.filter(d => d.status === 'published');
  const upcomingEvents = events.sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const recentDocs = published.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4);

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-lg p-8 mb-8">
        <h1 className="text-3xl font-bold mb-3">Community of Practice Portal</h1>
        <p className="text-blue-100 text-lg mb-4">Knowledge Sharing Platform</p>
        <p className="text-blue-200 text-sm max-w-2xl">Welcome to the Community of Practice. Access published learning outputs, thematic resources, and upcoming events from the programme knowledge base.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/cop/library" className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all no-underline">
          <div className="text-2xl mb-2">📚</div>
          <h2 className="font-semibold text-gray-900">Learning Library</h2>
          <p className="text-sm text-gray-500 mt-1">{published.length} published resources</p>
        </Link>
        <Link to="/cop/themes" className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all no-underline">
          <div className="text-2xl mb-2">🏷️</div>
          <h2 className="font-semibold text-gray-900">Thematic Pages</h2>
          <p className="text-sm text-gray-500 mt-1">Forest Governance, Markets, Climate</p>
        </Link>
        <Link to="/cop/events" className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all no-underline">
          <div className="text-2xl mb-2">📅</div>
          <h2 className="font-semibold text-gray-900">Events Calendar</h2>
          <p className="text-sm text-gray-500 mt-1">{events.length} upcoming events</p>
        </Link>
        <Link to="/cop/about" className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md hover:border-blue-300 transition-all no-underline">
          <div className="text-2xl mb-2">ℹ️</div>
          <h2 className="font-semibold text-gray-900">About / Access</h2>
          <p className="text-sm text-gray-500 mt-1">Information and access requests</p>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Publications</h2>
          <div className="space-y-3">
            {recentDocs.map(d => (
              <div key={d.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <Link to={"/cop/library"} className="text-blue-600 hover:text-blue-800 font-medium text-sm no-underline hover:underline">{d.title}</Link>
                <div className="text-xs text-gray-500 mt-0.5">{d.metadata.countries.join(', ')} · {d.metadata.documentType}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h2>
          <div className="space-y-3">
            {upcomingEvents.map(evt => (
              <div key={evt.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                <div className="font-medium text-sm text-gray-900">{evt.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{new Date(evt.date).toLocaleDateString()} · {evt.type}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
