// src/main.js
import PreloadScene from './scenes/PreloadScene.js';
import WelcomeScene from './scenes/WelcomeScene.js'; // Importar la nueva escena
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
    // PreloadScene será la primera, luego WelcomeScene, luego GameScene
    scene: [PreloadScene, WelcomeScene, GameScene], 
    backgroundColor: '#333333'
};

const game = new Phaser.Game(config);