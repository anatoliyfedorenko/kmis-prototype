export type Role = 'viewer' | 'admin' | 'external';

export type DocumentStatus = 'draft' | 'validated' | 'published';

export interface KMISDocument {
  id: string;
  title: string;
  filename: string;
  sizeMb: number;
  createdAt: string;
  updatedAt: string;
  version: string;
  status: DocumentStatus;
  metadata: {
    countries: string[];
    themes: string[];
    reportingPeriods: string[];
    documentType: string;
    project: string;
    contributor: string;
  };
  extractedText: string;
  previewUrl?: string;
}

export interface EvidenceUpdate {
  id: string;
  pageType: 'country' | 'theme';
  pageKey: string;
  date: string;
  title: string;
  body: string;
  tags: string[];
  sourceDocumentIds: string[];
}

export interface AIAnswer {
  id: string;
  createdAt: string;
  prompt: string;
  scope: {
    countries: string[];
    themes: string[];
    reportingPeriods: string[];
  };
  answerText: string;
  bullets: string[];
  sources: {
    documentId: string;
    snippet: string;
    referenceLabel: string;
  }[];
}

export interface Taxonomy {
  countries: string[];
  themes: string[];
  reportingPeriods: string[];
  documentTypes: string[];
  projects: string[];
  contributors: string[];
}

export interface CoPEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  type: string;
}
