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
import FlappySquarePage from './pages/FlappySquarePage.jsx';
import { warmExternalEmbeds, prefetchUrl } from './utils/prefetch.js';
import './utils/theme.js';

export default function App() {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Warm up external embed hosts and prefetch all iframe media speculatively
  useEffect(() => {
    warmExternalEmbeds();
    lifeUpdates.forEach((u) => {
      if (u.media?.src && u.media?.type === 'iframe') {
        prefetchUrl(u.media.src);
      }
    });
  }, []);

  // Automatically close sidebar when screen width drops to smaller/mobile screens
  useEffect(() => {
    let wasMobile = window.innerWidth <= 860;
    const handleResize = () => {
      const isMobile = window.innerWidth <= 860;
      if (isMobile && !wasMobile) {
        setOpen(false);
      }
      wasMobile = isMobile;
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
                  <Route path="/flappy-square" element={<FlappySquarePage />} />
                  <Route path="/playground" element={<Navigate to={`/playground/${sims[0]?.id || ''}`} replace />} />
                  <Route path="/playground/:id" element={<Playground />} />
                  <Route path="/playground/:id/read" element={<Read kind="playground" />} />
                  <Route path="/case-studies" element={caseStudies.length > 0 ? <Navigate to={`/case-studies/${caseStudies[0].id}`} replace /> : <CaseStudies />} />
                  <Route path="/case-studies/:id" element={<CaseStudies />} />
                  <Route path="/case-studies/:id/read" element={<Read kind="caseStudies" />} />
                  <Route path="/journal" element={journal.length > 0 ? <Navigate to={`/journal/${journal[0].id}`} replace /> : <Journal />} />
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
