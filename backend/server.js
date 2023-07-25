const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;
const dbPath = 'dl.db';


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Ustalenie katalogu, w którym znajdują się pliki HTML i CSS
const staticDir = path.join(__dirname, '../frontend');
app.use(express.static(staticDir));

// Tworzenie połączenia z bazą danych
const db = new sqlite3.Database(dbPath);

// Ustawienia sesji
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
  }));

// Middleware sprawdzające, czy użytkownik jest zalogowany
function checkAuth(req, res, next) {
  if (req.session.isLoggedIn || req.url === '/register') {
    // Sprawdzamy, czy zalogowany użytkownik ma przypisane id
    if (req.session.loggedUserId) {
      res.locals.loggedUserId = req.session.loggedUserId;
    } else {
      res.locals.loggedUserId = null;
    }
    next();
  } else {
    res.redirect('/login');
  }
}

app.get('/login', (req, res) => {
  const loginPath = path.join(staticDir, 'login.html');
  res.sendFile(loginPath);
});
// Obsługa logowania
app.post('/login', (req, res) => {
  // Sprawdzenie danych logowania
  const username = req.body.login;
  const password = req.body.password;

  const query = 'SELECT * FROM user';

  db.all(query, [], (err, rows) => {
    if (err) { 
      // Obsługa błędu w przypadku niepowodzenia zapytania
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      const user = rows.find((row) => row.login === username && row.password === password);
      if (user) {
        req.session.isLoggedIn = true;
        req.session.loggedUserId = user.id; // Przypisujemy id zalogowanego użytkownika do sesji
        res.redirect('/city');
      } else {
        res.redirect('/login');
      }
    }
  });
});
app.get('/money', checkAuth, (req, res) => {
  const userId = req.session.loggedUserId; // Corrected variable name
  // Zapytanie do bazy danych w celu pobrania pieniędzy dla zalogowanego użytkownika
  const getStatsQuery = 'SELECT money FROM user WHERE id = ?';
  db.get(getStatsQuery, [userId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      if (row) {
        const userLevel = row.money;
        // Przekazujemy poziom użytkownika jako odpowiedź do klienta
        res.json({ userLevel });
      } else {
        // Jeśli użytkownik o podanym id nie został znaleziony w bazie danych
        res.status(404).send('Nie znaleziono użytkownika o podanym id.');
      }
    }
  });
});

app.get('/register', checkAuth, (req, res) => {
  const registerPath = path.join(staticDir, '../frontend/register.html');
  res.sendFile(registerPath);
});
app.post('/register', (req, res) => {
  const username = req.body.login;
  const password = req.body.password;

  // Sprawdź, czy użytkownik o podanym loginie już istnieje w bazie danych
  const checkUserQuery = 'SELECT * FROM user WHERE login = ?';
  db.get(checkUserQuery, [username], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else if (row) {
      // Jeśli użytkownik o podanym loginie już istnieje, wyślij komunikat o błędzie
      res.status(409).send('Użytkownik o podanym loginie już istnieje.');
    } else {
      // Jeśli użytkownik o podanym loginie nie istnieje, dodaj go do bazy danych
      const insertUserQuery = 'INSERT INTO user (login, password, money, lvl) VALUES (?, ?, 100, 1)';
      db.run(insertUserQuery, [username, password], function (err) {
        if (err) {
          console.error('Błąd przy dodawaniu użytkownika:', err.message);
          res.status(500).send('Internal Server Error');
        } else {
          console.log(`Użytkownik ${username} został zarejestrowany.`);

          // Po dodaniu użytkownika, teraz dodajemy dla niego auto o kolorze o id równym 1
const userId = this.lastID; // Pobieramy ID ostatnio dodanego użytkownika
const insertCarQuery = 'INSERT INTO car (userId, colorId) VALUES (?, 1)';
db.run(insertCarQuery, [userId], function (err) {
  if (err) {
    console.error('Błąd przy dodawaniu auta dla użytkownika:', err.message);
    res.status(500).send('Internal Server Error');
  } else {
    console.log(`Dodano auto dla użytkownika o id ${userId} o kolorze o id 1.`);

    // Pobieramy ID ostatnio dodanego auta dla danego użytkownika
    const carIdQuery = 'SELECT id FROM car WHERE userId = ?';
    db.get(carIdQuery, [userId], function (err, row) {
      if (err) {
        console.error('Błąd przy pobieraniu ID samochodu dla użytkownika:', err.message);
        res.status(500).send('Internal Server Error');
      } else if (row) {
        const carId = row.id; // Pobieramy ID samochodu

        // Teraz możemy wykonać wpisy do tabeli carEnchant dla tego samochodu
        const insertCarEnchantQuery = 'INSERT INTO carEnchant (carId, enchantId) VALUES (?, ?), (?, ?), (?, ?)';
        db.run(insertCarEnchantQuery, [carId, 1, carId, 8, carId, 15], function (err) {
          if (err) {
            console.error('Błąd przy dodawaniu wpisów do tabeli carEnchant:', err.message);
            res.status(500).send('Internal Server Error');
          } else {
            console.log(`Dodano wpisy do tabeli carEnchant dla samochodu o id ${carId}.`);
            res.redirect('/login'); // Możesz przekierować użytkownika na stronę logowania po zarejestrowaniu
          }
        });
      } else {
        console.error('Nie znaleziono samochodu dla użytkownika o podanym id.');
        res.status(404).send('Nie znaleziono samochodu dla użytkownika o podanym id.');
      }
    });
  }
});   
        }
      });
    }
  });
});




