        var quizEnd = document.getElementById('quizEnd');

        var backDiv = document.getElementById("back");
        backDiv.onclick = function() {
            window.location.href = 'city.html';
        };

        var zoomInButton = document.getElementById("zoomIn");
        zoomInButton.onclick = function() {
            document.body.style.zoom = parseFloat(window.getComputedStyle(document.body).zoom) + 0.1;
        };

        var zoomOutButton = document.getElementById("zoomOut");
        zoomOutButton.onclick = function() {
            document.body.style.zoom = parseFloat(window.getComputedStyle(document.body).zoom) - 0.1;
        };

        var screen = document.getElementById("screen");
        var quiz = document.getElementById("quiz");
        var znaki = document.getElementById("znaki");
        var kodeks = document.getElementById("kodeksNauka");

        znaki.onclick = function() {
            quiz.style.display = "flex";
            screen.style.display = "none";
            isRoadCodeQuiz = false;
        };

        kodeks.onclick = function() {
            quiz.style.display = "flex";
            screen.style.display = "none";
            isRoadCodeQuiz = true;
        };

        var testButton = document.getElementById('jeszczeRaz');
        testButton.addEventListener('click', function() {
            quiz.style.display = "none";
            quizEnd.style.display = "none";
            screen.style.display = "flex";
            znaki.style.display = "flex";
            kodeks.style.display = "flex";
        });




var score = {
  totalQuestions: 0,
  correctAnswers: 0,
};

var canAnswer = false;
var gameDiv = document.getElementById('quiz');
var descriptionDiv = document.getElementById('pytanie');
var odp1Div = document.getElementById('odp1');
var odp2Div = document.getElementById('odp2');
var odp3Div = document.getElementById('odp3');
var scoreDiv = document.getElementById('dane');
var summaryDiv = document.getElementById('quizEnd');
var summaryTotalQuestionsDiv = document.getElementById('podsumowanie');
var summaryCorrectAnswersDiv = document.getElementById('poprawneSymbol');
var summaryIncorrectAnswersDiv = document.getElementById('niepoprawne');
var znakiDiv = document.getElementById('znaki');
var roadCodeDiv = document.getElementById('kodeksNauka');

var isRoadCodeQuiz = false;

function getCategoryById(categoryId) {
  return new Promise(function(resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:8081/categoryById/' + categoryId, true);
    xhr.onload = function() {
      if (xhr.status === 200) {
        var category = JSON.parse(xhr.responseText);
        resolve(category.name);
      } else {
        reject('Błąd serwera');
      }
    };
    xhr.onerror = function() {
      reject('Błąd połączenia');
    };
    xhr.send();
  });
}

function showSummary() {
  const incorrectAnswers = score.totalQuestions - score.correctAnswers;
  summaryTotalQuestionsDiv.textContent = 'Liczba pytań: ' + score.totalQuestions + '\nLiczba poprawnych odpowiedzi: ' + score.correctAnswers + '\nLiczba złych odpowiedzi: ' + incorrectAnswers;
  score.totalQuestions = 0;
  score.correctAnswers = 0;
  updateScore();
  gameDiv.style.display = 'none';
  summaryDiv.style.display = 'block';
}

function showQuiz() {
  znakiDiv.style.display = 'block';
  gameDiv.style.display = 'none';
}

