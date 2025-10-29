import type { ReactNode } from 'react';

type ButtonProps = {
  children: ReactNode;
  action: () => unknown;
};

function Button({ children, action }: ButtonProps) {
  return (
    <button
      className={
        'cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900'
      }
      onClick={action}
    >
      {children}
    </button>
  );
}

export default Button;
