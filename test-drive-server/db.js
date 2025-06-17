const mysql = require('mysql2');
const config = require('./config');

const connection = mysql.createConnection(config.db);

connection.connect(err => {
  if (err) {
    console.error('Ошибка подключения к базе данных:', err);
    process.exit(1); // Завершаем процесс, если не удаётся подключиться
  }
  console.log('Подключение к MySQL базе данных успешно');
});

module.exports = connection;
