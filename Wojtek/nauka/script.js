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
var summaryCorrectAnswersDiv = document.getElementById('poprawne');
var summaryIncorrectAnswersDiv = document.getElementById('niepoprawne');
var znakiDiv = document.getElementById('znaki');

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

async function displayQuestionAndAnswers(selectedCategories) {
  var url = 'http://localhost:8081/randomObjects';

  if (selectedCategories.length > 0) {
    url += '?categoryIds=' + selectedCategories.join(',');
    canAnswer = true;
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

      var shuffledNames = await Promise.all(data.map(async function(record) {
        return {
          name: record.linkPhoto,
          category: await getCategoryById(record.signCategoryId)
        };
      }));

      shuffleArray(shuffledNames);

      shuffledNames.forEach(function(record, index) {
		  
        var answerDiv = document.createElement('div');
        answerDiv.classList.add('answer');
        answerDiv.classList.add('odp' + (index + 1));

        var image = document.createElement('img');
        var category = record.category;
        image.src = 'sign/' + category + '/' + record.name;
        image.classList.add('sign-image');
        answerDiv.appendChild(image);

        if (category) {
          var categoryLabel = document.createElement('p');
          categoryLabel.classList.add('sign-category');
          answerDiv.appendChild(categoryLabel);
        }

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
            if (record.name === result.linkPhoto) {
              score.correctAnswers++;
            }

            score.totalQuestions++;
            updateScore();

            if (score.totalQuestions === 5) {
              showSummary();
            } else {
              setTimeout(function() {
                displayQuestionAndAnswers(selectedCategories);
              }, 1000);
            }
          }
        });
      });
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
  summaryCorrectAnswersDiv.textContent ='Poprawne odpowiedzi: ' + score.correctAnswers;
  const incorrectAnswers=score.totalQuestions-score.correctAnswers;
  summaryIncorrectAnswersDiv.textContent =' Niepoprawne odpowiedzi: ' + incorrectAnswers;
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
  if (selectedCategories.length > 0) {
    displayQuestionAndAnswers(selectedCategories);
    znakiDiv.style.display = 'none';
  } else {
    alert("Proszę wybrać co najmniej jedną kategorię.");
  }
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
        alert("Oliwia ma racje");
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
