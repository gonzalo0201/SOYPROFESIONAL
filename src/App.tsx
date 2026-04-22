import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { PostPage } from './pages/PostPage';
import { ProfilePage } from './pages/ProfilePage';
import { SearchPage } from './pages/SearchPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { EditProfessionalPage } from './pages/EditProfessionalPage';
import { ProfessionalProfilePage } from './pages/ProfessionalProfilePage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { LocationProvider } from './contexts/LocationContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { InstallPrompt } from './components/InstallPrompt';
import { UpdatePrompt } from './components/UpdatePrompt';
import { NotificationPermissionPrompt } from './components/NotificationPermissionPrompt';

function App() {
  return (
    <AuthProvider>
      <LocationProvider>
      <NotificationProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/post" element={<PostPage />} />
                <Route path="/favorites" element={<div className="flex h-full items-center justify-center p-8 text-center text-slate-500 font-medium">Pronto podrás ver tus favoritos aquí.</div>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/edit-profile" element={<EditProfilePage />} />
                <Route path="/edit-professional" element={<EditProfessionalPage />} />
                <Route path="/professional/:id" element={<ProfessionalProfilePage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
              
              <Route path="/login" element={<LoginPage />} />
              <Route path="/onboarding" element={<OnboardingPage />} />
            </Routes>
            <InstallPrompt />
            <UpdatePrompt />
            <NotificationPermissionPrompt />
          </BrowserRouter>
      </NotificationProvider>
      </LocationProvider>
    </AuthProvider>
  );
}

export default App;
