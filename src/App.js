import { useRef, useEffect, useState, useCallback } from 'react'
import impact from './impact.ogg'
import exit from './exit.ogg'
import collectables from './collectables.ogg'

const cellSize = 20
const userSize = 5
let cols, time, userX, userY
let positions = []
let score = 0
const cells = []
const stack = []
const userLoc = [[10, 10]]
const difficulty = [{time: 200, mode: 'Easy', size: 400}, {time: 100, mode: 'Medium', size: 600}, {time: 65, mode: 'Hard', size: 800}]


const App = () => {
  const [modeBtns, showModeBtns] = useState(false)
  const [mode, setMode] = useState({time: '----', mode: 'Easy', size: 400})
  const [timer, setTimer] = useState('')
  const [winLose, setWinLose] = useState('')
  const canvas = useRef(null)
  const camera = useRef(null)
  const wallSound = useRef(null)
  const exitSound = useRef(null)
  const collectableSound = useRef(null)
  let ctx, cameraCtx

  useEffect(() => {
    setup()
    // eslint-disable-next-line
  }, [mode])

  useEffect(() => {
    if(time > 0) {
      time--
      setTimeout(() => {
        setTimer(time)}, 1000) 
    }
      else if (time === 0) 
      { setWinLose('lose')}
  }, [timer])


  const setup = () => {
    ctx = canvas.current.getContext('2d')
    cameraCtx = camera.current.getContext('2d')
    canvas.current.width = canvas.current.height = mode.size
    camera.current.width = camera.current.height = mode.size
    canvas.current.style.left = camera.current.style.left = `${(window.innerWidth - mode.size)/2}px`
    cameraCtx.fillStyle = "black"
    cameraCtx.fillRect(0, 0, mode.size, mode.size)
    cells.splice(0, cells.length)
    stack.splice(0, stack.length)
    userX = 10
    userY = 10
    cols = canvas.current.width / cellSize
    createCells()
    checkRoutes()
    createMaze()
    setInterval(() => {
      createUser()
      setCamera()}, 25)
    createExit()
    createCollectibles()
  }

  const chooseMode = () => {
    showModeBtns(true)
  }


  const createCells = () => {
    for (let y = cellSize; y <= canvas.current.height; y += cellSize) {
      for (let x = cellSize; x <= canvas.current.width; x += cellSize) {
        cells.push({
          x: x,
          y: y,
          top: true,
          right: true,
          bottom: true,
          left: true,
          beenHere: false,
        })
      }
    }
  }
  
  const checkRoutes = () => {
    let current = cells[0]
    cells[0].beenHere = true
    while (cells.some((cell) => cell.beenHere === false)) {
      let top = cells[cells.indexOf(current) - cols]
      let right = cells[cells.indexOf(current) + 1]
      let bottom = cells[cells.indexOf(current) + cols]
      let left = cells[cells.indexOf(current) - 1]
      let direction = []
      if (top !== undefined && top.beenHere === false) direction.push(top)
      if (
        right !== undefined &&
        right.beenHere === false &&
        (cells.indexOf(current) + 1) % cols !== 0
      )
        direction.push(right)
      if (bottom !== undefined && bottom.beenHere === false)
        direction.push(bottom)
      if (
        left !== undefined &&
        left.beenHere === false &&
        cells.indexOf(current) % cols !== 0
      )
        direction.push(left)
      let index = Math.floor(Math.random() * direction.length)
      let difference = cells.indexOf(current) - cells.indexOf(direction[index])
      if (direction.length !== 0) {
        if (difference === 1) {
          current.left = false
          direction[index].right = false
        }
        if (difference === -1) {
          current.right = false
          direction[index].left = false
        }
        if (difference === cols) {
          current.top = false
          direction[index].bottom = false
        }
        if (difference === -cols) {
          current.bottom = false
          direction[index].top = false
        }
  
        stack.push(current)
        current = direction[index]
        current.beenHere = true
      } else {
        stack.pop()
        current = stack[stack.length -1]
      }
    }
  }
  
  const createMaze = () => {
    cells.forEach((cell) => {
      ctx.beginPath()
      ctx.moveTo(cell.x, cell.y)
      cell.bottom && ctx.lineTo(cell.x - cellSize, cell.y)
      ctx.moveTo(cell.x - cellSize, cell.y)
      cell.left && ctx.lineTo(cell.x - cellSize, cell.y - cellSize)
      ctx.moveTo(cell.x - cellSize, cell.y - cellSize)
      cell.top && ctx.lineTo(cell.x, cell.y - cellSize)
      ctx.moveTo(cell.x, cell.y - cellSize)
      cell.right && ctx.lineTo(cell.x, cell.y)
      ctx.strokeStyle = 'red'
      ctx.stroke()
    })
  }
  
  const createUser = () => {
    ctx.clearRect(userLoc[userLoc.length - 1][0] - userSize, userLoc[userLoc.length - 1][1] - userSize, userSize*2, userSize*2)
    
    userLoc.push([userX, userY])
    ctx.beginPath()
    ctx.arc(userX, userY, userSize, 0, Math.PI*2)
    ctx.fillStyle = "green"
    ctx.fill()
  }
  
  const createExit = () => {
    ctx.beginPath()
    ctx.arc(mode.size - 10, mode.size - 10, 5, 0, Math.PI*2)
    ctx.fillStyle = "red"
    ctx.fill()
  }

  const createCollectibles = () => {
    let firstArea = cells.filter(el => el.y >= mode.size -100 && el.x <= mode.size/2)
    let secondArea = cells.filter(el => el.y <  mode.size -100 && el.y > 100 && el.x <= mode.size)
    let thirdArea = cells.filter(el => el.y <= 100 && el.x >= mode.size/2)
    let first = firstArea[Math.floor(Math.random()*firstArea.length)]
    let second = secondArea[Math.floor(Math.random()*secondArea.length)]
    let third = thirdArea[Math.floor(Math.random()*thirdArea.length)]
    positions = [first, second, third]
    positions.forEach(el => {
      ctx.beginPath()
      ctx.arc(el.x -10,  el.y -10, 5, 0, Math.PI*2)
      ctx.fillStyle = "white"
      ctx.fill()
    })
  }


  const startGame = (size) => { 
    const mode = difficulty.filter(obj => obj.size === size)
    showModeBtns(false)
    setMode(...mode)
    time = mode[0].time
    setTimer(time)
    setControls()
  }


  const controls = useCallback((e) => {
    const [currentCell] = 
    (cells.filter(cell => userX + 10 === cell.x && userY + 10 === cell.y))
    e.keyCode === 37 || e.keyCode === 65 ? !currentCell.left ? userX -= 20 : wallSound.current.play() :
    e.keyCode === 38 || e.keyCode === 87 ? !currentCell.top ? userY -= 20 : wallSound.current.play() :
    e.keyCode === 39 || e.keyCode === 68 ? !currentCell.right ? userX += 20 : wallSound.current.play() :
    e.keyCode === 40 || e.keyCode === 83 ? !currentCell.bottom ? userY += 20 : wallSound.current.play() :
    alert('Please use Arrow or W A S D Keys')
    if (positions.some(el => el.x === userX + 10 && el.y === userY+10)) {
      positions = positions.filter(el => el.x !== userX + 10 && el.y !== userY + 10)
      collectableSound.current.play()
      time = time + 25
    }
    if(userX === mode.size -10 && userY === mode.size -10) {
      window.removeEventListener('keydown', controls)
      exitSound.current.play()
      score = time
      time = 0}
      
    // eslint-disable-next-line
  },[])


  const setControls = () => {    
      window.removeEventListener('keydown', controls)
      window.addEventListener('keydown', controls)
    }

    const setCamera = () => {
      cameraCtx.globalCompositeOperation = 'source-over'
      cameraCtx.fillStyle = "black"
      cameraCtx.fillRect(0, 0, mode.size, mode.size)
      cameraCtx.globalCompositeOperation = 'destination-out'
      cameraCtx.beginPath()
      cameraCtx.arc(userX, userY, userSize + 70, 0, Math.PI*2)
      cameraCtx.fill()
    }


  return (
    <>
    <h1>Hell Maze</h1>
    <ul style={{maxWidth: `${(window.innerWidth - mode.size)/2 - 10}px` }}>
      <li className='time'>Time: {timer}</li>
      <li className='score'>Score: {timer}</li>
      <br />
      <li className='user'>You Are The Green Dot</li>
      <li className='exit'>Reach The Hidden Red Dot To Exit The Maze And Win</li>
      <li className='collectables'>Collectables (+25 Time and Score) Are The White Dots</li>
      <li>Move with Arrow or W A S D Keys</li>
    </ul>
      <canvas ref={canvas} id='maze'></canvas>
      <canvas ref={camera} id='camera'></canvas>

      {!modeBtns && timer === '' && <button onClick={() => chooseMode()} className='play-btn'>Play</button>}
      {modeBtns && <div>
        {difficulty.map((el, index) => <button key={index} onClick={()=> {startGame(el.size)}} className='mode-btn'>{el.mode}</button>)}
      </div>}
      {(!modeBtns && timer === 0) && <div className='endGame'>
        <p>{winLose === 'lose' ? 'Game Over!' : 'You Win!'}</p>
        <p>Your Score: {score}<br />Your Time: {mode.time - score + 75 - positions.length*25}</p>
        <button onClick={() => {
          chooseMode()
          setup()}}>{winLose === 'lose' ? 'Try again' : 'Play Again'}</button>
      </div>}
      <audio ref={wallSound} src={impact}></audio>
      <audio ref={exitSound} src={exit}></audio>
      <audio ref={collectableSound} src={collectables}></audio>
    </>
  )
}

export default App
