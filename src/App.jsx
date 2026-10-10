import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/Sidebar.jsx';
import MobileTopBar from './components/MobileTopBar.jsx';
import { QuoteProvider } from './hooks/useQuote.jsx';
import { ToastProvider } from './hooks/useToast.jsx';
import About from './pages/About.jsx';
import Playground from './pages/Playground.jsx';
import CaseStudies from './pages/CaseStudies.jsx';
import Read from './pages/Read.jsx';
import { sims } from './playground/index.js';
import { caseStudies, journal } from './data/content.js';
import { lifeUpdates } from './data/lifeUpdates.js';
import Journal from './pages/Journal.jsx';
import LifeUpdates from './pages/LifeUpdates.jsx';
import './utils/theme.js';

export default function App() {
  const location = useLocation();
  const [open, setOpen] = useState(() => window.innerWidth > 860);

  // "[" toggles the sidebar
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === '[' && !e.metaKey && !e.ctrlKey) setOpen((o) => !o);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <QuoteProvider>
      <ToastProvider>
        <div className="shell">
          <Sidebar open={open} onOpenChange={setOpen} />
          <MobileTopBar open={open} onOpenChange={setOpen} />
          <main className="main" id="main">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname.split('/')[1] || 'about'}
                className="page"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Routes location={location}>
                  <Route path="/" element={<About />} />
                  <Route path="/playground" element={<Navigate to={`/playground/${sims[0].id}`} replace />} />
                  <Route path="/playground/:id" element={<Playground />} />
                  <Route path="/playground/:id/read" element={<Read kind="playground" />} />
                  <Route path="/case-studies" element={<Navigate to={`/case-studies/${caseStudies[0].id}`} replace />} />
                  <Route path="/case-studies/:id" element={<CaseStudies />} />
                  <Route path="/case-studies/:id/read" element={<Read kind="caseStudies" />} />
                  <Route path="/journal" element={<Navigate to={`/journal/${journal[0].id}`} replace />} />
                  <Route path="/journal/:id" element={<Journal />} />
                  <Route path="/journal/:id/read" element={<Read kind="journal" />} />
                  <Route path="/life" element={<Navigate to={`/life/${lifeUpdates[0].id}`} replace />} />
                  <Route path="/life/:id" element={<LifeUpdates />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </ToastProvider>
    </QuoteProvider>
  );
}
