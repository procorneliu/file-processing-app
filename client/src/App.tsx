import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import FileEditor from './pages/FileEditor';
import { FileProvider } from './contexts/FileContext';

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
    <FileProvider>
      <RouterProvider router={router} />
    </FileProvider>
  );
}
export default App;
