/* global Phaser */

/*
 * This class is the Game Scene.
 **/
class GameScene extends Phaser.Scene {
  constructor() {
      super({ key: "gameScene" });
      this.player = null;
      this.score = 0;
      this.lives = 3; // Initialize lives to 3
      this.scoreText = null;
      this.livesText = null; // Text object for displaying lives
      this.scoreTextStyle = {
          font: "65px Arial",
          fill: "#ffffff",
          align: "center"
      };
      this.gameOverTextStyle = {
          font: "65px Arial",
          fill: "#ff0000",
          align: "center"
      };
  }

  init(data) {
      this.cameras.main.setBackgroundColor("#0x5f6e7a");
  }

  preload() {
      console.log("GameScene");

      // images
      this.load.image("spaceBackground", "image/spaceBackground.png");
      this.load.image("player", "image/spaceShip.png");
      this.load.image("star", "image/star.png");
      this.load.image("stone", "image/stone.png");
  }

  create(data) {
      this.background = this.add.image(0, 0, "spaceBackground").setScale(2.0);
      this.background.setOrigin(0, 0);

      this.scoreText = this.add.text(
          10,
          10,
          "Score: " + this.score.toString(),
          this.scoreTextStyle
      );

      // Create lives text
      this.livesText = this.add.text(
          this.cameras.main.width - 10,
          10,
          "Lives: " + this.lives.toString(),
          this.scoreTextStyle
      );
      this.livesText.setOrigin(1, 0);

      this.player = this.physics.add.sprite(1920 / 2, 1080 - 100, "player");

      // create a group for stones
      this.stoneGroup = this.add.group();
      this.createStone(1);
      this.createStone(2);
      this.createStone(3);
      this.createStone(4);
      this.createStone(5);
      this.createStone(6);

      // create a group for stars
      this.starGroup = this.physics.add.group();
      this.spawnStar();
      this.spawnStar();
      this.spawnStar();

      // Collision between player and star
      this.physics.add.overlap(
          this.player,
          this.starGroup,
          (playerCollide, starCollide) => {
              starCollide.destroy();
              this.score += 1;
              this.scoreText.setText("Score: " + this.score.toString());
              this.spawnStar();

          }
      );

      // Collision between player and stone
      this.physics.add.collider(
          this.player,
          this.stoneGroup,
          (playerCollide, stoneCollide) => {
              stoneCollide.destroy();
              playerCollide.setTint(0xff0000);

              this.lives--;
              this.livesText.setText("Lives: " + this.lives.toString());

              if (this.lives <= 0) {
                  this.gameOver();
              } else {
                  this.time.delayedCall(1000, () => {
                      playerCollide.clearTint();
                  });
              }
          }
      );
  }

  update(time, delta) {
      const keyAObj = this.input.keyboard.addKey("A");
      const keyDObj = this.input.keyboard.addKey("D");
      const keyWObj = this.input.keyboard.addKey("W");
      const keySObj = this.input.keyboard.addKey("S");

      const rotationSpeed = 0.08; // Adjust this value to control the rotation speed
      const moveSpeed = 5; // Adjust this value to control the movement speed

      if (keyAObj.isDown) {
          this.player.x -= moveSpeed; // Move left
          this.player.rotation = -rotationSpeed; // Rotate left slightly
      } else if (keyDObj.isDown) {
          this.player.x += moveSpeed; // Move right
          this.player.rotation = rotationSpeed; // Rotate right slightly
      } else {
          this.player.rotation = 0; // Reset rotation when no rotation keys are pressed
      }

      if (keyWObj.isDown) {
          this.player.y -= moveSpeed; // Move up
      } else if (keySObj.isDown) {
          this.player.y += moveSpeed; // Move down
      }

      // Limit the players bounds to the game screen
      const minX = this.player.width / 2;
      const maxX = this.cameras.main.width - this.player.width / 2;
      this.player.x = Phaser.Math.Clamp(this.player.x, minX, maxX);
      const minY = this.player.height / 2;
      const maxY = this.cameras.main.height - this.player.height / 2;
      this.player.y = Phaser.Math.Clamp(this.player.y, minY, maxY);
  }

  createStone(stoneType) {
      const centerX = this.cameras.main.width / 2;
      const centerY = this.cameras.main.height / 2;
      const minDistance = 300; // Minimum distance between stones
      const playerSafeDistance = 200; // Minimum distance between the player and a spawned stone

      let stoneXLocation, stoneYLocation;
      let isOverlapping = true;

      // Keep generating random coordinates until a non-overlapping position is found
      while (isOverlapping) {
          stoneXLocation = Phaser.Math.FloatBetween(centerX - 400, centerX + 400);
          stoneYLocation = Phaser.Math.FloatBetween(centerY - 400, centerY + 400);

          // Calculate the distance between the stone and the player
          const distanceToPlayer = Phaser.Math.Distance.Between(
              this.player.x,
              this.player.y,
              stoneXLocation,
              stoneYLocation
          );

          // Check if the stone is too close to the player
          if (distanceToPlayer > playerSafeDistance) {
              // Check if the stone overlaps with other stones
              isOverlapping = this.checkStoneOverlap(stoneXLocation, stoneYLocation, minDistance);
          }
      }

      const stone = this.physics.add.sprite(stoneXLocation, stoneYLocation, "stone");
      stone.moveSpeed = Phaser.Math.FloatBetween(2, 6); // Set a random move speed for the stone

      stone.setCollideWorldBounds(true);
      stone.setBounce(1, 1);
      stone.setImmovable(true);

      this.stoneGroup.add(stone);
  }

  checkStoneOverlap(x, y, minDistance) {
      const stones = this.stoneGroup.getChildren();

      for (let counter = 0; counter < stones.length; counter++) {
          const stone = stones[counter];
          const distance = Phaser.Math.Distance.Between(x, y, stone.x, stone.y);

          if (distance < minDistance) {
              return true; // Overlapping stones found
          }
      }

      return false; // No overlapping stones found
  }

  spawnStar() {
      const starXLocation = Phaser.Math.Between(100, this.cameras.main.width - 100);
      const starYLocation = Phaser.Math.Between(100, this.cameras.main.height - 100);
      const star = this.starGroup.create(starXLocation, starYLocation, "star");
      star.setCollideWorldBounds(true);
      star.setBounce(1, 1);
  }

  gameOver() {
      this.physics.pause();
      this.gameOverTextStyle = this.add
          .text(1920 / 2, 1080 / 2, "GAME OVER click to restart", this.gameOverTextStyle)
          .setOrigin(0.5);
      this.gameOverTextStyle.setInteractive({ useHandCursor: true });
      this.gameOverTextStyle.on("pointerdown", () => this.scene.start("gameScene"));
  }
}

export default GameScene;
