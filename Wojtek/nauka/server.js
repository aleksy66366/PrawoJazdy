const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const db = new sqlite3.Database('dl.db');

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'nauka.html'));
});

function getRandomObjects(categoryIds, callback) {
  if (categoryIds && categoryIds.length > 0) {
    // Wybierz jedną losową kategorię spośród przesłanych kategorii
    const randomCategoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];

    // Wybierz 3 losowe obiekty z wybranej kategorii
    db.all('SELECT * FROM sign WHERE signCategoryId = ? ORDER BY RANDOM() LIMIT 3', randomCategoryId, function (err, rows) {
      if (err) {
        console.log(err);
        return callback(err);
      }
      callback(null, rows);
    });
  } else {
    // Jeśli nie przesłano categoryIds, wylosuj jedno wspólne signCategoryId, które będzie używane dla wszystkich losowanych obiektów
    const signCategoryId = Math.floor(Math.random() * 5) + 1; // Losowanie ID kategorii od 1 do 5
    db.all('SELECT * FROM sign WHERE signCategoryId = ? ORDER BY RANDOM() LIMIT 3', signCategoryId, function (err, rows) {
      if (err) {
        console.log(err);
        return callback(err);
      }
      callback(null, rows);
    });
  }
}

function getCategoryById(categoryId, callback) {
  db.get('SELECT name FROM signCategory WHERE id = ?', categoryId, function (err, row) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    callback(null, row ? row.name : '');
  });
}

app.get('/listSign', function (req, res) {
  db.all('SELECT * FROM sign', function (err, rows) {
    if (err) {
      console.log(err);
      return res.status(500).send('Błąd serwera');
    }
    res.json(rows);
  });
});

app.get('/randomObjects', function (req, res) {
  const categoryIds = req.query.categoryIds ? req.query.categoryIds.split(',').map(id => parseInt(id)) : null;
  getRandomObjects(categoryIds, function (err, objects) {
    if (err) {
      return res.status(500).send('Błąd serwera');
    }

    // Przetwarzanie każdego obiektu, aby dodać nazwę kategorii
    let count = 0;
    objects.forEach(function (object) {
      getCategoryById(object.signCategoryId, function (err, categoryName) {
        if (err) {
          return res.status(500).send('Błąd serwera');
        }
        object.categoryName = categoryName;
        count++;
        // Po przetworzeniu wszystkich obiektów, zwróć wynik
        if (count === objects.length) {
          res.json(objects);
        }
      });
    });
  });
});

app.get('/categoryById/:id', function(req, res) {
  const categoryId = req.params.id;
  getCategoryById(categoryId, function(err, categoryName) {
    if (err) {
      console.log(err);
      return res.status(500).send('Błąd serwera');
    }
    res.json({ name: categoryName });
  });
});

const server = app.listen(8081, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`Serwer nasłuchuje na http://${host}:${port}`);
});
