import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Applications({ user, onLogout }) {
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState('');
  const [filterStatusId, setFilterStatusId] = useState('');
  const [notification, setNotification] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://localhost:5000/api/applications/${user.id}`)
      .then(res => res.json())
      .then(data => setApplications(data))
      .catch(() => setError('Ошибка загрузки заявок'));
  }, [user.id]);

  const filteredApplications = filterStatusId
    ? applications.filter(app => String(app.statusId) === filterStatusId)
    : applications;

  const downloadPDF = (id) => {
    setNotification('Загрузка PDF начата...');
    const link = document.createElement('a');
    link.href = `http://localhost:5000/api/applications/${id}/pdf`;
    link.download = `application-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setNotification('PDF успешно скачан!'), 1000);
  };

  const handleLogout = () => {
    onLogout();
    navigate('/auth');
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-blue text-center fs-3">Мои заявки</h2>
      {notification && (
        <div className="alert alert-success alert-dismissible fade show">
          {notification}
          <button
            type="button"
            className="btn-close"
            onClick={() => setNotification('')}
          ></button>
        </div>
      )}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-blue"
          onClick={() => navigate('/application-form')}
        >
          Новая заявка
        </button>
        <select
          className="form-select w-auto input-focus"
          value={filterStatusId}
          onChange={(e) => setFilterStatusId(e.target.value)}
        >
          <option value="">Все статусы</option>
          <option value="1">В обработке</option>
          <option value="2">Одобрен</option>
          <option value="3">Выполнен</option>
          <option value="4">Отклоненный</option>
        </select>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {filteredApplications.length === 0 && !error && (
        <p className="text-center text-muted">Заявок пока нет</p>
      )}
      <div className="row gy-3">
        {filteredApplications.map(app => (
          <div key={app.id} className="col-12">
            <div className="card shadow-sm">
              <div className="card-body">
                <p><strong>Автомобиль:</strong> {app.brand} {app.model}</p>
                <p><strong>Дата:</strong> {new Date(app.dateTime).toLocaleString()}</p>
                <p>
                  <strong>Статус:</strong>{' '}
                  <span className={`badge ${getStatusBadgeClassById(app.statusId)}`}>{app.status}</span>
                </p>
                {app.rejectionReason && (
                  <p className="text-danger"><strong>Причина отклонения:</strong> {app.rejectionReason}</p>
                )}
                {app.statusId === 3 && (
                  <button
                    className="btn btn-blue mt-2"
                    onClick={() => downloadPDF(app.id)}
                  >
                    <i className="bi bi-download me-2"></i>Скачать PDF
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getStatusBadgeClassById(statusId) {
  switch (Number(statusId)) {
    case 1: return 'bg-warning text-dark';
    case 2: return 'bg-success';
    case 3: return 'bg-primary';
    case 4: return 'bg-danger';
    default: return 'bg-secondary';
  }
}

export default Applications;