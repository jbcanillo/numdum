import React from 'react';

const InstallModal = ({ onInstall, onDismiss }) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md animate-fade-in">
      <div className="p-4 rounded-lg shadow-xl border border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📖</div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Install Numdum</h3>
            <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>
              Add Numdum to your home screen for quick access, even offline.
            </p>
            <div className="flex gap-2">
              <button onClick={onInstall} className="btn btn-primary btn-sm">
                Install
              </button>
              <button onClick={onDismiss} className="btn btn-ghost btn-sm">
                Not now
              </button>
            </div>
          </div>
          <button onClick={onDismiss} className="ml-2 text-[var(--text-tertiary)] hover:text-[var(--text-primary)]" aria-label="Dismiss">
            ×
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallModal;
