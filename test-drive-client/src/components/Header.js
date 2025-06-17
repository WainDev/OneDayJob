import React from 'react';

function Header({ toggleSidebar }) {
  return (
    <header className="header">
      <button
        className="btn btn-link text-white text-decoration-none fs-4"
        onClick={toggleSidebar}
      >
        ☰
      </button>
      <h1 className="m-0 fs-4">Тест-драйв</h1>
    </header>
  );
}

export default Header;