import { useState } from 'react';
import AuthButton from '../components/AuthButton';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login:', { email, password });
  }

  return (
    <main className="relative flex h-screen w-screen items-center justify-center bg-linear-to-br from-gray-900 to-gray-950">
      <div className="absolute right-4 top-4 z-10">
        <AuthButton />
      </div>
      <div className="w-full max-w-md px-4">
        <div className="text-center text-stone-50">
          <h1 className="text-4xl font-semibold">Login</h1>
          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-500 bg-transparent px-4 py-3 text-stone-100 transition-all duration-300 outline-none placeholder:text-stone-400 focus:ring focus:ring-blue-400"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-500 bg-transparent px-4 py-3 text-stone-100 transition-all duration-300 outline-none placeholder:text-stone-400 focus:ring focus:ring-blue-400"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-900"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Login;

