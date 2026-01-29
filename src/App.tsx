import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import DocumentsList from './pages/DocumentsList';
import DocumentDetail from './pages/DocumentDetail';
import Upload from './pages/Upload';
import AIChat from './pages/AIChat';
import EvidenceIndex from './pages/EvidenceIndex';
import EvidenceDetail from './pages/EvidenceDetail';
import CoPPublishing from './pages/CoPPublishing';
import CoPHome from './pages/CoPHome';
import CoPLibrary from './pages/CoPLibrary';
import CoPThemes from './pages/CoPThemes';
import CoPEvents from './pages/CoPEvents';
import CoPAbout from './pages/CoPAbout';
import Help from './pages/Help';
import AdminSettings from './pages/AdminSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/documents" element={<DocumentsList />} />
          <Route path="/documents/:id" element={<DocumentDetail />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/ai" element={<AIChat />} />
          <Route path="/evidence" element={<EvidenceIndex />} />
          <Route path="/evidence/countries/:slug" element={<EvidenceDetail />} />
          <Route path="/evidence/themes/:slug" element={<EvidenceDetail />} />
          <Route path="/cop/publishing" element={<CoPPublishing />} />
          <Route path="/cop" element={<CoPHome />} />
          <Route path="/cop/library" element={<CoPLibrary />} />
          <Route path="/cop/themes" element={<CoPThemes />} />
          <Route path="/cop/events" element={<CoPEvents />} />
          <Route path="/cop/upload" element={<Upload />} />
          <Route path="/cop/about" element={<CoPAbout />} />
          <Route path="/help" element={<Help />} />
          <Route path="/admin" element={<AdminSettings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
