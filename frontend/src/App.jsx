import React, { useState } from 'react';
import DashboardLayout from './components/DashboardLayout';
import { LoginForm, RegisterForm } from './components/AuthForms';

function App() {
  const [route, setRoute] = useState('login'); // 'login', 'register', 'dashboard'

  const [user, setUser] = useState(null);

  const handleLoginSuccess = (loggedInUser) => {
    console.log('User logged in:', loggedInUser);
    setUser(loggedInUser);
    setRoute('dashboard');
  };

  // ... (routing logic) ...

  if (route === 'login') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <LoginForm
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={() => setRoute('register')}
        />
        <div className="absolute top-4 right-4 flex gap-4">
          <button onClick={() => setRoute('dashboard')} className="text-xs text-gray-400">Skip to Dashboard (Dev)</button>
        </div>
      </div>
    );
  }

  if (route === 'register') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <RegisterForm onRegisterSuccess={() => setRoute('login')} />
        <button onClick={() => setRoute('login')} className="absolute top-4 right-4 text-sm text-green-600 font-medium">Ir a Login</button>
      </div>
    );
  }

  return <DashboardLayout user={user} />;
}

export default App;
