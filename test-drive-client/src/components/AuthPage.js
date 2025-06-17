import React, { useState } from 'react';
import AuthTabs from './AuthTabs';
import Login from './Login';
import Register from './Register';

export default function AuthPage({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login');

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow p-4">
            <AuthTabs activeTab={activeTab} onTabChange={setActiveTab} />
            {activeTab === 'login' ? <Login onLogin={onLogin} /> : <Register />}
          </div>
        </div>
      </div>
    </div>
  );
}