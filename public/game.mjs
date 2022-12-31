import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import { dimension } from './dimension.mjs';


const socket = io();

let tick;
let playersList = [];
let fruitEntity;
let playerEntity;

const canvas = document.getElementById('game-window');
const context = canvas.getContext('2d');

let imgs = [];
let imgsSrc = ['public/img/monkey.png', 'public/img/monkey2.png', 'public/img/banana.png'];


const init = () => {

   // get images
  for (const i in imgsSrc) {
    imgs.push(new Image());
    imgs[i].src = imgsSrc[i];
  }
 
  
   socket.on('init', ({ id, players, fruit }) => {
    console.log(id, players,fruit);
    fruitEntity = new Collectible(fruit);
    playerEntity = players.filter(x => x.id === id)[0];
    playerEntity = new Player(playerEntity);
  
    playersList = players

     document.onkeydown = e => {
      let  dir = null
      switch(e.keyCode) {
        case 87:
        case 38:
           dir = 'up';
           break;
        case 83:
        case 40:
           dir = 'down';
           break;
        case 65:
        case 37:
           dir = 'left';
           break;
        case 68:
        case 39:
           dir = 'right';
           break;   
      }
      if (dir) {
        playerEntity.movePlayer(dir, 20);
        socket.emit('update', playerEntity);
      }
    }

    // update
    socket.on('update', ({players:players,fruit:fruit,player:player}) => {
      playersList = players;
      fruitEntity = new Collectible(fruit)
      if (player) {
        if (player.id === playerEntity.id) {
          playerEntity= new Player(player);
        }
      }
    })
   })

  window.requestAnimationFrame(update); 
}

const update = () => {

  context.beginPath()
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Set background color
  context.fillStyle = 'black';
  context.fillRect(0, 0, canvas.width, canvas.height);

  // Create border for play field
  context.strokeStyle = 'white';
  context.strokeRect(dimension.minX, dimension.minY, dimension.arenaSizeX, dimension.arenaSizeY);

  // Controls text
  context.fillStyle = 'white';
  context.font = `18px 'Modak'`;
  context.textAlign = 'center';
  context.fillText('Controls: WASD', 90, 35);
  

  // Game title
  context.font = `35px 'Modak'`;
  context.fillText('Snack time', 300, 40);

  context.closePath()

  if (playerEntity) {
    playerEntity.draw(context, imgs[0]);
    context.font = `20px 'Modak'`;
    context.fillText(playerEntity.getScore(playersList), 500, 35);
    context.font = `18px 'Modak'`;
    context.fillText(playerEntity.calculateRank(playersList), 580, 35);

    playersList.forEach((player)=> {
       if (player.id !== playerEntity.id) {
         let p = new Player(player);
         p.draw(context, imgs[1]);
       }
    });
    if (fruitEntity) {
      fruitEntity.draw(context,imgs[2]);
    }
  }

 
tick = requestAnimationFrame(update);
}
init()