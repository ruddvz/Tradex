import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Landing } from './pages/Landing';
import { Dashboard } from './pages/Dashboard';
import { Journal } from './pages/Journal';
import { Playbooks } from './pages/Playbooks';
import { PropFirm } from './pages/PropFirm';
import { Notebook } from './pages/Notebook';
import { Reports } from './pages/Reports';
import { Calculator } from './pages/Calculator';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/landing" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/playbooks" element={<Playbooks />} />
          <Route path="/propfirm" element={<PropFirm />} />
          <Route path="/notebook" element={<Notebook />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
