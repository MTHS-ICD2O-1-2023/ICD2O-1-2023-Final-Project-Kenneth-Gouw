
/* global Phaser */
//
// Created by: Kenneth Gouw
// Created on: June 2023

// scene import statements
import MenuScene from "./menuScene.js"
import GameScene from "./level1.js"


// create the new scenes
const menuScene = new MenuScene()
const gameScene = new GameScene()


const config = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  //set background color
  backgroundColor: 0xffffff,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    scene: [ gameScene, ]
  },
}
const game = new Phaser.Game(config)

//load scenes
// NOTE: remember any 'key' is global an cannot be reused
game.scene.add("menuScene", menuScene)
game.scene.add("gameScene", gameScene)


// start title
game.scene.start("menuScene")
