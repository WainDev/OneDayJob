import React, { useState } from 'react';

export default function Register() {
  const [form, setForm] = useState({
    login: '',
    password: '',
    fullName: '',
    phone: '',
    email: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const { login, password, fullName, phone, email } = form;
    if (
      !login ||
      password.length < 6 ||
      !fullName.match(/^([А-ЯЁ][а-яё]+)(\s[А-ЯЁ][а-яё]+)*$/i) ||
      !phone.match(/^\+7\d{10}$/) ||
      !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    ) {
      setError('Проверьте правильность введенных данных');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    try {
      const res = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Ошибка регистрации');
      } else {
        setForm({ login: '', password: '', fullName: '', phone: '', email: '' });
        alert('Регистрация успешна');
      }
    } catch {
      setError('Ошибка сети');
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-blue text-center fs-4">Регистрация</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="login" className="form-label">Логин</label>
          <input
            id="login"
            name="login"
            type="text"
            className="form-control input-focus"
            value={form.login}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Пароль (мин. 6 символов)</label>
          <input
            id="password"
            name="password"
            type="password"
            className="form-control input-focus"
            value={form.password}
            onChange={handleChange}
            minLength={6}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">ФИО</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            className="form-control input-focus"
            value={form.fullName}
            onChange={handleChange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Телефон (+7XXXXXXXXXX)</label>
          <input
            id="phone"
            name="phone"
            type="text"
            className="form-control input-focus"
            value={form.phone}
            onChange={handleChange}
            placeholder="+79850001122"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-control input-focus"
            value={form.email}
            onChange={handleChange}
            placeholder="email@example.com"
          />
        </div>
        <button type="submit" className="btn btn-blue w-100">Зарегистрироваться</button>
      </form>
    </div>
  );
}