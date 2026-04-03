import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { MapPage } from './pages/MapPage';
import { PostPage } from './pages/PostPage';
import { ProfilePage } from './pages/ProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { LocationSettingsPage } from './pages/LocationSettingsPage';
import { RelaysPage } from './pages/RelaysPage';
import { SearchPage } from './pages/SearchPage';
import { BoostPage } from './pages/BoostPage';
import { FullMapPage } from './pages/FullMapPage';
import { EditProfilePage } from './pages/EditProfilePage';
import { ChatPage } from './pages/ChatPage';
import { ProfessionalProfilePage } from './pages/ProfessionalProfilePage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ReviewProvider } from './contexts/ReviewContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { InstallPrompt } from './components/InstallPrompt';
import { UpdatePrompt } from './components/UpdatePrompt';
import { NotificationPermissionPrompt } from './components/NotificationPermissionPrompt';


function App() {
  return (
    <NotificationProvider>
      <ReviewProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<MapPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/post" element={<PostPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/location-settings" element={<LocationSettingsPage />} />
              <Route path="/relays" element={<RelaysPage />} />
              <Route path="/boost" element={<BoostPage />} />
              <Route path="/map-full" element={<FullMapPage />} />
              <Route path="/edit-profile" element={<EditProfilePage />} />
              <Route path="/professional/:id" element={<ProfessionalProfilePage />} />
              <Route path="/notifications" element={<NotificationsPage />} />
            </Route>
            <Route path="/chat/:chatId" element={<ChatPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
          </Routes>
          <InstallPrompt />
          <UpdatePrompt />
          <NotificationPermissionPrompt />
        </BrowserRouter>
      </ReviewProvider>
    </NotificationProvider>
  );
}

export default App;
