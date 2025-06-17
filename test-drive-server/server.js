const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();

// Конфигурация
const config = {
  db: {
    host: 'MySQL-8.4',
    user: 'root',
    password: '',
    database: 'test_drive'
  },
  port: 5000
};

// Подключение к базе данных
const connection = mysql.createConnection(config.db);

connection.connect(err => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    process.exit(1); // Завершаем процесс, если не удаётся подключиться
  }
  console.log('Подключение к MySQL базе данных успешно');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Маршруты
app.post('/api/register', (req, res) => {
  const { login, password, fullName, phone, email } = req.body;
  console.log('[REGISTER] Получены данные:', req.body);

  if (
    !login ||
    !password || password.length < 6 ||
    !fullName || !fullName.match(/^([А-ЯЁ][а-яё]+)(\s[А-ЯЁ][а-яё]+)*$/i) ||
    !phone || !phone.match(/^\+7\d{10}$/) ||
    !email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  ) {
    console.log('[REGISTER] Валидация не пройдена');
    return res.status(400).json({ error: 'Некорректные данные' });
  }

  connection.query('SELECT id FROM Users WHERE login = ?', [login], (err, results) => {
    if (err) {
      console.error('[REGISTER] Ошибка базы данных при SELECT:', err);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (results.length > 0) {
      console.log('[REGISTER] Логин занят:', login);
      return res.status(400).json({ error: 'Логин занят' });
    }

    connection.query(
      'INSERT INTO Users (login, password, fullName, phone, email) VALUES (?, ?, ?, ?, ?)',
      [login, password, fullName, phone, email],
      (err, result) => {
        if (err) {
          console.error('[REGISTER] Ошибка базы данных при INSERT:', err);
          return res.status(500).json({ error: 'Ошибка регистрации' });
        }
        console.log('[REGISTER] Пользователь зарегистрирован:', login);
        res.json({ message: 'Пользователь зарегистрирован' });
      }
    );
  });
});

app.post('/api/login', (req, res) => {
  const { login, password } = req.body;
  console.log('[LOGIN] Получены данные:', req.body);

  if (!login || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  connection.query('SELECT * FROM Admins WHERE login = ? AND password = ?', [login, password], (err, adminResults) => {
    if (err) {
      console.error('[LOGIN] Ошибка базы данных при поиске админа:', err);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }

    if (adminResults.length > 0) {
      const admin = adminResults[0];
      return res.json({ id: admin.id, login: admin.login, role: 'admin', message: 'Админ авторизован' });
    }

    connection.query('SELECT * FROM Users WHERE login = ? AND password = ?', [login, password], (err, userResults) => {
      if (err) {
        console.error('[LOGIN] Ошибка базы данных при поиске пользователя:', err);
        return res.status(500).json({ error: 'Ошибка базы данных' });
      }

      if (userResults.length === 0) {
        return res.status(400).json({ error: 'Неверный логин или пароль' });
      }

      const user = userResults[0];
      return res.json({ id: user.id, fullName: user.fullName, role: 'user' });
    });
  });
});

app.get('/api/cars', (req, res) => {
  connection.query('SELECT * FROM Cars', (err, results) => {
    if (err) return res.status(500).json({ error: 'Ошибка получения данных' });
    res.json(results);
  });
});

app.post('/api/applications', (req, res) => {
  const {
    userId,
    address,
    phone,
    driverLicenseSeries,
    driverLicenseNumber,
    driverLicenseDate,
    carId,
    dateTime,
    paymentType,
  } = req.body;

  if (
    !userId ||
    !address ||
    !phone || !phone.match(/^\+7\d{10}$/) ||
    !driverLicenseSeries || !driverLicenseSeries.match(/^\d{4}$/) ||
    !driverLicenseNumber || !driverLicenseNumber.match(/^\d{6}$/) ||
    !driverLicenseDate || isNaN(Date.parse(driverLicenseDate)) ||
    !carId ||
    !dateTime || new Date(dateTime) < new Date() ||
    !['cash', 'card'].includes(paymentType)
  ) {
    return res.status(400).json({ error: 'Некорректные данные' });
  }

  connection.query(
    'INSERT INTO Applications (userId, address, phone, driverLicenseSeries, driverLicenseNumber, driverLicenseDate, carId, dateTime, paymentType, statusId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, address, phone, driverLicenseSeries, driverLicenseNumber, driverLicenseDate, carId, dateTime, paymentType, 1], // статус 1 - pending
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Ошибка создания заявки' });
      res.json({ message: 'Заявка создана' });
    }
  );
});

app.get('/api/applications/:userId', (req, res) => {
  const userId = req.params.userId;
  connection.query(
    `SELECT a.*, s.id AS statusId, s.name AS status, c.brand, c.model
     FROM Applications a
     JOIN Statuses s ON a.statusId = s.id
     JOIN Cars c ON a.carId = c.id
     WHERE a.userId = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Ошибка получения заявок' });
      res.json(results);
    }
  );
});

app.get('/api/admin/applications', (req, res) => {
  connection.query(
    `SELECT a.*, u.fullName, c.brand, c.model, s.name AS status
     FROM Applications a
     JOIN Users u ON a.userId = u.id
     JOIN Cars c ON a.carId = c.id
     JOIN Statuses s ON a.statusId = s.id`,
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Ошибка получения заявок' });
      res.json(results);
    }
  );
});

app.post('/api/cars', (req, res) => {
  const { brand, model, adminLogin, adminPassword } = req.body;

  if (adminLogin !== 'avto2024' || adminPassword !== 'poehali') {
    return res.status(401).json({ error: 'Недостаточно прав' });
  }

  if (!brand || !model) {
    return res.status(400).json({ error: 'Заполните бренд и модель' });
  }

  connection.query('INSERT INTO Cars (brand, model) VALUES (?, ?)', [brand, model], (err, result) => {
    if (err) return res.status(500).json({ error: 'Ошибка добавления автомобиля' });
    res.json({ id: result.insertId, message: 'Автомобиль добавлен' });
  });
});

app.put('/api/admin/applications/:id', (req, res) => {
  const { statusId, rejectionReason, adminLogin, adminPassword } = req.body;
  const id = req.params.id;

  if (adminLogin !== 'avto2024' || adminPassword !== 'poehali') {
    return res.status(401).json({ error: 'Недостаточно прав' });
  }

  if (!statusId) {
    return res.status(400).json({ error: 'Не указан статус' });
  }

  const statusIdNum = Number(statusId);

  connection.query(
    'UPDATE Applications SET statusId = ?, rejectionReason = ? WHERE id = ?',
    [statusIdNum, statusIdNum === 4 ? rejectionReason || '' : '', id],
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Ошибка обновления статуса' });

      res.json({ 
        message: 'Статус обновлен',
        status: statusIdNum === 1 ? 'Ожидается' :
                statusIdNum === 2 ? 'Одобрено' :
                statusIdNum === 3 ? 'Выбор' :
                statusIdNum === 4 ? 'Отклонено' : 'Неизвестно',
        rejectionReason: statusIdNum === 4 ? rejectionReason || '' : ''
      });
    }
  );
});

app.get('/api/applications/:id/pdf', (req, res) => {
  const id = req.params.id;

  connection.query(
    `SELECT a.*, u.fullName, u.email, c.brand, c.model, s.name AS status
     FROM Applications a
     JOIN Users u ON a.userId = u.id
     JOIN Cars c ON a.carId = c.id
     JOIN Statuses s ON a.statusId = s.id
     WHERE a.id = ? AND s.id = 3`,
    [id],
    (err, results) => {
      if (err || !results.length) {
        return res.status(400).json({ error: 'Заявка не найдена или не завершена' });
      }

      const app = results[0];
      const doc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=application-${id}.pdf`);

      doc.pipe(res);

      doc.registerFont('Roboto', path.join(__dirname, 'fonts', 'Roboto-Regular.ttf'));
      doc.font('Roboto');

      doc.fontSize(16).text('Тест-драйв', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Пользователь: ${app.fullName}`);
      doc.text(`Email: ${app.email}`);
      doc.text(`Автомобиль: ${app.brand} ${app.model}`);
      doc.text(`Дата и время: ${new Date(app.dateTime).toLocaleString()}`);
      doc.text(`Статус: ${app.status}`);

      doc.end();
    }
  );
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
const PORT = process.env.PORT || config.port;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});