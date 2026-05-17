import React from 'react';

type DashboardFilter = 'all' | 'revisions' | 'observations';

interface UIContextType {
  settingsModalOpen: boolean;
  setSettingsModalOpen: (open: boolean) => void;
  supportModalOpen: boolean;
  setSupportModalOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isDraftMode: boolean;
  setIsDraftMode: (isDraft: boolean) => void;
  isTermFinalized: boolean;
  setIsTermFinalized: (isFinalized: boolean) => void;
}

const UIContext = React.createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [settingsModalOpen, setSettingsModalOpen] = React.useState(false);
  const [supportModalOpen, setSupportModalOpen] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isDraftMode, setIsDraftMode] = React.useState(true);
  const [isTermFinalized, setIsTermFinalized] = React.useState(false);

  return (
    <UIContext.Provider value={{
      settingsModalOpen,
      setSettingsModalOpen,
      supportModalOpen,
      setSupportModalOpen,
      mobileMenuOpen,
      setMobileMenuOpen,
      isDraftMode,
      setIsDraftMode,
      isTermFinalized,
      setIsTermFinalized
    }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = React.useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
