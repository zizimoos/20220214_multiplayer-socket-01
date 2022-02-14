class Player {
  constructor({ id, x = 10, y = 10, w = 50, h = 50, color = "white", main }) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.speed = 10;
    this.xp = 0;
    this.id = id;
    this.color = color;
    this.isMoving = {};
    this.isMain = main;
  }

  draw(ctx) {
    if (this.isMoving.right) this.x += this.speed;
    if (this.isMoving.left) this.x -= this.speed;
    if (this.isMoving.up) this.y -= this.speed;
    if (this.isMoving.down) this.y += this.speed;

    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
  move(dir) {
    this.isMoving[dir] = true;
  }
  stop(dir) {
    this.isMoving[dir] = false;
  }
}

export default Player;
