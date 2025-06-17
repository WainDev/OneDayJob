import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ApplicationForm({ user }) {
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [driverLicenseSeries, setDriverLicenseSeries] = useState('');
  const [driverLicenseNumber, setDriverLicenseNumber] = useState('');
  const [driverLicenseDate, setDriverLicenseDate] = useState('');
  const [carId, setCarId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [paymentType, setPaymentType] = useState('cash');
  const [cars, setCars] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/cars')
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(() => setError('Ошибка загрузки автомобилей'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (
      !address.trim() ||
      !phone.match(/^\+7\d{10}$/) ||
      !driverLicenseSeries.match(/^\d{4}$/) ||
      !driverLicenseNumber.match(/^\d{6}$/) ||
      !driverLicenseDate ||
      new Date(dateTime) <= new Date() ||
      !carId
    ) {
      setError('Пожалуйста, заполните все поля корректно');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          address,
          phone,
          driverLicenseSeries,
          driverLicenseNumber,
          driverLicenseDate,
          carId,
          dateTime,
          paymentType
        }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        navigate('/applications');
      }
    } catch {
      setError('Ошибка сервера');
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '600px' }}>
      <h2 className="mb-4 text-blue text-center fs-3">Новая заявка</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit} noValidate className="card shadow p-4">
        <div className="mb-3">
          <label htmlFor="address" className="form-label">Адрес</label>
          <input
            id="address"
            type="text"
            className="form-control input-focus"
            placeholder="Адрес"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">Телефон</label>
          <input
            id="phone"
            type="text"
            className="form-control input-focus"
            placeholder="+71234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <div className="form-text">Формат: +7XXXXXXXXXX</div>
        </div>
        <div className="row g-3 mb-3">
          <div className="col-6">
            <label htmlFor="driverLicenseSeries" className="form-label">Серия ВУ</label>
            <input
              id="driverLicenseSeries"
              type="text"
              className="form-control input-focus"
              placeholder="4 цифры"
              value={driverLicenseSeries}
              onChange={(e) => setDriverLicenseSeries(e.target.value)}
              maxLength={4}
            />
          </div>
          <div className="col-6">
            <label htmlFor="driverLicenseNumber" className="form-label">Номер ВУ</label>
            <input
              id="driverLicenseNumber"
              type="text"
              className="form-control input-focus"
              placeholder="6 цифр"
              value={driverLicenseNumber}
              onChange={(e) => setDriverLicenseNumber(e.target.value)}
              maxLength={6}
            />
          </div>
        </div>
        <div className="mb-3">
          <label htmlFor="driverLicenseDate" className="form-label">Дата выдачи ВУ</label>
          <input
            id="driverLicenseDate"
            type="date"
            className="form-control input-focus"
            value={driverLicenseDate}
            onChange={(e) => setDriverLicenseDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="carId" className="form-label">Автомобиль</label>
          <select
            id="carId"
            className="form-select input-focus"
            value={carId}
            onChange={(e) => setCarId(e.target.value)}
          >
            <option value="">Выберите автомобиль</option>
            {cars.map(car => (
              <option key={car.id} value={car.id}>{car.brand} {car.model}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label htmlFor="dateTime" className="form-label">Дата и время</label>
          <input
            id="dateTime"
            type="datetime-local"
            className="form-control input-focus"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="paymentType" className="form-label">Тип оплаты</label>
          <select
            id="paymentType"
            className="form-select input-focus"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
          >
            <option value="cash">Наличные</option>
            <option value="card">Карта</option>
          </select>
        </div>
        <button type="submit" className="btn btn-blue w-100">Создать заявку</button>
        <button
          type="button"
          className="btn btn-secondary w-100 mt-2"
          onClick={() => navigate(-1)}
        >
          Назад
        </button>
      </form>
    </div>
  );
}

export default ApplicationForm;