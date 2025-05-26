// src/scenes/PreloadScene.js
export default class PreloadScene extends Phaser.Scene {
    constructor() { super({ key: 'PreloadScene' }); }

    preload() {
        // ... (barra de carga como la tenías) ...
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);
        let loadingText = this.make.text({ x: width / 2, y: height / 2 - 50, text: 'Cargando...', style: { font: '20px Montserrat', fill: '#ffffff' } }).setOrigin(0.5, 0.5);
        let percentText = this.make.text({ x: width / 2, y: height / 2, text: '0%', style: { font: '18px Montserrat', fill: '#ffffff' } }).setOrigin(0.5, 0.5);
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear(); progressBar.fillStyle(0x007bff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });
        this.load.on('complete', function () {
            progressBar.destroy(); progressBox.destroy(); loadingText.destroy(); percentText.destroy();
            this.scene.start('WelcomeScene');
        }, this);

        // === FONDOS ===
        this.load.image('backgroundLayer1', 'assets/background 2/1.png');
        this.load.image('backgroundLayer2', 'assets/background 2/2.png');

        // === PANEL DE PREGUNTAS ===
        this.load.image('newQuestionPanelImage', 'assets/PNG/buttonLong_brown_pressed.png');

        // === BOTÓN PRINCIPAL (el que estiraremos) ===
        this.load.image('uiButtonSquareBlue', 'assets/PNG/buttonSquare_blue.png'); 

        // === CURSOR ===
        this.load.image('cursorGauntlet', 'assets/PNG/cursorGauntlet_grey.png');
        
        // NO CARGAMOS iconTick ni iconCross de imagen, usaremos texto.
    }
    create() { /* ... */ }
}