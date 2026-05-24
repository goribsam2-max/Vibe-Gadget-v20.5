import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export const InstallPwaGuide: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstall, setShowInstall] = useState(false);
    const [isIos, setIsIos] = useState(false);

    useEffect(() => {
        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setIsIos(true);
        }

        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Only show prompt if it wasn't recently dismissed
            if (localStorage.getItem('pwa_dismissed') !== 'true') {
                setShowInstall(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) {
            setShowInstall(false);
        } else if (isIos && localStorage.getItem('pwa_dismissed') !== 'true') {
            // For iOS we might show it after a delay
            setTimeout(() => {
                setShowInstall(true);
            }, 3000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, [isIos]);

    const handleInstallParams = async () => {
        if (!deferredPrompt && !isIos) return;
        
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowInstall(false);
            }
        }
    };

    const handleDismiss = () => {
        setShowInstall(false);
        // localStorage.setItem('pwa_dismissed', 'true');
    };

    if (!showInstall) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-700 p-4 z-[9999]"
            >
                <button onClick={handleDismiss} className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
                    <X size={16} />
                </button>
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-black text-white shrink-0 rounded-xl flex items-center justify-center font-bold text-xl uppercase tracking-tighter">
                        V
                    </div>
                    <div>
                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Install Vibe Gadgets</h4>
                        {isIos && !deferredPrompt ? (
                            <p className="text-xs text-zinc-500 mb-2">Tap <span className="inline-block mx-1 font-bold">Share</span> and then <br/> <span className="font-bold">Add to Home Screen</span></p>
                        ) : (
                            <p className="text-xs text-zinc-500 mb-3">Install our app for a faster and better shopping experience.</p>
                        )}
                        
                        {!isIos && deferredPrompt && (
                            <button 
                                onClick={handleInstallParams}
                                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 text-xs px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
                            >
                                <Download size={14} /> Install App
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
