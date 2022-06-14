const express = require('express');
const mongoose = require('mongoose');
const path_react_app = '../client/build';
const app = express();
const Board = require('./models/Board');

// URL of the local database
const url = "mongodb://localhost:27017/"

// database connexion
mongoose.connect(url,  
{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to the database !"));

// Let's drop the collection
db.dropCollection(
  "board",
  function(err, result) {
  console.log("Collection droped");
  }
  );

// Initialisation
const firstBoard = new Board({
  squares: Array(9).fill(null),
  turn: 0,
  attribute: 'X',
  issue: null
});

firstBoard.save()
.catch(error => console.log(error));

let turn = firstBoard.turn;
let attribute = firstBoard.attribute;
let issue = firstBoard.issue;
let idBoard = firstBoard._id;

// Creation of a static version of React
app.use(express.static(path_react_app));
// Conversion in JSON
app.use(express.json());
// To avoid connexion problems which the user could have for security causes
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

/////  METHODS  /////

// Check this turn
function isMyTurnVerification(precedentPlayer, nextPlayer) {
  if(precedentPlayer == nextPlayer) {
    return true
  } else {
    return false
  }
}

function isNotOverVerification(issue) {
  if(issue == null) {
    return true
  } else {
    return false
  }
}

// Save this turn
function getAttribute(player) {
  if (player === true) {
    return 'X';
  } else {
    return 'O'
  }
}

function getPlayer(attribute) {
  if (attribute === 'X') {
    return true;
  } else {
    return false
  }
}

function updateBoard(squares, turn, selectedSquare, attribute) { 
  const newBoard = new Board({
    squares: squares,
    turn: turn,
    attribute: attribute
  });

  newBoard.squares[selectedSquare] = attribute;  
  return newBoard;
}

function saveBoard(newBoard) {
  newBoard.save()
  .catch(error => console.log(error));
}

// Organise the next turn
function nextPlayer(player) {
  return !(player);
}

function gameIssue(newBoard) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  // 1er cas : il y a un vainqueur
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (newBoard.squares[a] && newBoard.squares[a] === newBoard.squares[b] && newBoard.squares[a] === newBoard.squares[c]) {
      newBoard.issue = newBoard.squares[a];
      return newBoard
    }
  };
  
  // 2e cas : il n'y a pas de vainqueur et toujours des cases vides.
  for (let i = 0; i < 9; i++) {
    if (newBoard.squares[i] == null) {
      newBoard.issue = null;
      return newBoard
    }
  };

  // 3e cas : il n'y a pas de vainqueur mais le plateau est rempli.
  newBoard.issue = 'egality';
  return newBoard
}


/////  ROADS  /////

app.get("/getupdate", (req, res, next) => {
  Board.findOne({ _id: idBoard })
    .then(board => {      
      let xIs = board.player == 'X' ? true : false;
      let xIsNext = nextPlayer(xIs);
      let newSquares = board.squares;
      let newIssue = board.issue;

      res.json({
        newSquares: newSquares,
        xIsNext: xIsNext,
        issue: newIssue
      })
    })
    .catch(err => console.log('get error : ' + err));
});

app.post('/', (req, res, next) => {

  // Check this turn
  let isMyTurn = isMyTurnVerification(attribute, req.body.user);
  let isNotOver = isNotOverVerification(issue);

  if (isMyTurn == true && isNotOver == true) {
    // Save this turn
    turn += 1;
    const newBoard = updateBoard(req.body.squares, turn, req.body.selectedSquare, req.body.user);
    const finalBoard = gameIssue(newBoard);
    saveBoard(finalBoard);

    // Organise the next turn
    attribute = getAttribute(nextPlayer(getPlayer(finalBoard.attribute)));
    issue = finalBoard.issue;
    idBoard = newBoard._id;

    // Réponse
    res.send()

  }
});

app.get('/db', (req, res) => {
  Board.find({}, (err, found) => {
      if (!err) {
          res.send(found);
      }
  })
});

module.exports = app;