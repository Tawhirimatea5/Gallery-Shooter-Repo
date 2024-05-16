"use strict"

var config = {
    type: Phaser.AUTO,
    width: 1333,
    height: 750,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [SpaceInvaders]
};

const game = new Phaser.Game(config);