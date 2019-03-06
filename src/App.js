import React, { Component} from "react";
import "./App.css";

const width = 30
const height = 20
const bombs = 1

class App extends Component{

  constructor() {
    super()
    this.fields = []
    this.bombs = []
    this.clicked = []
    this.firstClick = true
    this.gameRunning = true
    this.restartBtn
    this.box
    this.timer
  }

  restart() {
    this.fields = []
    this.bombs = []
    this.clicked = []
    this.firstClick = true
    this.gameRunning = true
    window.location.reload(); 
  }

  arrayRemove(arr, value) {
    return arr.filter(function(ele){
        return ele != value;
    });
 }

  handleClick(index, flag, intern) {
    if (this.gameRunning && this.fields[index] && index >= 0) {
      if (this.firstClick) {
        for (var y = 0; y < bombs; y++) this.setBomb(0, width*height, index)
        this.firstClick = false
        new Promise(() => {
          this.startTimer()
        })
      }
      if (intern) this.fields[index].className = this.fields[index].className.replace(" Flagged", '');
      if (!this.fields[index].className.includes('Revealed') && flag) {
        if (this.fields[index].className.includes('Flagged')) {
          this.fields[index].src = `images/field.png`
          this.fields[index].className = this.fields[index].className.replace(" Flagged", '');
          this.arrayRemove(this.clicked, index)
        } else {
          this.fields[index].src = `images/flag.png`
          this.fields[index].className += " Flagged"
          this.clicked.push(index)
        }
      } else if (this.bombs.includes(index) && !this.fields[index].className.includes('Flagged')) {
        this.showBombs()
        this.gameRunning = false
        this.restartBtn.style.opacity = "1"
      } else if(!this.fields[index].className.includes('Revealed') && !this.fields[index].className.includes('Flagged')) {
        this.clicked.push(index)
        const count = this.countBombs(index)
        this.fields[index].src = `images/numeric-${count}-box.png`
        this.fields[index].className += " Revealed"
        if (count === 0) {
          const {i, x} = this.getPos(index)
          this.handleClick(this.getIndex(i-1, x-1, false, true))
          this.handleClick(this.getIndex(i-1, x, false, true))
          this.handleClick(this.getIndex(i-1, x+1, false, true))
          this.handleClick(this.getIndex(i, x-1, false, true))
          this.handleClick(this.getIndex(i, x+1, false, true))
          this.handleClick(this.getIndex(i+1, x-1, false, true))
          this.handleClick(this.getIndex(i+1, x, false, true))
          this.handleClick(this.getIndex(i+1, x+1, false, true))
        }
      }
      if (this.clicked.length === this.fields.length) this.win()
    }
  }

  win() {
    this.gameRunning = false
  }

  countBombs(index) {
    const {i, x} = this.getPos(index)
    let count = 0;
    if (this.bombs.includes(this.getIndex(i-1, x-1))) count++
    if (this.bombs.includes(this.getIndex(i-1, x))) count++
    if (this.bombs.includes(this.getIndex(i-1, x+1))) count++
    if (this.bombs.includes(this.getIndex(i, x-1))) count++
    if (this.bombs.includes(this.getIndex(i, x+1))) count++
    if (this.bombs.includes(this.getIndex(i+1, x-1))) count++
    if (this.bombs.includes(this.getIndex(i+1, x))) count++
    if (this.bombs.includes(this.getIndex(i+1, x+1))) count++
    return count
  }

  getPos(index) {
    const i = Math.floor(index/width);
    const x = index+width-width*Math.floor(index/width+1);
    return {i, x}
  }

  getIndex(i, x, debug) {
    try {
      if (x < 0 || x >= width || i < 0 || i >= height) return null
      return i*width+x >= 0 ? i*width+x : null 
    } catch(e) {
      return null
    }
  }

  showBombs() {
    this.fields.forEach((item, index) => {
      if (this.bombs.includes(index)) {
        if (item.className.includes('Flagged')) {
          this.fields[index].src = "images/flag-correct.png"
        } else {
          this.fields[index].src = "images/bomb.png"
        }
      }
    })
  }

  renderField() {
    const field = []
    for (var i = 0; i < height; i++) {
      const row = []
      for (var x = 0; x < width; x++) {
        const index = i*width+x
        row[x] = <img
          src="images/field.png"
          className="Field"
          onContextMenu={e => {
            e.preventDefault();
            this.handleClick(index, true);
          }}
          onClick={() => this.handleClick(index)}
          ref={field => this.fields[index] = field} />
      }
      field[i] = [<div className="Row">
        {row}
      </div>, <br/>]
    }
    return field
  }

  setBomb(from, to,  currentIndex) {
    const random = Math.floor(Math.random() * (to - from)) + from
    const {i, x} = this.getPos(currentIndex)
    const freeFields = []
    if (width*height-bombs > 9) {
      freeFields.push(this.getIndex(i-1, x-1));
      freeFields.push(this.getIndex(i-1, x));
      freeFields.push(this.getIndex(i-1, x+1));
      freeFields.push(this.getIndex(i, x-1));
      freeFields.push(this.getIndex(i, x+1));
      freeFields.push(this.getIndex(i+1, x-1));
      freeFields.push(this.getIndex(i+1, x));
      freeFields.push(this.getIndex(i+1, x+1));
    }
    if (!this.bombs.includes(random) && currentIndex != random && !freeFields.includes(random)) {
      this.bombs.push(random)
    } else {
      this.setBomb(from, to, currentIndex)
    }
  }

  startTimer() {
    this.timer.innerHTML = Number(this.timer.innerHTML)+1
    setTimeout(() => {
      if (this.gameRunning)
        this.startTimer();
    }, 1000)
  }

  componentDidMount() {
    if (this.gameRunning) this.restartBtn.style.opacity = "0"
    this.box.style.width = `${width*36}px`
    this.box.style.height = `${height*36+30}px`
    this.restartBtn.style.height = `${30}px`
  }

  render(){
    return(
      <div className="App">
        <center>
          <div ref={box => this.box = box}>
            {this.renderField()}
            <button onClick={() => this.restart()} ref={btn => this.restartBtn = btn}>Restart</button>
            <h1 ref={h => this.timer = h}>0</h1>
          </div>
        </center>
      </div>
    );
  }
}

export default App;