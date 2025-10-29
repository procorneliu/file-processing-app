import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home';
import FileEditor from './pages/FileEditor';
import { FileProvider } from './contexts/FileContext';
import { CardProvider } from './contexts/CardContext';

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
      <CardProvider>
        <RouterProvider router={router} />
      </CardProvider>
    </FileProvider>
  );
}
export default App;
