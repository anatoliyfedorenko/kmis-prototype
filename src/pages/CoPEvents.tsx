import { useEvents } from '../hooks/useStore';

export default function CoPEvents() {
  const events = useEvents();
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Events Calendar</h1>
      <p className="text-gray-600 text-sm mb-6">Upcoming events, webinars, and learning exchanges.</p>

      <div className="space-y-4">
        {sorted.map(evt => (
          <div key={evt.id} className="bg-white rounded-lg border border-gray-200 p-5 flex items-start gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center min-w-[70px]">
              <div className="text-xs text-blue-600 font-medium">{new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}</div>
              <div className="text-2xl font-bold text-blue-800">{new Date(evt.date).getDate()}</div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">{evt.title}</h2>
              <div className="text-xs text-gray-500 mb-2"><span className="bg-gray-100 px-2 py-0.5 rounded">{evt.type}</span> · {new Date(evt.date).toLocaleDateString()}</div>
              <p className="text-sm text-gray-600">{evt.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