async function displayQuestionAndAnswers(selectedCategories, isRoadCodeQuiz) {
  var url = 'http://localhost:8081/randomObjects';

  if (isRoadCodeQuiz) {
    url = 'http://localhost:8081/randomRoadCode';
    canAnswer = true;
  } else if (selectedCategories.length > 0) {
    url += '?categoryIds=' + selectedCategories.join(',');
    canAnswer = true;
  } else {
    alert("Proszę wybrać co najmniej jedną kategorię.");
    return;
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.onload = async function() {
    if (xhr.status === 200) {
      var data = JSON.parse(xhr.responseText);
      var result = data[0];

      descriptionDiv.innerHTML = '';
      odp1Div.innerHTML = '';
      odp2Div.innerHTML = '';
      odp3Div.innerHTML = '';

      var description = document.createElement('p');
      description.textContent = result.about;
      descriptionDiv.appendChild(description);
		
      if (isRoadCodeQuiz) {
        var shuffledTitles = shuffleArray(data.map(record => record.title));

        shuffledTitles.forEach(function(title, index) {
          var answerDiv = document.createElement('div');
          answerDiv.classList.add('answer');
          answerDiv.classList.add('odp' + (index + 1));

          var titleLabel = document.createElement('p');
          titleLabel.textContent = title;
          answerDiv.appendChild(titleLabel);

          if (index === 0) {
            odp1Div.appendChild(answerDiv);
          } else if (index === 1) {
            odp2Div.appendChild(answerDiv);
          } else if (index === 2) {
            odp3Div.appendChild(answerDiv);
          }

          answerDiv.addEventListener('click', function() {
            if (canAnswer) {
              canAnswer = false;
              if (title === result.title) {
                score.correctAnswers++;
              }

              score.totalQuestions++;
              updateScore();

              if (score.totalQuestions === 5) {
                showSummary();
              } else {
                setTimeout(function() {
                  displayQuestionAndAnswers([], true);
                }, 1000);
              }
            }
          });
        });
      } else {
        // Wyświetlanie odpowiedzi dla tablicy "sign"
        var shuffledNames = shuffleArray(data.map(record => record.linkPhoto));

        shuffledNames.forEach(function(name, index) {
          var answerDiv = document.createElement('div');
          answerDiv.classList.add('answer');
          answerDiv.classList.add('odp' + (index + 1));

          var image = document.createElement('img');
          image.src = 'assets/sign/' + result.categoryName + '/' + name;
          image.classList.add('sign-image');
          answerDiv.appendChild(image);

          var categoryLabel = document.createElement('p');
          categoryLabel.classList.add('sign-category');
          //categoryLabel.textContent = result.categoryName;
          answerDiv.appendChild(categoryLabel);

          if (index === 0) {
            odp1Div.appendChild(answerDiv);
          } else if (index === 1) {
            odp2Div.appendChild(answerDiv);
          } else if (index === 2) {
            odp3Div.appendChild(answerDiv);
          }

          answerDiv.addEventListener('click', function() {
            if (canAnswer) {
              canAnswer = false;
              if (name === result.linkPhoto) {
                score.correctAnswers++;
              }

              score.totalQuestions++;
              updateScore();

              if (score.totalQuestions === 5) {
                showSummary();
              } else {
                setTimeout(function() {
                  displayQuestionAndAnswers(selectedCategories, false);
                }, 1000);
              }
            }
          });
        });
      }
    }
  };
  xhr.send();
}

function shuffleArray(array) {
  var currentIndex = array.length;
  var temporaryValue, randomIndex;

  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function updateScore() {
  summaryCorrectAnswersDiv.textContent = 'Poprawne odpowiedzi: ' + score.correctAnswers;
  const incorrectAnswers = score.totalQuestions - score.correctAnswers;
  summaryIncorrectAnswersDiv.textContent = 'Niepoprawne odpowiedzi: ' + incorrectAnswers;
  scoreDiv.textContent = 'Pytania: ' + score.totalQuestions + ' | Poprawne odpowiedzi: ' + score.correctAnswers;
}

function getSelectedCategories() {
  var checkboxes = document.querySelectorAll('input[type="checkbox"]');
  var selectedCategories = [];
  for (var i = 0; i < checkboxes.length; i++) {
    if (checkboxes[i].checked) {
      selectedCategories.push(parseInt(checkboxes[i].value));
    }
  }
  return selectedCategories;
}

znakiDiv.addEventListener('click', function() {
  var selectedCategories = getSelectedCategories();
  displayQuestionAndAnswers(selectedCategories, false);
  znakiDiv.style.display = 'none';
});

roadCodeDiv.addEventListener('click', function() {
  displayQuestionAndAnswers([], true);
  roadCodeDiv.style.display = 'none';
});

function resetGame() {
  score.totalQuestions = 0;
  score.correctAnswers = 0;
  canAnswer = false;
  updateScore();
  gameDiv.style.display = 'none';
  summaryDiv.style.display = 'none';
  
}

function konamiCode() {
  const codeSequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ];
  let currentCodeIndex = 0;

  function handleKeyPress(event) {
    const keyPressed = event.key;
    if (keyPressed === codeSequence[currentCodeIndex]) {
      currentCodeIndex++;

      if (currentCodeIndex === codeSequence.length) {
		  var div = document.getElementById('screen');
		  var imgTag = '<img src="suprise.png">';
		  div.innerHTML = imgTag;
        //alert("Oliwia ma racje");
        currentCodeIndex = 0;
      }
    } else {
      currentCodeIndex = 0;
    }
  }

  document.addEventListener("keydown", handleKeyPress);
}

konamiCode();

function init() {
  updateScore();
  document.addEventListener('DOMContentLoaded', resetGame);
}

init();
