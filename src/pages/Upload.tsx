import { useState } from 'react';
import { useDocuments, useRole, useTaxonomy } from '../hooks/useStore';
import { addDocuments, updateDocument } from '../store';
import type { KMISDocument, DocumentStatus } from '../types';
import StatusBadge from '../components/StatusBadge';
import { Link } from 'react-router-dom';

interface FileEntry {
  name: string;
  size: number;
}

export default function Upload() {
  const role = useRole();
  const taxonomy = useTaxonomy();
  const documents = useDocuments();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [meta, setMeta] = useState({ countries: [] as string[], themes: [] as string[], reportingPeriods: [] as string[], documentType: '', project: '', contributor: '' });
  const [submitted, setSubmitted] = useState(false);
  const [, setTick] = useState(0);

  if (role !== 'admin') {
    return <div className="text-center py-12"><p className="text-gray-500 mb-4">This page is only available to Internal Admin users.</p><Link to="/" className="text-blue-600">Go to home</Link></div>;
  }

  const draftDocs = documents.filter(d => d.status === 'draft');

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const newFiles = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size }));
    setFiles(prev => [...prev, ...newFiles]);
  }

  function addMockFiles() {
    setFiles([
      { name: 'ghana-q1-2025-report.pdf', size: 2400000 },
      { name: 'indonesia-markets-update.pdf', size: 1800000 },
      { name: 'brazil-monitoring-jan2025.pdf', size: 1500000 },
    ]);
  }

  function handleSubmit() {
    const newDocs: KMISDocument[] = files.map((f, i) => ({
      id: `doc-new-${Date.now()}-${i}`,
      title: f.name.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      filename: f.name,
      sizeMb: +(f.size / 1048576).toFixed(1) || 1.5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 'v1',
      status: 'draft' as DocumentStatus,
      metadata: {
        countries: meta.countries.length ? meta.countries : ['Ghana'],
        themes: meta.themes.length ? meta.themes : ['Forest Governance'],
        reportingPeriods: meta.reportingPeriods.length ? meta.reportingPeriods : ['2025 Q1'],
        documentType: meta.documentType || 'Quarterly Report',
        project: meta.project || 'FGMC Phase 2',
        contributor: meta.contributor || 'Sarah Johnson',
      },
      extractedText: 'Extracted text content from ' + f.name + '. This document contains key findings and analysis relevant to the programme.',
    }));
    addDocuments(newDocs);
    setSubmitted(true);
    setFiles([]);
    setStep(1);
  }

  function handleValidate(docId: string) {
    updateDocument(docId, { status: 'validated' as DocumentStatus });
    setTick(t => t + 1);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload & Validate</h1>

      {/* Upload Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Upload Documents</h2>

        {submitted && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
            Documents uploaded successfully as Draft. Use the validation queue below to validate them.
          </div>
        )}

        {step === 1 && (
          <div>
            <div
              onDragOver={e => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
            >
              <div className="text-4xl mb-3">📁</div>
              <p className="text-gray-600 mb-2">Drag and drop files here, or</p>
              <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 cursor-pointer min-h-[44px] leading-[28px]">
                Browse Files
                <input type="file" multiple className="hidden" onChange={e => {
                  if (e.target.files) {
                    setFiles(prev => [...prev, ...Array.from(e.target.files!).map(f => ({ name: f.name, size: f.size }))]);
                  }
                }} />
              </label>
              <p className="mt-3 text-sm text-gray-400">or <button onClick={addMockFiles} className="text-blue-600 underline bg-transparent border-none cursor-pointer text-sm">add sample files</button></p>
            </div>

            {files.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium text-gray-700 mb-2">Selected Files ({files.length})</h3>
                <ul className="space-y-1">
                  {files.map((f, i) => (
                    <li key={i} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2 text-sm">
                      <span>📄 {f.name}</span>
                      <button onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer">Remove</button>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setStep(2)} className="mt-4 px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 min-h-[44px] cursor-pointer">
                  Next: Assign Metadata
                </button>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Apply metadata to all {files.length} files:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Countries</label>
                <select multiple value={meta.countries} onChange={e => setMeta({...meta, countries: Array.from(e.target.selectedOptions, o => o.value)})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[80px]">
                  {taxonomy.countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Themes</label>
                <select multiple value={meta.themes} onChange={e => setMeta({...meta, themes: Array.from(e.target.selectedOptions, o => o.value)})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[80px]">
                  {taxonomy.themes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reporting Period</label>
                <select multiple value={meta.reportingPeriods} onChange={e => setMeta({...meta, reportingPeriods: Array.from(e.target.selectedOptions, o => o.value)})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[80px]">
                  {taxonomy.reportingPeriods.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                <select value={meta.documentType} onChange={e => setMeta({...meta, documentType: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[44px]">
                  <option value="">Select...</option>
                  {taxonomy.documentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select value={meta.project} onChange={e => setMeta({...meta, project: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[44px]">
                  <option value="">Select...</option>
                  {taxonomy.projects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contributor</label>
                <select value={meta.contributor} onChange={e => setMeta({...meta, contributor: e.target.value})} className="w-full border border-gray-300 rounded px-3 py-2 text-sm min-h-[44px]">
                  <option value="">Select...</option>
                  {taxonomy.contributors.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-300 rounded font-medium hover:bg-gray-50 min-h-[44px] cursor-pointer bg-white">Back</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 min-h-[44px] cursor-pointer">
                Submit as Draft
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Validation Queue */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4">Validation Queue</h2>
        {draftDocs.length === 0 ? (
          <p className="text-gray-500 text-sm">No draft documents pending validation.</p>
        ) : (
          <div className="space-y-3">
            {draftDocs.map(d => (
              <div key={d.id} className="flex items-center justify-between border border-gray-100 rounded px-4 py-3 hover:bg-gray-50">
                <div>
                  <Link to={`/documents/${d.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm no-underline hover:underline">{d.title}</Link>
                  <div className="text-xs text-gray-500 mt-0.5">{d.metadata.countries.join(', ')} — {d.metadata.themes.join(', ')}</div>
                </div>
                <button onClick={() => handleValidate(d.id)} className="px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 min-h-[44px] cursor-pointer text-sm">
                  Validate
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
