import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDocuments, useRole, useTaxonomy } from '../hooks/useStore';
import StatusBadge from '../components/StatusBadge';
import MultiSelect from '../components/MultiSelect';

const savedSearches = [
  { label: 'Ghana Forest Governance 2024', filters: { countries: ['Ghana'], themes: ['Forest Governance'] } },
  { label: 'All Published Documents', filters: { status: ['published'] } },
  { label: 'Indonesia Climate Reports', filters: { countries: ['Indonesia'], themes: ['Climate'] } },
];

export default function DocumentsList() {
  const documents = useDocuments();
  const role = useRole();
  const taxonomy = useTaxonomy();

  const [search, setSearch] = useState('');
  const [countries, setCountries] = useState<string[]>([]);
  const [themes, setThemes] = useState<string[]>([]);
  const [periods, setPeriods] = useState<string[]>([]);
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [projects, setProjects] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return documents.filter(d => {
      if (role === 'viewer' && d.status === 'draft') return false;
      if (search && !d.title.toLowerCase().includes(search.toLowerCase()) && !d.extractedText.toLowerCase().includes(search.toLowerCase())) return false;
      if (countries.length > 0 && !d.metadata.countries.some(c => countries.includes(c))) return false;
      if (themes.length > 0 && !d.metadata.themes.some(t => themes.includes(t))) return false;
      if (periods.length > 0 && !d.metadata.reportingPeriods.some(p => periods.includes(p))) return false;
      if (docTypes.length > 0 && !docTypes.includes(d.metadata.documentType)) return false;
      if (projects.length > 0 && !projects.includes(d.metadata.project)) return false;
      if (statusFilter.length > 0 && !statusFilter.includes(d.status)) return false;
      return true;
    }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [documents, search, countries, themes, periods, docTypes, projects, statusFilter, role]);

  function applySavedSearch(idx: number) {
    const s = savedSearches[idx];
    if ('countries' in s.filters) setCountries(s.filters.countries || []);
    if ('themes' in s.filters) setThemes(s.filters.themes || []);
    if ('status' in s.filters) setStatusFilter((s.filters as any).status || []);
  }

  function clearFilters() {
    setSearch(''); setCountries([]); setThemes([]); setPeriods([]); setDocTypes([]); setProjects([]); setStatusFilter([]);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
        <div className="flex items-center gap-2">
          <label htmlFor="saved-search" className="text-sm text-gray-500">Saved Searches:</label>
          <select id="saved-search" onChange={e => { if (e.target.value) applySavedSearch(Number(e.target.value)); }} className="border border-gray-300 rounded px-3 py-2 text-sm bg-white min-h-[44px]" defaultValue="">
            <option value="">Select...</option>
            {savedSearches.map((s, i) => <option key={i} value={i}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search by keyword..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          aria-label="Search documents"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <MultiSelect label="Country" options={taxonomy.countries} selected={countries} onChange={setCountries} />
        <MultiSelect label="Theme" options={taxonomy.themes} selected={themes} onChange={setThemes} />
        <MultiSelect label="Period" options={taxonomy.reportingPeriods} selected={periods} onChange={setPeriods} />
        <MultiSelect label="Type" options={taxonomy.documentTypes} selected={docTypes} onChange={setDocTypes} />
        <MultiSelect label="Project" options={taxonomy.projects} selected={projects} onChange={setProjects} />
        <MultiSelect label="Status" options={['draft', 'validated', 'published']} selected={statusFilter} onChange={setStatusFilter} />
      </div>

      {(search || countries.length || themes.length || periods.length || docTypes.length || projects.length || statusFilter.length) ? (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-gray-500">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 underline bg-transparent border-none cursor-pointer">Clear all filters</button>
        </div>
      ) : null}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Title</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Country</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Theme</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">Period</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 hidden lg:table-cell">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 hidden md:table-cell">Updated</th>
              <th className="text-left px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(d => (
              <tr key={d.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link to={`/documents/${d.id}`} className="text-blue-600 hover:text-blue-800 font-medium no-underline hover:underline">{d.title}</Link>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{d.metadata.countries.join(', ')}</td>
                <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{d.metadata.themes.join(', ')}</td>
                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{d.metadata.reportingPeriods.join(', ')}</td>
                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{d.metadata.documentType}</td>
                <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
                <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{new Date(d.updatedAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link to={`/documents/${d.id}`} className="text-blue-600 hover:text-blue-800 text-xs no-underline">View</Link>
                    {role === 'admin' && <Link to={`/documents/${d.id}`} className="text-gray-600 hover:text-gray-800 text-xs no-underline">Edit</Link>}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">No documents match your criteria.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