app.get('/city', checkAuth, (req, res) => {
  const cityPath = path.join(staticDir, '../frontend/city.html');
  res.sendFile(cityPath);
});
app.post('/logout', (req, res) => {
  req.session.isLoggedIn = false;
  req.session.loggedUserId = null; // Czyścimy id zalogowanego użytkownika przy wylogowaniu
  res.json({ success: true }); // Odpowiedź dla klienta, że wylogowanie zakończyło się sukcesem
});

app.get('/salon', checkAuth, (req, res) => {
  const Path = path.join(staticDir, '../frontend/salon.html');
  res.sendFile(Path);
});
// Endpoint do pobrania linku do koloru auta dla zalogowanego użytkownika
app.get('/car-color', checkAuth, (req, res) => {
  const userId = req.session.loggedUserId;

  // Zapytanie do bazy danych w celu pobrania linku do koloru auta dla zalogowanego użytkownika
  const getCarColorQuery = 'SELECT linkToColor FROM car INNER JOIN color ON car.colorId = color.id WHERE car.userId = ? LIMIT 1';
  db.get(getCarColorQuery, [userId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else if (row) {
      const colorLink = row.linkToColor;
      // Przekazujemy link do koloru auta jako odpowiedź do klienta
      res.json({ colorLink });
    } else {
      // Jeśli użytkownik nie ma przypisanego koloru auta, można wysłać domyślny link lub inny komunikat
      res.status(404).send('Nie znaleziono koloru auta dla użytkownika.');
    }
  });
});
// Endpoint do aktualizacji koloru auta
app.post('/update-car-color', checkAuth, (req, res) => {
  const userId = req.session.loggedUserId;
  const colorId = req.body.colorId;

  // Validate the colorId (1, 2, 3, or 4)
  if (![1, 2, 3, 4].includes(colorId)) {
    return res.status(400).send('Invalid colorId. It should be 1, 2, 3, or 4.');
  }

  // Update the car color for the logged-in user in the database
  const updateCarColorQuery = 'UPDATE car SET colorId = ? WHERE userId = ?';
  db.run(updateCarColorQuery, [colorId, userId], (err) => {
    if (err) {
      console.error('Error updating car color:', err.message);
      res.status(500).send('Internal Server Error');
    } else {
      console.log(`Updated car color for user with id ${userId}.`);
      res.sendStatus(200);
    }
  });
});


