import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
const AXIOS = require('axios');
const URL_TO_SERVER = "http://localhost:3000";

var interval = null;
const REFRENSHING_RATE = 5000;

function Square(props) {
  return (
    <button className="square" onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
      />
    );
  }

  render() {
    return (
      <div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      squares: Array(9).fill(null),
      user: null,
      xIsNext: null
    };
  }

  setSquares(squares) {
    this.setState({
        squares: squares,
      });
  }
  setXturn(xTurn) {
    this.setState({
      xIsNext: xTurn
    });

  }
  getUpdate(leGame) {
    console.log("Getting update");
    AXIOS.get(URL_TO_SERVER + "/getupdate")
    .then(response => {
      console.log(response.data);
      const newSquares = response.data.newSquares;
      const xTurn = response.data.xIsNext;
      
      leGame.setSquares(newSquares);
      leGame.setXturn(xTurn);

      if (calculateWinner(newSquares)) {
        console.log("Clearing interval");
        clearInterval(interval);
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });   
  }

  sendUpdate(newSquares, i) {
    const leGame = this;
    AXIOS.post(URL_TO_SERVER, {
      casesDuJeu: newSquares,
      caseSelectionnee: i,
      joueur: leGame.state.xIsNext
    })
    .then(response => {
      console.log("Post reçu");
    });
  }

  isMyTurn() {
    if (this.state.user === 'X' && this.state.xIsNext)
      return true;
    else if (this.state.user === 'O' && !this.state.xIsNext)
      return true;
    else
      return false;
  }

  handleClick(i) {
    if(this.isMyTurn()) {
      console.log("It is my turn");
      const squares = this.state.squares.slice();
       console.log("entered authorised");
       this.setState({
         squares: squares,
        });
        if (calculateWinner(squares) || squares[i]) {
         return;
         }
        squares[i] = this.state.user;       

      // send back new tab
      this.sendUpdate(squares, i);
    }
}

selectPlayer(player) {
  if(!this.state.user) {
    this.setState({user: player});
  }
  if(!interval) {
    console.log("Setting interval");
    interval = setInterval(this.getUpdate, REFRENSHING_RATE, this);
  }
}  
  
  render() {
    const winner = calculateWinner(this.state.squares);
    const player = 'Player: ' + this.state.user;
    const joueur = this.state.user ? null : (<><ul><button onClick={() => this.selectPlayer("X")}>{"Joueur X"}</button></ul><ul><button onClick={() => this.selectPlayer("O")}>{"Joueur O"}</button></ul></>);

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }
    

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={this.state.squares}
            onClick={(i) => {
              this.handleClick(i);
            }
            }
          />
        </div>
        <div className="game-info">
        <div>{player}</div>
          <div>{status}</div>
          <div>{joueur}</div>
          <div><button onClick={() => this.setSquares([null, null, null, null, null, null, null, null, null])}>{"New Game"}</button></div>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}