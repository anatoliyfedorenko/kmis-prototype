import type { DocumentStatus } from '../types';

const styles: Record<DocumentStatus, string> = {
  draft: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  validated: 'bg-blue-100 text-blue-800 border-blue-300',
  published: 'bg-green-100 text-green-800 border-green-300',
};

const labels: Record<DocumentStatus, string> = {
  draft: 'Draft',
  validated: 'Validated',
  published: 'Published',
};

export default function StatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}
