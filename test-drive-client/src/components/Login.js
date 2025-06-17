import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login({ onLogin }) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!login || !password) {
      setError('Заполните все поля');
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка авторизации');
      } else {
        onLogin(data, { login, password });
        navigate(data.role === 'admin' ? '/admin' : '/applications');
      }
    } catch {
      setError('Ошибка сети');
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-blue text-center fs-4">Вход</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="login" className="form-label">Логин</label>
          <input
            id="login"
            name="login"
            type="text"
            className="form-control input-focus"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Введите логин"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Пароль</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control input-focus"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите пароль"
          />
        </div>
        <button type="submit" className="btn btn-blue w-100">Войти</button>
      </form>
    </div>
  );
}