import { type ReactNode } from 'react';
import { Link } from 'react-router';

type ButtonLinkProps = {
  children: ReactNode;
  onClick?: () => void;
};

function ButtonLink({ children, onClick }: ButtonLinkProps) {
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
