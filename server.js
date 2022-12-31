require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//For FCC testing purposes and enables user to connect from outside the hosting platform
app.use(cors({origin: '*'})); 

// helmet
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});


const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

// Socket.io setup:
const Player = require('./public/Player');
const Collectible = require('./public/Collectible');
const {dimension} = require('./public/dimension');
let count = 40000


const random = (min, max) => { 
    return Math.floor(Math.random() * (max - min + 1)) + min;
} 

const getRandomPosition = () => {
  let x = random(dimension.minX+50, dimension.maxX-50);
  let y = random(dimension.minY+50, dimension.maxY-50);
  //x = Math.floor(x/10) * 10;
  //y = Math.floor(y/10) * 10;

   return [x,y];
}
  
let playersList = [];
let [fruitX,fruitY] = getRandomPosition();
let fruit = new Collectible({x:fruitX,y:fruitY, w:40, h:35, value:1,id:Date.now()})

let connections = [];


const io = socket(server);
io.sockets.on('connection', socket => {
  console.log(`New connection ${socket.id}`);
  connections.push(socket);
  console.log('Connected: %s sockets connected.',connections.length);

  let [positionX,positionY] = getRandomPosition();
  let player = new Player({x:positionX,y:positionY, w: 70, h: 60, score:0,id:socket.id});

  playersList.push(player)

  socket.emit('init', {id: socket.id, players: playersList, fruit: fruit});
  
  socket.on('update', (updatedUser) => {
      playersList.forEach(user => {
          if(user.id === socket.id){
              user.x = updatedUser.x;
              user.y = updatedUser.y;
              user.score = updatedUser.score;
              user.w = updatedUser.w;
              user.h = updatedUser.h;
          }
      });
      io.emit('update', {players: playersList, fruit:fruit, player: null});
  });


  socket.on('disconnect', () => {
    console.log(`deconnection ${socket.id}`);
    socket.broadcast.emit('remove-player', socket.id);
    connections.splice(connections.indexOf(socket), 1);
    playersList = playersList.filter(player => player.id !== socket.id);
    console.log('Disconnected: %s sockets connected.', connections.length);
  });
});


setInterval(tick, 1); 
function tick() {
    
    let playerUpdate = null
    count -= 1;

    if (count === 0) {
      playersList.forEach(player => {
        let [positionX,positionY] = getRandomPosition();
        player.x = positionX;
        player.y = positionY;
        player.score = 0;
        player.w = 70;
        player.h = 60;
        playerUpdate = player
        count = 40000
        
        })    
    }

    playersList.forEach(player => {
      let p = new Player(player);
      if (p.collision(fruit)) {
        player.score += 1;
        
        let [fruitX,fruitY] = getRandomPosition();
        fruit = new Collectible({x:fruitX,y:fruitY,w: 40, h: 35, value:1, id:Date.now()})
        playerUpdate = player;
      }
    })


    io.emit('update', {
      players: playersList,
      fruit: fruit,
      player: playerUpdate
    });


}




module.exports = app; // For testing
