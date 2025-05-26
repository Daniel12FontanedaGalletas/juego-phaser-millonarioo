import PreloadScene from './scenes/PreloadScene.js';
import GameScene from './scenes/GameScene.js';

const config = {
    type: Phaser.AUTO, // Phaser elegirá automáticamente si usar WebGL o Canvas
    width: 1000,        // Ancho del juego en píxeles
    height: 700,       // Alto del juego en píxeles
    parent: 'game-container', // ID del div en index.html donde se creará el canvas
    dom: {
        createContainer: true // Necesario para usar elementos DOM (como inputs) en Phaser
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }, // Sin gravedad para este tipo de juego
            debug: false
        }
    },
    scene: [PreloadScene, GameScene], // Array de escenas a cargar
    backgroundColor: '#333333'
};

const game = new Phaser.Game(config);