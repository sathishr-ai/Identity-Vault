import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { getAuthToken, getSavedUser, clearAuth, setAuthToken, setSavedUser } from './service/api';
import { useDialog } from './context/DialogContext';

// Auth screens
import { SplashScreen, LoginScreen, RegisterScreen, ForgotPasswordScreen, OTPScreen } from './screens/AuthScreens';

// User screens
import {
  UserDashboard, IdentityOverview, UploadDocuments, MyDocuments, DigitalIDCard,
  QRCodeScreen, BlockchainStatus, VerificationHistoryUser, Notifications, Profile, UserSettings, SharedProofScreen
} from './screens/UserScreens';

// Admin screens
import {
  AdminDashboard, PendingRequests, ApproveReject, UserManagement, BlockchainExplorer,
  IdentityDetails, AnalyticsDashboard, AuditLogs, Reports, SecuritySettings, AdminMessages
} from './screens/AdminScreens';

import { SearchIdentity, QRScanner, VerificationResult, VerifierHistory, DownloadReport, VerifierSupport } from './screens/VerifierScreens';

type AuthState = 'splash' | 'login' | 'register' | 'forgot-password' | 'otp';
type Role = 'user' | 'admin' | 'verifier';

const defaultScreens: Record<Role, string> = {
  user: 'user-dashboard',
  admin: 'admin-dashboard',
  verifier: 'search-identity',
};

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('splash');
  const [role, setRole] = useState<Role | null>(null);
  const [screen, setScreen] = useState('user-dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const { showToast } = useDialog();

  const [isSharedSession, setIsSharedSession] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const oauthToken = params.get('token');
    const oauthUser = params.get('user');
    if (oauthToken && oauthUser) {
      setAuthToken(oauthToken);
      const parsedUser = JSON.parse(decodeURIComponent(oauthUser));
      setSavedUser(parsedUser);
      window.history.replaceState({}, document.title, window.location.pathname);
      setRole(parsedUser.role as Role);
      setScreen(defaultScreens[parsedUser.role as Role]);
      return;
    }

    const shareToken = params.get('share');
    if (shareToken) {
      setIsSharedSession(shareToken);
      return;
    }

    const user = getSavedUser();
    const token = getAuthToken();
    if (user && token) {
      setRole(user.role as Role);
      setScreen(defaultScreens[user.role as Role]);
    }
  }, []);

  const handleAuth = (r: Role) => {
    setRole(r);
    setScreen(defaultScreens[r]);
  };

  const handleLogout = () => {
    clearAuth();
    setRole(null);
    setAuthState('login');
    showToast('Logout successful', 'success');
  };

  const handleNav = (s: string) => setScreen(s);

  if (isSharedSession) {
    return <SharedProofScreen token={isSharedSession} />;
  }

  // Auth flow
  if (!role) {
    const authProps = {
      onAuth: handleAuth,
      screen: authState,
      onNav: (s: AuthState) => setAuthState(s),
    };

    switch (authState) {
      case 'splash': return <SplashScreen onNav={(s: AuthState) => setAuthState(s)} />;
      case 'login': return <LoginScreen {...authProps} />;
      case 'register': return <RegisterScreen {...authProps} />;
      case 'forgot-password': return <ForgotPasswordScreen {...authProps} />;
      case 'otp': return <OTPScreen {...authProps} />;
    }
  }

  // Main app with layout
  const renderScreen = () => {
    switch (screen) {
      // User screens
      case 'user-dashboard': return <UserDashboard onNav={handleNav} />;
      case 'identity-overview': return <IdentityOverview onNav={handleNav} />;
      case 'upload-documents': return <UploadDocuments />;
      case 'my-documents': return <MyDocuments onNav={handleNav} />;
      case 'digital-id-card': return <DigitalIDCard onNav={handleNav} />;
      case 'qr-code': return <QRCodeScreen />;
      case 'blockchain-status': return <BlockchainStatus />;
      case 'verification-history': return <VerificationHistoryUser />;
      case 'notifications': return <Notifications />;
      case 'profile': return <Profile />;
      case 'settings': return <UserSettings onNav={handleNav} />;

      // Admin screens
      case 'admin-dashboard': return <AdminDashboard onNav={handleNav} />;
      case 'pending-requests': return <PendingRequests onNav={handleNav} />;
      case 'approve-reject': return <ApproveReject />;
      case 'user-management': return <UserManagement onNav={handleNav} />;
      case 'blockchain-explorer': return <BlockchainExplorer />;
      case 'identity-details': return <IdentityDetails />;
      case 'analytics': return <AnalyticsDashboard />;
      case 'admin-messages': return <AdminMessages />;
      case 'audit-logs': return <AuditLogs />;
      case 'reports': return <Reports />;
      case 'security-settings': return <SecuritySettings />;

      // Verifier screens
      case 'search-identity': return <SearchIdentity onNav={handleNav} />;
      case 'qr-scanner': return <QRScanner onNav={handleNav} />;
      case 'verification-result': return <VerificationResult onNav={handleNav} />;
      case 'verifier-history': return <VerifierHistory />;
      case 'download-report': return <DownloadReport />;
      case 'verifier-support': return <VerifierSupport />;

      default: return <UserDashboard onNav={handleNav} />;
    }
  };

  return (
    <Layout
      role={role!}
      screen={screen}
      onNav={handleNav}
      onLogout={handleLogout}
      darkMode={darkMode}
      onToggleDark={() => setDarkMode(!darkMode)}
    >
      {renderScreen()}
    </Layout>
  );
}
