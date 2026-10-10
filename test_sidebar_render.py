# Let's inspect how the sidebar behaves when closed on desktop
# Width is 84px, sidebar-inner is 324px or width constrained.
# When open=false, <motion.nav className="nav"> is currently wrapped in:
# <AnimatePresence initial={false}>{open && (...)}</AnimatePresence>
# So when closed, nav is NOT rendered!
