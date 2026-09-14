import React, { useState } from 'react';
import Navbar from './components/Navbar/Navbar';
import LoginPage from './pages/LoginPage/LoginPage';
import Dashboard from './pages/Dashboard/Dashboard';
import { ToastContainer } from './components/Toast/Toast';

function App() {
  const [user, setUser] = useState(() => {
    try {
      const persistentUser = localStorage.getItem('docuquery_user');
      const sessionUser = sessionStorage.getItem('docuquery_user');
      if (persistentUser) return JSON.parse(persistentUser);
      if (sessionUser) return JSON.parse(sessionUser);
    } catch {
      localStorage.removeItem('docuquery_user');
      sessionStorage.removeItem('docuquery_user');
    }
    return null;
  });
  const [activeModal, setActiveModal] = useState(null); // 'documents' | 'tickets' | null
  const [toasts, setToasts] = useState([]);

  const addToast = ({ type = 'info', title, message }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    addToast({
      type: 'success',
      title: 'Welcome back!',
      message: `Signed in as ${userData.name || userData.email}`
    });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveModal(null);
    localStorage.removeItem('docuquery_user');
    sessionStorage.removeItem('docuquery_user');
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been safely signed out.'
    });
  };

  return (
    <div className="app-main-container">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <Navbar 
        user={user} 
        onLogout={handleLogout}
        onOpenDocuments={() => setActiveModal('documents')}
        onOpenTickets={() => setActiveModal('tickets')}
      />
      
      <main className="app-content">
        {!user ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} showToast={addToast} />
        ) : (
          <Dashboard 
            user={user} 
            onLogout={handleLogout}
            activeModal={activeModal}
            setActiveModal={setActiveModal}
            showToast={addToast}
          />
        )}
      </main>
    </div>
  );
}

export default App;
