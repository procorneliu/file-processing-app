import type React from 'react';

function MainContainer({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex h-screen w-screen items-start justify-center overflow-scroll bg-linear-to-br from-gray-900 to-gray-950 pb-10">
      {children}
    </main>
  );
}

export default MainContainer;
