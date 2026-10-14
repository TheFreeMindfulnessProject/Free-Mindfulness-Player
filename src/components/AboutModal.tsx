import React, { useState } from 'react';
import {
  X,
  Smartphone,
  ExternalLink,
  Globe,
  Leaf,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { canInstall, isInstalled, promptInstall } = usePwaInstall();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About Free Mindfulness Player"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn"
    >
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-[#FAF7F2] dark:bg-[#141916] rounded-3xl border border-stone-200/80 dark:border-white/[0.08] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-black/[0.05] dark:border-white/[0.06] bg-[#F2EDE4] dark:bg-[#1C231E]">
          <div>
            <h3 className="text-lg font-bold text-[#1E2621] dark:text-[#F0F4F1]">
              Free Mindfulness Player
            </h3>
            <p className="text-xs text-[#526357] dark:text-[#9FB1A5] font-medium">
              The Free Mindfulness Project
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-[#526357] dark:text-[#A7B6AB] hover:bg-black/[0.05] dark:hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-sm text-[#46544C] dark:text-[#A6B4AA] leading-relaxed">
          {/* Mission statement */}
          <div className="space-y-2">
            <p className="font-semibold text-[#1E2621] dark:text-[#EDF3EF]">
              A new free mindfulness meditation app created as part of The Free Mindfulness Project.
            </p>
            <p className="text-xs text-[#5B6D60] dark:text-[#98A99D] leading-relaxed">
              We recognise the need for simple and free ways to access mindfulness meditations without ads or distractions. We hope that this app supports your practice. Feedback or comments are very welcome, contact us using{' '}
              <a
                href="mailto:app@freemindfulness.org"
                className="text-[#385944] dark:text-[#7EA089] underline hover:opacity-85 font-semibold"
              >
                app@freemindfulness.org
              </a>
            </p>
          </div>

          {/* Dedicated Home Screen Installation Guide */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#1B221E] border border-stone-200/80 dark:border-white/[0.07] space-y-4 shadow-xs">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[#385944] dark:text-[#7EA089] font-bold text-sm">
                <Smartphone className="w-4 h-4" />
                <span>Add to Phone Home Screen</span>
              </div>
              {isInstalled && (
                <span className="text-[11px] font-semibold text-[#385944] dark:text-[#7EA089] bg-[#385944]/10 dark:bg-[#7EA089]/20 px-2.5 py-0.5 rounded-full">
                  App Installed
                </span>
              )}
            </div>

            {/* Quick Share / Copy URL button */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                readOnly
                value={currentUrl}
                className="flex-1 px-3 py-2 rounded-xl bg-stone-100 dark:bg-[#252E27] text-xs font-mono text-[#3D4C41] dark:text-[#C5D2C9] border border-stone-200/60 dark:border-white/[0.06] select-all truncate"
              />
              <button
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-[#31523D] dark:bg-[#436C52] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs active:scale-95 transition-all shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Direct One-Tap Install Button if supported */}
            {canInstall && (
              <div className="pt-2">
                <button
                  onClick={promptInstall}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#385944] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Tap Here to Install App Now</span>
                </button>
              </div>
            )}

            {/* Step-by-step for iPhone (iOS Safari) */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-white/[0.05]">
              <h5 className="font-bold text-xs text-[#1E2621] dark:text-[#EDF3EF]">
                🍎 On iPhone &amp; iPad (Safari):
              </h5>
              <ol className="text-xs space-y-2 text-[#526357] dark:text-[#A7B6AB] list-decimal list-inside pl-1">
                <li>
                  Open the link in <strong>Safari</strong> on your phone.
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-[#1E2621] dark:text-[#F0F4F1]">2.</span>
                  <span>
                    Tap the <strong>Share</strong> button at the bottom of the screen (the square with an arrow pointing upward).
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-[#1E2621] dark:text-[#F0F4F1]">3.</span>
                  <span>
                    Scroll down the share sheet and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong> (square icon with a plus sign).
                  </span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="font-semibold text-[#1E2621] dark:text-[#F0F4F1]">4.</span>
                  <span>
                    Tap <strong>&ldquo;Add&rdquo;</strong> in the top-right corner.
                  </span>
                </li>
              </ol>
              <p className="text-[11px] text-[#76877B] dark:text-[#8D9F92] italic pt-1">
                The Free Mindfulness Player icon will now sit on your home screen and open full-screen like a native app, without browser address bars!
              </p>
            </div>

            {/* Step-by-step for Android (Chrome) */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-white/[0.05]">
              <h5 className="font-bold text-xs text-[#1E2621] dark:text-[#EDF3EF]">
                🤖 On Android (Chrome / Edge):
              </h5>
              <ol className="text-xs space-y-2 text-[#526357] dark:text-[#A7B6AB] list-decimal list-inside pl-1">
                <li>
                  Open the link in <strong>Chrome</strong> on your phone.
                </li>
                <li>
                  Tap the <strong>three dots (⋮)</strong> in the top-right corner of Chrome.
                </li>
                <li>
                  Tap <strong>&ldquo;Install app&rdquo;</strong> or <strong>&ldquo;Add to Home screen&rdquo;</strong>.
                </li>
              </ol>
            </div>
          </div>

          {/* Cost and Privacy */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#1A211D] border border-stone-200/80 dark:border-white/[0.06] space-y-2">
            <div className="flex items-center gap-2 text-[#385944] dark:text-[#7EA089] font-bold text-xs">
              <Leaf className="w-4 h-4" />
              <span>Cost and Privacy</span>
            </div>
            <p className="text-xs text-[#5B6D60] dark:text-[#98A99D] leading-relaxed">
              This app operates with no fee, no subscription or adds, and no collection of user data. Practices can be cached to your device for full offline listening. If you would like to contribute to The Free Mindfulness Project visit:{' '}
              <a
                href="https://www.freemindfulness.org/donate"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#385944] dark:text-[#7EA089] underline hover:opacity-85 font-semibold inline-flex items-center gap-0.5"
              >
                <span>freemindfulness.org/donate</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          {/* Links */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-black/[0.05] dark:border-white/[0.06]">
            <a
              href="https://www.freemindfulness.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#385944] dark:text-[#7EA089] hover:underline font-semibold"
            >
              <Globe className="w-4 h-4" />
              <span>freemindfulness.org</span>
            </a>
            <a
              href="https://www.freemindfulness.org/download"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-[#385944] dark:text-[#7EA089] hover:underline font-semibold"
            >
              <ExternalLink className="w-4 h-4" />
              <span>freemindfulness.org/download</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
