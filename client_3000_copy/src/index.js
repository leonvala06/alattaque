import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
const AXIOS = require('axios');
const URL_TO_SERVER = "http://localhost:3000";

var interval = null;
const REFRENSHING_RATE = 1000;

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
      xIsNext: null,
      issue: null,
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
  };

  setIssue(issue) {
    this.setState({
      issue: issue
    });
  };


  getUpdate(leGame) {
    console.log("Getting update");
    AXIOS.get(URL_TO_SERVER + "/getupdate")
    .then(response => {
      console.log(response.data);
      const newSquares = response.data.newSquares;
      const xTurn = response.data.xIsNext;
      const newIssue = response.data.issue;
      
      leGame.setSquares(newSquares);
      leGame.setXturn(xTurn);
      leGame.setIssue(newIssue);

      if (newIssue) {
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
      squares: newSquares,
      selectedSquare: i,
      user: leGame.state.user
    })
    .then(response => {
      console.log("Post reçu");
    });
  }

  handleClick(i, squares) {
      this.sendUpdate(squares, i);
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
    const winner = this.state.issue;

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
              this.handleClick(i, this.state.squares);
            }
            }
          />
        </div>
        <div className="game-info">
        <div>{player}</div>
          <div>{status}</div>
          <div>{joueur}</div>
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);