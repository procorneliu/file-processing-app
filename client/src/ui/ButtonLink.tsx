import { type ReactNode } from 'react';
import { Link } from 'react-router';

type ButtonLinkProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

function ButtonLink({ children, onClick, disabled = false }: ButtonLinkProps) {
  if (disabled) {
    return (
      <div className="group relative inline-block">
        <div className="cursor-not-allowed rounded-lg px-4 py-2 outline outline-gray-700 opacity-50">
          {children}
        </div>
      </div>
    );
  }

  return (
    <Link
      to="/app"
      className="cursor-pointer rounded-lg px-4 py-2 outline outline-gray-700 hover:bg-gray-800 hover:outline-white"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

export default ButtonLink;
