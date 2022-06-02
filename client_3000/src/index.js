import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
const axios = require('axios');
const controlerURL = "http://localhost:4000"

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
      user: null
    };
  }

  getUpdate() {
    const leGame = this;

    axios.get(controlerURL + "/getUpdate")
    .then(function (response) {
      const newSquares = response.data; 
      // handle success
      leGame.setState({
        squares: newSquares,
      });
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });   
  }
  sendUpdate(newSquares) {
    axios.post(controlerURL + "/sendUpdate", {
      squares: newSquares
    });
  }

  handleClick(i) {
    // demander au controleur l'autorisation
    const leGame = this;
   axios.post(controlerURL, {
     user: this.state.user
   })
   .then(function (res) {
    const data = res.data;
    console.log(data);

    // faire les modifs en fonction
    const squares = leGame.state.squares.slice();
      
    if(data === "OK") {
       console.log("entered authorised");
       leGame.setState({
         squares: squares,
        });
        if (calculateWinner(squares) || squares[i]) {
         return;
         }
        squares[i] = leGame.state.user;

    // renvoyer le nouveau tableau
         leGame.sendUpdate(squares);
   }
  })
  .catch(function (error) {
    console.log(error);
  });
}

  
  
  render() {
    const winner = calculateWinner(this.state.squares);

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
          <div>{status}</div>
          <ul>
            <button onClick={(elt) => {elt.currentTarget.disabled = true;this.setState({user: "X"})}}>{"Joueur X"}</button>
          </ul>
          <ul>
            <button onClick={(elt) => {elt.currentTarget.disabled = true;this.setState({user: "O"})}}>{"Joueur O"}</button>
          </ul>
          <ul>
            <button onClick={() => this.getUpdate()}>{"Update"}</button>
          </ul>
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