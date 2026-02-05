'use client';

import React from 'react';
import { MainApp } from '@/components/MainApp';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { TablesProvider } from '@/contexts/TablesContext';
import { ToastProvider } from '@/contexts/ToastContext';

export default function Home() {
  return (
    <LanguageProvider>
      <ToastProvider>
        <TablesProvider>
          <MainApp />
        </TablesProvider>
      </ToastProvider>
    </LanguageProvider>
  );
}

