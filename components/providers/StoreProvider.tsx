'use client';

import { Provider } from 'react-redux';
import { store } from '@/store';
import AuthProvider from './AuthProvider';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  );
}
