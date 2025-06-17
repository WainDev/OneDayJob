import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Sidebar({ user, isAdmin, onLogout, isOpen, toggleSidebar }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/auth');
  };

  return (
    <div className={`sidebar ${!isOpen ? 'sidebar-hidden' : ''}`}>
      <div className="d-flex flex-column h-100">
        <h2 className="text-xl font-bold mb-4">Тест-драйв</h2>
        <nav className="d-flex flex-column gap-3">
          {user && !isAdmin && (
            <>
              <Link to="/applications" className="text-white text-decoration-none" onClick={toggleSidebar}>
                Мои заявки
              </Link>
              <Link to="/application-form" className="text-white text-decoration-none" onClick={toggleSidebar}>
                Новая заявка
              </Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin" className="text-white text-decoration-none" onClick={toggleSidebar}>
              Панель админа
            </Link>
          )}
          <button
            className="btn btn-link text-white text-decoration-none text-start p-0"
            onClick={() => { handleLogoutClick(); toggleSidebar(); }}
          >
            Выйти
          </button>
        </nav>
        <div className="mt-auto">
          <p className="text-white small">
            {user ? `Пользователь: ${user.fullName}` : isAdmin ? 'Администратор' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;