import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEvidenceUpdates } from '../hooks/useStore';

const countryPages = [
  { key: 'ghana', name: 'Ghana', flag: '🇬🇭' },
  { key: 'indonesia', name: 'Indonesia', flag: '🇮🇩' },
  { key: 'brazil', name: 'Brazil', flag: '🇧🇷' },
];

const themePages = [
  { key: 'forest-governance', name: 'Forest Governance', icon: '🌳' },
  { key: 'markets', name: 'Markets', icon: '📊' },
  { key: 'climate', name: 'Climate', icon: '🌍' },
];

export default function EvidenceIndex() {
  const updates = useEvidenceUpdates();
  const [tab, setTab] = useState<'countries' | 'themes'>('countries');
  const [search, setSearch] = useState('');

  function getPageStats(pageType: string, pageKey: string) {
    const pageUpdates = updates.filter(u => u.pageType === pageType && u.pageKey === pageKey);
    const lastUpdated = pageUpdates.length > 0 ? pageUpdates.sort((a, b) => b.date.localeCompare(a.date))[0].date : null;
    return { count: pageUpdates.length, lastUpdated };
  }

  const pages = tab === 'countries' ? countryPages : themePages;
  const filtered = pages.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Evidence Pages</h1>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setTab('countries')}
            className={"px-4 py-2 text-sm font-medium cursor-pointer " + (tab === 'countries' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}
          >
            Countries
          </button>
          <button
            onClick={() => setTab('themes')}
            className={"px-4 py-2 text-sm font-medium cursor-pointer " + (tab === 'themes' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50')}
          >
            Themes
          </button>
        </div>
        <input
          type="search"
          placeholder="Search pages..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded text-sm min-h-[44px]"
          aria-label="Search evidence pages"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {filtered.map(p => {
          const stats = getPageStats(tab === 'countries' ? 'country' : 'theme', p.key);
          const linkBase = tab === 'countries' ? '/evidence/countries/' : '/evidence/themes/';
          return (
            <Link
              key={p.key}
              to={linkBase + p.key}
              className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md hover:border-blue-300 transition-all no-underline"
            >
              <div className="text-3xl mb-3">{'flag' in p ? (p as any).flag : (p as any).icon}</div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">{p.name}</h2>
              <div className="text-sm text-gray-500 space-y-1">
                <div>{stats.count} update{stats.count !== 1 ? 's' : ''}</div>
                {stats.lastUpdated && <div>Last updated: {new Date(stats.lastUpdated).toLocaleDateString()}</div>}
              </div>
              <div className="mt-3 text-sm text-blue-600 font-medium">View page →</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
