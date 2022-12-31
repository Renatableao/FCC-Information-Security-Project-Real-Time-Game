class Collectible {
  constructor({x, y, w, h, value, id}) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.value = value;
    this.id = id;
  }

  draw(context,img) {
    context.drawImage(img, this.x - (this.w/2), this.y- (this.h/2), this.w, this.h);
  }

  
}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
