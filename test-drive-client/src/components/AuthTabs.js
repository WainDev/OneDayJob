import React from 'react';

export default function AuthTabs({ activeTab, onTabChange }) {
  return (
    <div className="d-flex justify-content-center gap-3 mb-4 p-2 rounded bg-blue-light">
      <button
        className={`btn flex-grow-1 rounded-pill ${activeTab === 'login' ? 'btn-blue' : 'bg-transparent text-blue'}`}
        onClick={() => onTabChange('login')}
      >
        Вход
      </button>
      <button
        className={`btn flex-grow-1 rounded-pill ${activeTab === 'register' ? 'btn-blue' : 'bg-transparent text-blue'}`}
        onClick={() => onTabChange('register')}
      >
        Регистрация
      </button>
    </div>
  );
}