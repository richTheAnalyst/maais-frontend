import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { initInstallPrompt, triggerInstall, isInstalled } from '../lib/pwa';

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [isInstalling, setIsInstalling] = React.useState(false);
  const [installed, setInstalled] = React.useState(false);

  React.useEffect(() => {
    // Don't show if already installed
    if (isInstalled()) return;

    // Don't show if user dismissed recently
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (dismissed) {
      const dismissedAt = new Date(dismissed);
      const daysSince = (Date.now() - dismissedAt.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return; // Don't show again for 7 days
    }

    initInstallPrompt(() => {
      // Small delay so it doesn't pop up immediately on load
      setTimeout(() => setShowPrompt(true), 3000);
    });

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowPrompt(false);
    });
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    const outcome = await triggerInstall();
    setIsInstalling(false);
    if (outcome === 'accepted') {
      setShowPrompt(false);
      setInstalled(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-prompt-dismissed', new Date().toISOString());
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && !installed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[500] w-full max-w-sm mx-auto px-4"
        >
          <div className="bg-slate-900 rounded-3xl shadow-2xl shadow-slate-900/40 p-5 border border-white/10">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                <img src="/icons/icon-72x72.png" alt="MAAIS"
                  className="w-8 h-8 rounded-lg"
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-white">Install MAAIS</p>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  Add to your home screen for faster access and offline support
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleInstall}
                    disabled={isInstalling}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all disabled:opacity-60"
                  >
                    <Download size={12} />
                    {isInstalling ? 'Installing...' : 'Install App'}
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="px-4 py-2 text-slate-400 text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors"
                  >
                    Not now
                  </button>
                </div>
              </div>
              <button onClick={handleDismiss} className="p-1 text-slate-500 hover:text-white transition-colors shrink-0">
                <X size={16} />
              </button>
            </div>

            {/* Platform hints */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Smartphone size={12} /> iOS: Safari → Share → Add to Home Screen
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                <Monitor size={12} /> Chrome: Address bar → Install icon
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Update available banner */}
      <UpdateBanner />
    </AnimatePresence>
  );
}

function UpdateBanner() {
  const [showUpdate, setShowUpdate] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener('sw-update-available', () => setShowUpdate(true));
  }, []);

  if (!showUpdate) return null;

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-[500] w-full max-w-sm px-4"
    >
      <div className="bg-blue-600 text-white rounded-2xl px-5 py-3 flex items-center justify-between shadow-xl">
        <p className="text-[12px] font-bold">A new version of MAAIS is available</p>
        <button
          onClick={() => window.location.reload()}
          className="ml-4 px-3 py-1.5 bg-white text-blue-600 rounded-lg text-[11px] font-black uppercase tracking-widest"
        >
          Update
        </button>
      </div>
    </motion.div>
  );
}