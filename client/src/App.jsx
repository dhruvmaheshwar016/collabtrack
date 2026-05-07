import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

function AppShell() {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return (
      <main className="min-h-screen grid place-items-center bg-stone-50 text-slate-700">
        <div className="panel px-6 py-5">Loading workspace...</div>
      </main>
    );
  }

  return user ? <DashboardPage /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
