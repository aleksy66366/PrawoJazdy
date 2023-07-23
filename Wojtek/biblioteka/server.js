const express = require('express');
const app = express();
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));


app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'biblioteka.html'));
});

const db = new sqlite3.Database('dl.db');
// Funkcja getCategoryById, uwzględniająca nazwę tablicy 'signCategory'
function getCategoryById(categoryId, callback) {
  db.get('SELECT name FROM signCategory WHERE id = ?', categoryId, function (err, row) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    if (!row) {
      // Dodaj obsługę przypadku, gdy nie znaleziono kategorii o podanym ID
      return callback(new Error('Nie znaleziono kategorii o podanym ID.'));
    }
    // Jeśli dane są poprawne, przekazujemy nazwę kategorii do callbacka
    callback(null, row.name);
  });
}


// Funkcja getObjectById, pobierająca dane obiektu na podstawie ID obiektu
function getObjectById(objectId, callback) {
  db.get('SELECT * FROM sign WHERE id = ?', objectId, function (err, row) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    if (!row) {
      return callback(new Error('Nie znaleziono obiektu o podanym ID.'));
    }
    getCategoryById(row.signCategoryId, function (err, categoryName) {
      if (err) {
        return callback(err);
      }
      row.category = categoryName;
      callback(null, row);
    });
  });
}



function getKodeksById(objectId, callback) {
  db.get('SELECT * FROM roadCode WHERE id = ?', objectId, function (err, row) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    if (!row) {
      return callback(new Error('Nie znaleziono obiektu o podanym ID.'));
    }
    callback(null, row);
  });
}


app.get('/getKodeksById/:id', function (req, res) {
  const objectId = req.params.id;
  getKodeksById(objectId, function (err, objectData) {
    if (err) {
      console.log(err);
      return res.status(404).send('Nie znaleziono obiektu o podanym ID.');
    }
    res.json(objectData);
  });
});



app.get('/getKodeksById/:id', function (req, res) {
  const objectId = req.params.id;
  getKodeksById(objectId, function (err, objectData) {
    if (err) {
      console.log(err);
      return res.status(404).send('Nie znaleziono obiektu o podanym ID.');
    }
    res.json(objectData);
  });
});





// Endpoint do pobierania danych obiektu na podstawie ID
app.get('/getObjectById/:id', function (req, res) {
  const objectId = req.params.id;
  getObjectById(objectId, function (err, objectData) {
    if (err) {
      console.log(err);
      return res.status(404).send('Nie znaleziono obiektu o podanym ID.');
    }
    res.json(objectData);
  });
});

// Endpoint do pobierania nazwy kategorii na podstawie ID
app.get('/categoryName/:id', function (req, res) {
  const categoryId = req.params.id;
  getCategoryById(categoryId, function (err, categoryName) {
    if (err) {
      console.log(err);
      return res.status(500).send('Błąd serwera');
    }
    res.json({ name: categoryName });
  });
}

);






const server = app.listen(8081, function () {
  const host = server.address().address;
  const port = server.address().port;
  console.log(`Serwer nasłuchuje na http://${host}:${port}`);
});
