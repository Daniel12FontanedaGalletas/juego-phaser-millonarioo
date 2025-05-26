// src/scenes/PreloadScene.js
export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({ key: 'PreloadScene' });
    }

    preload() {
        // Aquí cargarías tus assets
        // Ejemplo: this.load.image('background', 'assets/background.png');
        // Ejemplo: this.load.audio('correctSound', 'assets/correct.mp3');
        console.log("PreloadScene: Preloading assets...");

        // Barra de carga simple (opcional)
        let progressBar = this.add.graphics();
        let progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(this.cameras.main.width / 2 - 160, this.cameras.main.height / 2 - 25, 320, 50);

        this.load.on('progress', function (value) {
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(this.cameras.main.width / 2 - 150, this.cameras.main.height / 2 - 15, 300 * value, 30);
        }, this);

        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            console.log("PreloadScene: Assets loaded, starting GameScene.");
            this.scene.start('GameScene', { initialMoney: 1000000 }); // Pasa el dinero inicial a GameScene
        }, this);

        // Simula carga si no hay assets
        // this.load.image('placeholder', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=');
    }

    create() {
        // No es necesario hacer nada aquí si 'complete' maneja el cambio de escena
    }
}