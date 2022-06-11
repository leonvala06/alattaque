const express = require('express');
const mongoose = require('mongoose');
const path_react_app = '../client_3000_copy/build';
//const stuffRoutes = require('./routes/stuff');
const app = express();
//const Board = require('../model2/Board');

// URL de la db en local
const url = "mongodb://localhost:27017/"

/* URL de la db sur le cloud Atlas
const url = "mongodb+srv://napoleon:alattaque@cluster0.k7gtbcl.mongodb.net/?retryWrites=true&w=majority"
*/

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
  
// A SUPPRIMER QUAND LA FONCTION INIT EST AU POINT
const boardSchema = mongoose.Schema({
  cases: { type: Array, required: true },
  tour: { type: Number, required: true },
  joueur: { type: String },
  idPrecedent: { type: Object, required: true },
  issue: { type: String }
});

const Board3 = mongoose.model('Board3', boardSchema);

const firstBoard = new Board3({
  cases: Array(9).fill(null),
  tour: 0,
  joueur: 'O',
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

let idBoard = firstBoard._id;
let tour = 0;
let issue = firstBoard.issue;

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

// Création & récupération du plateau de jeu
function initialiseBoard(init) {
  if (init === true) {
    const firstBoard = new Board({
      cases: Array(9).fill(null),
      tour: 0
    });
    firstBoard.idPrecedent = firstBoard._id;
    firstBoard.save()
    .then(() => console.log('plateau initialisé'))
    .catch(error => console.log(error));
    console.log('PREMIER PLATEAU: ' + firstBoard);
    
    let idBoard = firstBoard._id;
    let tour = 0;
    
    return board;
  }
}
/*
function getBoard(idPlateau) {
  console.log("Je rendre dans le getBoard");
  Board3.findOne({ _id: idPlateau })
    .then(board => { 
      console.log('plateau récupéré' + board);
      return board
    })
    .catch(err => console.log('erreur de récupération : ' + err));
}
*/

// Validation de cette phase de jeu
function getIssueVerification(issuePlateau) {
  if(issuePlateau == null) {
    return true
  } else {
    return false
  }
}

// Enregistrement de cette phase de jeu
function getAttribute(attribut) {
  if (attribut === true) {
    return 'X';
  } else {
    return 'O'
  }
}

function updateBoard(casesDuJeu, tourDuJeu, idBoard, caseSelectionnee, attribut) { 
  const newPlateau = new Board3({
    cases: casesDuJeu,
    tour: tourDuJeu,
    joueur: getAttribute(attribut),
    idPrecedent: idBoard
  });

  newPlateau.cases[caseSelectionnee] = getAttribute(attribut);
  console.log('plateau mis à jour');
  
  return newPlateau;
}

function saveBoard(newPlateau) {
  newPlateau.save()
  .then(() => console.log('plateau sauvegardé !'))
  .catch(error => console.log(error));
}

// Préparation de la prochaine phase de jeu
function changePlayer(attribut) {
  return !(attribut);
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

// Fin du jeu
function deleteBoard(idDernierPlateau) {
    Board3.deleteOne({ _id: idDernierPlateau })
      .then(() => console.log('plateau supprimé'))
      .catch((err) => console.log(err))
}

/////  ROUTES FONCTIONNELLES  /////

app.get("/getupdate", (req, res, next) => {
  Board3.findOne({ _id: idBoard })
    .then(board => { 
      console.log('Get reçu' + board);
      
      let xIs = board.joueur == 'X' ? true : false;
      let xIsNext = changePlayer(xIs);
      let newSquares = board.cases;
      console.log(newSquares);
      res.json({
        newSquares: newSquares,
        xIsNext: xIsNext
      })
    })
    .catch(err => console.log('erreur de récupération : ' + err));
});


app.post('/', (req, res, next) => {
  console.log('post reçu');
  //console.log('CORPS DE LA REQUETE :');
  //console.log(req.body);

  // Création & Récupération du plateau de jeu
  /*const init = initialiseBoard(req.body.init);
  console.log('INITIALISATION : ' + init);*/

  // Validation de cette phase de jeu
  let tourValide = getIssueVerification(issue);
  tour += 1;

  if (tourValide == true) {
    // Enregistrement de cette phase de jeu
    const newBoard = updateBoard(req.body.casesDuJeu, tour, idBoard, req.body.caseSelectionnee, req.body.joueur);
    const finalBoard = gameIssue(newBoard);
    issue = finalBoard.issue;
    saveBoard(finalBoard);
    idBoard = newBoard._id;

    // Préparation de la prochaine phase de jeu
    const xIsNext = changePlayer(req.body.joueur);     // Changer l'attribut du joueur

    // Réponse
    res.send()

  }
});

app.delete('/', (req, res, next) => {
  console.log('delete reçu');
  console.log('CORPS DE LA REQUETE :');
  console.log(req.body);

  deleteBoard(firstBoard._id)

  res.send('Terminator')
});

app.get('/db', (req, res) => {
  Board3.find({}, (err, found) => {
      if (!err) {
          res.send(found);
      }
  })
});

module.exports = app;