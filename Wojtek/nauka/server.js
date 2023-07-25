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

// Obsługa tablicy "sign"

function getRandomObjects(categoryIds, callback) {
  if (categoryIds && categoryIds.length > 0) {
    const randomCategoryId = categoryIds[Math.floor(Math.random() * categoryIds.length)];
    db.all('SELECT * FROM sign WHERE signCategoryId = ? ORDER BY RANDOM() LIMIT 3', randomCategoryId, function (err, rows) {
      if (err) {
        console.log(err);
        return callback(err);
      }
      callback(null, rows);
    });
  } else {
    const signCategoryId = Math.floor(Math.random() * 5) + 1;
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

function listSigns(callback) {
  db.all('SELECT * FROM sign', function (err, rows) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    callback(null, rows);
  });
}

function getRandomRoadCode(callback) {
  db.all('SELECT * FROM roadCode ORDER BY RANDOM() LIMIT 3', function (err, rows) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    callback(null, rows);
  });
}

// Routing

app.get('/listSign', function (req, res) {
  listSigns(function (err, rows) {
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

    let count = 0;
    objects.forEach(function (object) {
      getCategoryById(object.signCategoryId, function (err, categoryName) {
        if (err) {
          return res.status(500).send('Błąd serwera');
        }
        object.categoryName = categoryName;
        count++;
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

app.get('/randomRoadCode', function (req, res) {
  getRandomRoadCode(function (err, codes) {
    if (err) {
      return res.status(500).send('Błąd serwera');
    }
    res.json(codes);
  });
});

const server = app.listen(8081, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`Serwer nasłuchuje na http://${host}:${port}`);
});
