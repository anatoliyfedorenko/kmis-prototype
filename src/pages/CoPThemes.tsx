import { useDocuments } from '../hooks/useStore';

const themes = [
  { key: 'forest-governance', name: 'Forest Governance', icon: '🌳', description: 'Governance frameworks, VPA implementation, legality verification, and institutional strengthening across programme countries.' },
  { key: 'markets', name: 'Markets', icon: '📊', description: 'Timber trade, certification markets, supply chain development, and economic opportunities in sustainable forestry.' },
  { key: 'climate', name: 'Climate', icon: '🌍', description: 'REDD+ implementation, climate finance, adaptation activities, and carbon monitoring across forest landscapes.' },
];

export default function CoPThemes() {
  const documents = useDocuments();
  const published = documents.filter(d => d.status === 'published');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Thematic Pages</h1>
      <p className="text-gray-600 text-sm mb-6">Explore resources organized by programme themes.</p>

      <div className="grid md:grid-cols-3 gap-6">
        {themes.map(t => {
          const count = published.filter(d => d.metadata.themes.includes(t.name)).length;
          const featured = published.filter(d => d.metadata.themes.includes(t.name)).slice(0, 3);
          return (
            <div key={t.key} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="text-3xl mb-3">{t.icon}</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{t.name}</h2>
              <p className="text-sm text-gray-600 mb-4">{t.description}</p>
              <div className="text-xs text-gray-500 mb-3">{count} published resource{count !== 1 ? 's' : ''}</div>
              {featured.length > 0 && (
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">Featured:</div>
                  {featured.map(d => (
                    <div key={d.id} className="text-sm text-gray-700 mb-1 truncate">{d.title}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
