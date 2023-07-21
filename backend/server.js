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
      const insertUserQuery = 'INSERT INTO user (login, password, money, lvl) VALUES (?, ?, 0, 1)';
      db.run(insertUserQuery, [username, password], function (err) {
        if (err) {
          console.error('Błąd przy dodawaniu użytkownika:', err.message);
          res.status(500).send('Internal Server Error');
        } else {
          console.log(`Użytkownik ${username} został zarejestrowany.`);

          // Po dodaniu użytkownika, teraz dodajemy dla niego auto o kolorze o id równym 1
          const userId = this.lastID; // Pobieramy ID ostatnio dodanego użytkownika
          
          const insertCarQuery = 'INSERT INTO car (userId, colorId) VALUES (?, 1)';
          db.run(insertCarQuery, [userId], (err) => {
            if (err) {
              console.error('Błąd przy dodawaniu auta dla użytkownika:', err.message);
              res.status(500).send('Internal Server Error');
            } else {
              console.log(`Dodano auto dla użytkownika o id ${userId} o kolorze o id 1.`);
              res.redirect('/login'); // Możesz przekierować użytkownika na stronę logowania po zarejestrowaniu
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

//-----_____-----______-----_____-----_____-----_____-----_____-----
// Uruchomienie serwera
app.listen(port, () => {
    console.log(`Serwer działa na porcie ${port}`);
  });