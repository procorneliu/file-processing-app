import { Link } from 'react-router';

function Button({ children }: { children: string }) {
  return (
    <Link
      to="/app"
      className="cursor-pointer rounded-lg px-4 py-2 outline outline-gray-700 hover:bg-gray-800 hover:outline-white"
    >
      {children}
    </Link>
  );
}

export default Button;
