import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import FileEditor from './pages/FileEditor';
import { FileProvider } from './contexts/FileContext';
import { CardProvider } from './contexts/CardContext';
import { AuthProvider } from './contexts/AuthContext';

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
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <FileProvider>
        <CardProvider>
          <RouterProvider router={router} />
        </CardProvider>
      </FileProvider>
    </AuthProvider>
  );
}
export default App;
