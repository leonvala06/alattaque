const express = require('express');
const mongoose = require('mongoose');
const path_react_app = '../client_3000_copy/build';
//const stuffRoutes = require('./routes/stuff');
const app = express();
//const Board = require('../model2/Board');

// URL de la db en local
const url = "mongodb://localhost:27017/"

// Connection de la base de donnée MongoDB
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
  "board3",
  function(err, result) {
  console.log("Collection droped");
  }
  );
  
// MODELS
const boardSchema = mongoose.Schema({
  cases: { type: Array, required: true },
  tour: { type: Number, required: true },
  joueur: { type: String },
  idPrecedent: { type: Object, required: true },
  issue: { type: String }
});
const Board3 = mongoose.model('Board3', boardSchema);

// Initialisation
const firstBoard = new Board3({
  cases: Array(9).fill(null),
  tour: 0,
  joueur: 'X',
  issue: null
});
firstBoard.idPrecedent = firstBoard._id;

firstBoard.save()
.then(() => {
  console.log('plateau initialisé');
  console.log('PREMIER PLATEAU: ' + firstBoard);
}
)
.catch(error => console.log(error));

let tour = firstBoard.tour;
let joueur = firstBoard.joueur;
let issue = firstBoard.issue;
let idBoard = firstBoard._id;

// Création d'une version statique de React
app.use(express.static(path_react_app))
// Conversion en JSON
app.use(express.json());
// Eviter les problèmes de connection que l'utilisateur peut rencontrer pour des raisons de sécurité
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

//app.use('/api/stuff', stuffRoutes);

/////  FONCTIONS  /////

// Validation de cette phase de jeu
function isMyTurnVerification(joueurPrecedent, joueurSuivant) {
  console.log('joueur = ' + joueurPrecedent);
  console.log('req.body.user = ' + joueurSuivant);
  if(joueurPrecedent == joueurSuivant) {
    return true
  } else {
    return false
  }
}

function isNotOverVerification(issuePlateau) {
  if(issuePlateau == null) {
    return true
  } else {
    return false
  }
}

// Enregistrement de cette phase de jeu
function getAttribut(joueur) {
  if (joueur === true) {
    return 'X';
  } else {
    return 'O'
  }
}

function getJoueur(attribut) {
  if (attribut === 'X') {
    return true;
  } else {
    return false
  }
}

function updateBoard(casesDuJeu, tourDuJeu, idBoard, caseSelectionnee, attribut) { 
  const newPlateau = new Board3({
    cases: casesDuJeu,
    tour: tourDuJeu,
    joueur: attribut,
    idPrecedent: idBoard
  });

  newPlateau.cases[caseSelectionnee] = attribut;
  console.log('plateau mis à jour');
  
  return newPlateau;
}

function saveBoard(newPlateau) {
  newPlateau.save()
  .then(() => console.log('plateau sauvegardé !'))
  .catch(error => console.log(error));
}

// Préparation de la prochaine phase de jeu
function nextPlayer(joueur) {
  return !(joueur);
}

function gameIssue(newPlateau) {
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
    if (newPlateau.cases[a] && newPlateau.cases[a] === newPlateau.cases[b] && newPlateau.cases[a] === newPlateau.cases[c]) {
      newPlateau.issue = newPlateau.cases[a];
      return newPlateau
    }
  };
  
  // 2e cas : il n'y a pas de vainqueur et toujours des cases vides.
  for (let i = 0; i < 9; i++) {
    if (newPlateau.cases[i] == null) {
      newPlateau.issue = null;
      return newPlateau
    }
  };

  // 3e cas : il n'y a pas de vainqueur mais le plateau est rempli.
  newPlateau.issue = 'égalité';
  return newPlateau
}


/////  ROUTES FONCTIONNELLES  /////

app.get("/getupdate", (req, res, next) => {
  Board3.findOne({ _id: idBoard })
    .then(board => { 
      console.log('get reçu');
      
      let xIs = board.joueur == 'X' ? true : false;
      let xIsNext = nextPlayer(xIs);
      let newSquares = board.cases;
      let newIssue = board.issue;

      res.json({
        newSquares: newSquares,
        xIsNext: xIsNext,
        issue: newIssue
      })
    })
    .catch(err => console.log('erreur de récupération : ' + err));
});

app.post('/', (req, res, next) => {
  console.log('post reçu');

  // Validation de cette phase de jeu

  let isMyTurn = isMyTurnVerification(joueur, req.body.user);
  let isNotOver = isNotOverVerification(issue);

  if (isMyTurn == true && isNotOver == true) {
    // Enregistrement de cette phase de jeu
    tour += 1;
    const newBoard = updateBoard(req.body.casesDuJeu, tour, idBoard, req.body.caseSelectionnee, req.body.user);
    const finalBoard = gameIssue(newBoard);
    saveBoard(finalBoard);

    // Préparation du prochain tour
    joueur = getAttribut(nextPlayer(getJoueur(finalBoard.joueur)));
    console.log('le nouveau joueur est : ' + joueur);
    issue = finalBoard.issue;
    idBoard = newBoard._id;

    // Réponse
    res.send()

  }
});

app.get('/db', (req, res) => {
  Board3.find({}, (err, found) => {
      if (!err) {
          res.send(found);
      }
  })
});

module.exports = app;