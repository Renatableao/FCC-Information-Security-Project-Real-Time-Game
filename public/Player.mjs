import { dimension } from './dimension.mjs';

class Player {
  constructor({x, y, w, h, score, id}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.score = score;
    this.id = id;
    
  }

  movePlayer(dir, speed) {
    switch(dir) {
      case dir = "right":
        this.x = Math.min(dimension.maxX - (this.w/2), this.x + speed);
        break;
      case dir = "left":
        this.x = Math.max(dimension.minX + (this.w/2), this.x - speed)
        break;
      case dir = "up":
        this.y  = Math.max(dimension.minY + (this.h/2), this.y - speed);
        break;
      case dir = "down":
        this.y  = Math.min(dimension.maxY - (this.h/2), this.y + speed);
        break;
    }
  }

  collision(item) {
    if (
      this.x < item.x + item.w &&
      this.x + this.w > item.x &&
      this.y < item.y + item.h &&
      this.h + this.y > item.y ) {
      // Collision detected!
      return true;
    } 
    else {
      // No collision
      return false;
    }
  }

  draw(context, img){
    context.drawImage(img, this.x-(this.w/2), this.y - (this.h/2), this.w, this.h);
  }
    
  calculateRank(arr) {
    arr.sort((a, b) =>  b.score - a.score)
    let position = 0
    arr.forEach((player, index) => {
      if(this.id === player.id) {
        position = index+1;
    }});
    return "Rank:" + position + "/" + arr.length
  }  

  

  getScore(arr) {
    let score;
    arr.forEach((player, index) => {
      if(this.id === player.id) {
        score = player.score
    }});

    return "Score:" + score
  }

   

  }




/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Player;
} catch(e) {}


export default Player;
