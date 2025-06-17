import React from 'react';

function UserHeader({ fullName, onApplicationsClick, onLogout }) {
  const displayName = fullName && fullName.trim() !== '' ? fullName : 'Пользователь';

  return (
    <div className="d-flex justify-content-between align-items-center mb-4 p-3 bg-light rounded shadow-sm">
      <div className="fw-semibold text-purple" style={{ fontSize: '1.25rem' }}>
        Пользователь: {displayName}
      </div>
      <div className="d-flex gap-2">
        {onApplicationsClick && (
          <button 
            className="btn btn-purple" 
            onClick={onApplicationsClick}
            aria-label="Перейти к заявкам"
            type="button"
          >
            Заявки
          </button>
        )}
        <button 
          className="btn btn-outline-danger" 
          onClick={onLogout}
          aria-label="Выйти из аккаунта"
          type="button"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}

export default UserHeader;