app.get('/kiosk', checkAuth, (req, res) => {
  const Path = path.join(staticDir, '../frontend/kiosk.html');
  res.sendFile(Path);
});
// Endpoint do pobrania linku babolot
app.get('/stats-babolot', checkAuth, (req, res) => {
  const getStatsQuery = 'SELECT (SELECT COUNT(DISTINCT as2.score) FROM allStat as2 WHERE as2.statId = 1 AND as2.score > as1.score) + 1 AS miejsce, u.login AS loginUzytkownika, s.name AS statName, as1.score AS iloscPunktow FROM allStat AS as1 JOIN user AS u ON as1.userId = u.id JOIN stat AS s ON as1.statId = s.id WHERE as1.statId = 1 ORDER BY as1.score DESC;';
  db.all(getStatsQuery, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      if (rows.length > 0) {
        res.json(rows); // Wysyłamy dane w formacie JSON
      } else {
        // Jeśli nie znaleziono statystyk
        res.status(404).send('Nie znaleziono statystyk');
      }
    }
  });
});
// Endpoint do pobrania linku holerace
app.get('/stats-holerace', checkAuth, (req, res) => {
  const getStatsQuery = 'SELECT (SELECT COUNT(DISTINCT as2.score) FROM allStat as2 WHERE as2.statId = 2 AND as2.score > as1.score) + 1 AS miejsce, u.login AS loginUzytkownika, s.name AS statName, as1.score AS iloscPunktow FROM allStat AS as1 JOIN user AS u ON as1.userId = u.id JOIN stat AS s ON as1.statId = s.id WHERE as1.statId = 2 ORDER BY as1.score DESC;';
  db.all(getStatsQuery, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      if (rows.length > 0) {
        res.json(rows); // Wysyłamy dane w formacie JSON
      } else {
        // Jeśli nie znaleziono statystyk
        res.status(404).send('Nie znaleziono statystyk');
      }
    }
  });
});
// Endpoint do pobrania linku quizy
app.get('/stats-quizy', checkAuth, (req, res) => {
  const getStatsQuery = 'SELECT (SELECT COUNT(DISTINCT as2.score) FROM allStat as2 WHERE as2.statId = 3 AND as2.score > as1.score) + 1 AS miejsce, u.login AS loginUzytkownika, s.name AS statName, as1.score AS iloscPunktow FROM allStat AS as1 JOIN user AS u ON as1.userId = u.id JOIN stat AS s ON as1.statId = s.id WHERE as1.statId = 3 ORDER BY as1.score DESC;';
  db.all(getStatsQuery, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      if (rows.length > 0) {
        res.json(rows); // Wysyłamy dane w formacie JSON
      } else {
        // Jeśli nie znaleziono statystyk
        res.status(404).send('Nie znaleziono statystyk');
      }
    }
  });
});
// Endpoint do pobrania linku xp
app.get('/stats-xp', checkAuth, (req, res) => {
  const getStatsQuery = 'SELECT (SELECT COUNT(DISTINCT as2.score) FROM allStat as2 WHERE as2.statId = 4 AND as2.score > as1.score) + 1 AS miejsce, u.login AS loginUzytkownika, s.name AS statName, as1.score AS iloscPunktow FROM allStat AS as1 JOIN user AS u ON as1.userId = u.id JOIN stat AS s ON as1.statId = s.id WHERE as1.statId = 4 ORDER BY as1.score DESC;';
  db.all(getStatsQuery, (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      if (rows.length > 0) {
        res.json(rows); // Wysyłamy dane w formacie JSON
      } else {
        // Jeśli nie znaleziono statystyk
        res.status(404).send('Nie znaleziono statystyk');
      }
    }
  });
});
// Endpoint do pobrania linku lvl
app.get('/stats-lvl', checkAuth, (req, res) => {
  const userId = req.session.loggedUserId; // Corrected variable name

  // Zapytanie do bazy danych w celu pobrania poziomu użytkownika (lvl) dla zalogowanego użytkownika
  const getStatsQuery = 'SELECT lvl FROM user WHERE id = ?';
  db.get(getStatsQuery, [userId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      if (row) {
        const userLevel = row.lvl;
        // Przekazujemy poziom użytkownika jako odpowiedź do klienta
        res.json({ userLevel });
      } else {
        // Jeśli użytkownik o podanym id nie został znaleziony w bazie danych
        res.status(404).send('Nie znaleziono użytkownika o podanym id.');
      }
    }
  });
});


app.get('/race', checkAuth, (req, res) => {
  const Path = path.join(staticDir, '../frontend/race.html');
  res.sendFile(Path);
});

