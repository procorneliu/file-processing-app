import type React from 'react';
import AuthButton from '../components/AuthButton';
import DownloadStatus from './DownloadStatus';

function MainContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex h-screen w-screen items-start justify-center overflow-scroll bg-linear-to-br from-gray-900 to-gray-950 pb-10">
      <DownloadStatus />
      <div className="absolute right-4 top-4 z-10">
        <AuthButton />
      </div>
      {children}
    </main>
  );
}

export default MainContainer;
