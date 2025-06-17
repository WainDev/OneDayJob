import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTable } from 'react-table';
import Modal from './Modal';

function AdminPanel({ adminAuthData, onLogout }) {
  const [applications, setApplications] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [statusId, setStatusId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [cars, setCars] = useState([]);
  const [showCarModal, setShowCarModal] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/admin/applications')
      .then(res => res.json())
      .then(data => setApplications(data))
      .catch(() => setError('Ошибка загрузки заявок'));
    fetch('http://localhost:5000/api/cars')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(() => setError('Ошибка загрузки автомобилей'));
  }, []);

  const filteredApplications = useMemo(() => {
    if (!filterDate) return applications;
    return applications.filter(app =>
      new Date(app.dateTime).toISOString().split('T')[0] === filterDate
    );
  }, [applications, filterDate]);

  const columns = useMemo(() => [
    { Header: 'ID', accessor: 'id' },
    { Header: 'Пользователь', accessor: 'fullName' },
    { Header: 'Автомобиль', accessor: row => `${row.brand} ${row.model}` },
    { Header: 'Дата', accessor: row => new Date(row.dateTime).toLocaleString() },
    { Header: 'Статус', accessor: 'status' },
    {
      Header: 'Действия',
      accessor: 'actions',
      Cell: ({ row }) => (
        <button
          className="btn btn-blue btn-sm"
          onClick={() => {
            setSelectedAppId(row.original.id);
            setStatusId('');
            setRejectionReason('');
            setShowModal(true);
          }}
        >
          Изменить
        </button>
      )
    }
  ], []);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({ columns, data: filteredApplications });

  const handleStatusChange = async () => {
    setError('');
    if (!statusId) {
      setError('Выберите статус');
      return;
    }
    if (statusId === '4' && !rejectionReason.trim()) {
      setError('Укажите причину отклонения');
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/admin/applications/${selectedAppId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusId,
          rejectionReason,
          adminLogin: adminAuthData.login,
          adminPassword: adminAuthData.password
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return setError(errorData.error || 'Ошибка при изменении статуса');
      }
      const data = await response.json();
      setShowModal(false);
      setApplications(prev => prev.map(app =>
        app.id === selectedAppId
          ? { ...app, status: data.status, rejectionReason: statusId === '4' ? rejectionReason : '' }
          : app
      ));
    } catch {
      setError('Ошибка сервера при изменении статуса');
    }
  };

  const handleAddCar = async () => {
    setError('');
    if (!brand.trim() || !model.trim()) {
      setError('Заполните марку и модель');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand,
          model,
          adminLogin: adminAuthData.login,
          adminPassword: adminAuthData.password
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        return setError(errorData.error || 'Ошибка при добавлении автомобиля');
      }
      const data = await response.json();
      setCars(prev => [...prev, { id: data.id, brand, model }]);
      setShowCarModal(false);
      setBrand('');
      setModel('');
    } catch {
      setError('Ошибка сервера при добавлении автомобиля');
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-blue text-center fs-3">Панель администратора</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button
          className="btn btn-blue"
          onClick={() => setShowCarModal(true)}
        >
          Добавить автомобиль
        </button>
        <input
          type="date"
          className="form-control w-auto input-focus"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="table-responsive">
        <table className="table table-striped table-hover" {...getTableProps()}>
          <thead className="table-dark">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} key={column.id}>{column.render('Header')}</th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} key={cell.column.id}>{cell.render('Cell')}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h3 className="mb-3">Изменение статуса</h3>
          <select
            className="form-select mb-3 input-focus"
            value={statusId}
            onChange={(e) => setStatusId(e.target.value)}
          >
            <option value="">Выберите статус</option>
            <option value="1">В обработке</option>
            <option value="2">Одобрен</option>
            <option value="3">Выполнен</option>
            <option value="4">Отклоненный</option>
          </select>
          {statusId === '4' && (
            <textarea
              className="form-control mb-3 input-focus"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Причина отклонения"
              rows={3}
            />
          )}
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => setShowModal(false)}
            >
              Отмена
            </button>
            <button
              className="btn btn-blue"
              onClick={handleStatusChange}
            >
              Сохранить
            </button>
          </div>
        </Modal>
      )}
      {showCarModal && (
        <Modal onClose={() => setShowCarModal(false)}>
          <h3 className="mb-3">Добавление автомобиля</h3>
          <input
            type="text"
            className="form-control mb-3 input-focus"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Марка"
          />
          <input
            type="text"
            className="form-control mb-3 input-focus"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="Модель"
          />
          <div className="d-flex justify-content-end gap-2">
            <button
              className="btn btn-secondary"
              onClick={() => setShowCarModal(false)}
            >
              Отмена
            </button>
            <button
              className="btn btn-blue"
              onClick={handleAddCar}
            >
              Добавить
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AdminPanel;