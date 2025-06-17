const express = require('express');
const router = express.Router();
const db = require('./db');
const PDFDocument = require('pdfkit');


router.post('/register', (req, res) => {
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

  db.query('SELECT id FROM Users WHERE login = ?', [login], (err, results) => {
    if (err) {
      console.error('[REGISTER] Ошибка базы данных при SELECT:', err);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }
    if (results.length > 0) {
      console.log('[REGISTER] Логин занят:', login);
      return res.status(400).json({ error: 'Логин занят' });
    }

    db.query(
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


router.post('/login', (req, res) => {
  const { login, password } = req.body;
  console.log('[LOGIN] Получены данные:', req.body);

  if (!login || !password) {
    return res.status(400).json({ error: 'Заполните все поля' });
  }

  
  db.query('SELECT * FROM Admins WHERE login = ? AND password = ?', [login, password], (err, adminResults) => {
    if (err) {
      console.error('[LOGIN] Ошибка базы данных при поиске админа:', err);
      return res.status(500).json({ error: 'Ошибка базы данных' });
    }

    if (adminResults.length > 0) {
     
      const admin = adminResults[0];
      return res.json({ id: admin.id, login: admin.login, role: 'admin', message: 'Админ авторизован' });
    }

 
    db.query('SELECT * FROM Users WHERE login = ? AND password = ?', [login, password], (err, userResults) => {
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

router.get('/cars', (req, res) => {
  db.query('SELECT * FROM Cars', (err, results) => {
    if (err) return res.status(500).json({ error: 'Ошибка получения данных' });
    res.json(results);
  });
});



router.post('/applications', (req, res) => {
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

  db.query(
    'INSERT INTO Applications (userId, address, phone, driverLicenseSeries, driverLicenseNumber, driverLicenseDate, carId, dateTime, paymentType, statusId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [userId, address, phone, driverLicenseSeries, driverLicenseNumber, driverLicenseDate, carId, dateTime, paymentType, 1], // статус 1 - pending
    (err, result) => {
      if (err) return res.status(500).json({ error: 'Ошибка создания заявки' });
      res.json({ message: 'Заявка создана' });
    }
  );
});


router.get('/applications/:userId', (req, res) => {
  const userId = req.params.userId;
  db.query(
    `SELECT a.*, c.brand, c.model, s.name AS status
     FROM Applications a
     JOIN Cars c ON a.carId = c.id
     JOIN Statuses s ON a.statusId = s.id
     WHERE a.userId = ?`,
    [userId],
    (err, results) => {
      if (err) return res.status(500).json({ error: 'Ошибка получения заявок' });
      res.json(results);
    }
  );
});

router.get('/admin/applications', (req, res) => {
  db.query(
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


router.post('/cars', (req, res) => {
  const { brand, model, adminLogin, adminPassword } = req.body;

  if (adminLogin !== 'avto2024' || adminPassword !== 'poehali') {
    return res.status(401).json({ error: 'Недостаточно прав' });
  }

  if (!brand || !model) {
    return res.status(400).json({ error: 'Заполните бренд и модель' });
  }

  db.query('INSERT INTO Cars (brand, model) VALUES (?, ?)', [brand, model], (err, result) => {
    if (err) return res.status(500).json({ error: 'Ошибка добавления автомобиля' });
    res.json({ id: result.insertId, message: 'Автомобиль добавлен' });
  });
});
router.get('/applications/:userId', (req, res) => {
  const userId = req.params.userId;

  db.query(
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

router.put('/admin/applications/:id', (req, res) => {
  const { statusId, rejectionReason, adminLogin, adminPassword } = req.body;
  const id = req.params.id;

  if (adminLogin !== 'avto2024' || adminPassword !== 'poehali') {
    return res.status(401).json({ error: 'Недостаточно прав' });
  }

  if (!statusId) {
    return res.status(400).json({ error: 'Не указан статус' });
  }

  const statusIdNum = Number(statusId);

  db.query(
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


  const path = require('path');

router.get('/applications/:id/pdf', (req, res) => {
  const id = req.params.id;

  db.query(
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

module.exports = router;

