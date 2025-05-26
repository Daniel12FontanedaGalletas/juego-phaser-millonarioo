// src/main.js
import PreloadScene from './scenes/PreloadScene.js';
import WelcomeScene from './scenes/WelcomeScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 700,
    parent: 'game-container',
    dom: {
        createContainer: true
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [PreloadScene, WelcomeScene, GameScene], 
    backgroundColor: '#333333' // Color de fondo por defecto del canvas
};

const game = new Phaser.Game(config);
console.log("Phaser Game instance created.");