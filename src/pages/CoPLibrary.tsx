import { useState, useMemo } from 'react';
import { useDocuments, useTaxonomy } from '../hooks/useStore';
import MultiSelect from '../components/MultiSelect';

export default function CoPLibrary() {
  const documents = useDocuments();
  const taxonomy = useTaxonomy();
  const published = documents.filter(d => d.status === 'published');
  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [docTypes, setDocTypes] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return published.filter(d => {
      if (search && !d.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (countries.length > 0 && !d.metadata.countries.some(c => countries.includes(c))) return false;
      if (themes.length > 0 && !d.metadata.themes.some(t => themes.includes(t))) return false;
      if (docTypes.length > 0 && !docTypes.includes(d.metadata.documentType)) return false;
      return true;
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [published, search, countries, themes, docTypes]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Learning Library</h1>
      <p className="text-gray-600 text-sm mb-6">Browse published learning resources from the programme.</p>

      <div className="mb-4">
        <input type="search" placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm" aria-label="Search library" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6">
        <MultiSelect label="Country" options={taxonomy.countries} selected={countries} onChange={setCountries} />
        <MultiSelect label="Theme" options={taxonomy.themes} selected={themes} onChange={setThemes} />
        <MultiSelect label="Type" options={taxonomy.documentTypes} selected={docTypes} onChange={setDocTypes} />
      </div>

      <p className="text-sm text-gray-500 mb-4">{filtered.length} resource{filtered.length !== 1 ? 's' : ''}</p>
      <div className="space-y-4">
        {filtered.map(d => (
          <div key={d.id} className="bg-white rounded-lg border border-gray-200 p-5 hover:shadow-sm">
            <h2 className="font-semibold text-gray-900 mb-1">{d.title}</h2>
            <div className="text-xs text-gray-500 mb-2">{d.metadata.countries.join(', ')} · {d.metadata.themes.join(', ')} · {d.metadata.documentType}</div>
            <p className="text-sm text-gray-600 leading-relaxed">{d.extractedText.substring(0, 200)}...</p>
            <div className="mt-3 text-xs text-gray-400">Updated: {new Date(d.updatedAt).toLocaleDateString()}</div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-gray-500 py-8">No resources match your criteria.</p>}
      </div>
    </div>
  );
}
