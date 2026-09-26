import { Toaster } from 'react-hot-toast';
import LoginPage from './pages/auth/LoginPage';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <LoginPage />
    </>
  );
}

export default App;
