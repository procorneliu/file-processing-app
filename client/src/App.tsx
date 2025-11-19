import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import FileEditor from './pages/FileEditor';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import { FileProvider } from './contexts/FileContext';
import { CardProvider } from './contexts/CardContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProcessingModeProvider } from './contexts/ProcessingModeContext';

const router = createBrowserRouter([
  {
    errorElement: <div>Error</div>,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/app',
        element: <FileEditor />,
      },
      {
        path: '/login',
        element: <Login />,
      },
      {
        path: '/register',
        element: <Register />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPassword />,
      },
      {
        path: '/reset-password',
        element: <ResetPassword />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <ProcessingModeProvider>
        <FileProvider>
          <CardProvider>
            <RouterProvider router={router} />
          </CardProvider>
        </FileProvider>
      </ProcessingModeProvider>
    </AuthProvider>
  );
}
export default App;