app.get('/garage', checkAuth, (req, res) => {
  const Path = path.join(staticDir, '../frontend/garage.html');
  res.sendFile(Path);
});
app.get('/garage-updates', checkAuth, (req, res) => {
  const userId = req.session.loggedUserId;
  const getUpdatesQuery = `
    SELECT 
      enchant.lvl AS "Aktualny poziom", 
      enchant.cena AS "Cena kolejnego ulepszenia",
      typeUpdate.name AS "Typ ulepszenia"
    FROM car
    LEFT JOIN carEnchant ON car.id = carEnchant.carId
    LEFT JOIN enchant ON carEnchant.enchantId = enchant.id
    LEFT JOIN typeUpdate ON enchant.typeId = typeUpdate.id
    WHERE car.userId = ?
  `;
  db.all(getUpdatesQuery, [userId], (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      if (rows.length > 0) {
        res.json(rows); // Wysyłamy dane w formacie JSON
      } else {
        // Jeśli nie znaleziono statystyk
        res.status(404).send('Nie znaleziono statystyk');
      }
    }
  });
});
// Endpointy dla ulepszeń "amortyzator", "zderzak" i "silnik"
app.post('/upgrade-amortyzator', checkAuth, (req, res) => {
  const userId = req.session.loggedUserId;
  const cenaKolejnegoUlepszenia = 200; // Cena kolejnego ulepszenia amortyzatora (dla przykładu)

  // Sprawdź, czy użytkownik ma wystarczająco pieniędzy na ulepszenie
  const getStatsQuery = 'SELECT money FROM user WHERE id = ?';
  db.get(getStatsQuery, [userId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      if (row) {
        const userMoney = row.money;
        if (userMoney >= cenaKolejnegoUlepszenia) {
          // Uaktualnij poziom amortyzatora dla użytkownika w bazie danych
          const updateAmortyzatorQuery = 'UPDATE user SET amortyzator = amortyzator + 1 WHERE id = ?';
          db.run(updateAmortyzatorQuery, [userId], (err) => {
            if (err) {
              console.error('Błąd przy aktualizacji amortyzatora dla użytkownika:', err.message);
              res.status(500).send('Internal Server Error');
            } else {
              // Obniż odpowiednią ilość pieniędzy z konta użytkownika w bazie danych
              const reduceMoneyQuery = 'UPDATE user SET money = money - ? WHERE id = ?';
              db.run(reduceMoneyQuery, [cenaKolejnegoUlepszenia, userId], (err) => {
                if (err) {
                  console.error('Błąd przy obniżaniu pieniędzy dla użytkownika:', err.message);
                  res.status(500).send('Internal Server Error');
                } else {
                  console.log(`Użytkownik o id ${userId} ulepszył amortyzator.`);
                  res.sendStatus(200);
                }
              });
            }
          });
        } else {
          res.status(400).send('Brak wystarczającej ilości pieniędzy na ulepszenie.');
        }
      } else {
        res.status(404).send('Nie znaleziono użytkownika o podanym id.');
      }
    }
  });
});


app.get('/nauka', checkAuth, (req, res) => {
  const Path = path.join(staticDir, '../frontend/nauka.html');
  res.sendFile(Path);
});

app.get('/biblioteka', checkAuth, (req, res) => {
  const Path = path.join(staticDir, '../frontend/biblioteka.html');
  res.sendFile(Path);
});

app.get('/babolot', checkAuth, (req, res) => {
  const Path = path.join(staticDir, '../frontend/babolot.html');
  res.sendFile(Path);
});

app.get('/racehole', checkAuth, (req, res) => {
  const Path = path.join(staticDir, '../frontend/racehole.html');
  res.sendFile(Path);
});
//-----_____-----______-----_____-----_____-----_____-----_____-----
//Kod wojtek

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
    if (!row) {
      // Dodaj obsługę przypadku, gdy nie znaleziono kategorii o podanym ID
      return callback(new Error('Nie znaleziono kategorii o podanym ID.'));
    }
    // Jeśli dane są poprawne, przekazujemy nazwę kategorii do callbacka
    callback(null, row.name);
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

//kodeks biblioteka

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

//-----_____-----______-----_____-----_____-----_____-----_____-----
// Uruchomienie serwera
app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
  });