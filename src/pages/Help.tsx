export default function Help() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Help & Guidance</h1>

      <div className="space-y-6">
        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-3">How to Upload and Tag Documents</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
            <li>Navigate to <strong>Upload & Validate</strong> from the main navigation.</li>
            <li>Drag and drop files or click "Browse Files" to select documents.</li>
            <li>Assign metadata: select country, theme, reporting period, document type, project, and contributor.</li>
            <li>Use "Apply to all" controls to set metadata for multiple files at once.</li>
            <li>Click "Submit as Draft" to add documents to the validation queue.</li>
            <li>Review and click "Validate" to make documents available to internal viewers.</li>
          </ol>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-3">How to Search Effectively</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
            <li>Use the <strong>search bar</strong> on the Documents page for keyword searches.</li>
            <li>Combine with <strong>filters</strong> (country, theme, period) to narrow results.</li>
            <li>Use <strong>Saved Searches</strong> dropdown for common queries.</li>
            <li>Status filter helps find Draft, Validated, or Published documents quickly.</li>
            <li>Search works across document titles and extracted text content.</li>
          </ul>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-3">How to Ask Good AI Questions</h2>
          <p className="text-sm text-gray-700 mb-3">The AI Q&A tool searches across your document collection and provides answers with source references.</p>
          <div className="mb-3">
            <h3 className="font-medium text-gray-900 text-sm mb-2">Tips for better results:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Be specific: include country names, themes, or time periods in your question.</li>
              <li>Use the scope filters to narrow the search to relevant documents.</li>
              <li>Ask about specific topics: risks, progress, recommendations, comparisons.</li>
              <li>Review the source references to verify the AI's answer.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm mb-2">Example prompts:</h3>
            <div className="space-y-2">
              <div className="bg-blue-50 px-3 py-2 rounded text-sm text-blue-700">"Summarise key findings on forest governance in Ghana for 2024-2025."</div>
              <div className="bg-blue-50 px-3 py-2 rounded text-sm text-blue-700">"What evidence do we have on markets and climate in Indonesia?"</div>
              <div className="bg-blue-50 px-3 py-2 rounded text-sm text-blue-700">"List the major risks mentioned across the selected documents."</div>
              <div className="bg-blue-50 px-3 py-2 rounded text-sm text-blue-700">"Compare forest governance approaches across Ghana, Indonesia and Brazil."</div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-3">What AI Can and Can't Do</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-green-700 text-sm mb-2">AI can:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Search across all documents in the collection</li>
                <li>Summarise findings from multiple documents</li>
                <li>Identify key themes, risks, and recommendations</li>
                <li>Provide source references for every claim</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-red-700 text-sm mb-2">AI can't:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                <li>Access information outside the document collection</li>
                <li>Make predictions about future outcomes</li>
                <li>Replace expert judgement and analysis</li>
                <li>Guarantee 100% accuracy — always check sources</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
            <p className="text-sm text-yellow-800"><strong>Always check sources.</strong> AI answers are generated from the document collection and should be verified against the original source documents.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
