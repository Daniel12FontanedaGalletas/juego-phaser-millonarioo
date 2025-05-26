// src/scenes/WelcomeScene.js
export default class WelcomeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'WelcomeScene' });
    }

    preload() {
        // Opcional: Cargar assets específicos para la pantalla de bienvenida si los tuvieras
        // this.load.image('logo', 'assets/logo.png');
    }

    create() {
        this.cameras.main.setBackgroundColor('#003366'); // Un color de fondo para la bienvenida

        // Título del Juego
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 100, 'Millonario Interactivo', {
            fontSize: '48px',
            fill: '#fff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);

        // Botón de Empezar Juego
        const startButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, 'Empezar Juego', {
            fontSize: '32px',
            fill: '#0f0',
            backgroundColor: '#555',
            padding: { x: 20, y: 10 },
            fontFamily: 'Arial'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });

        startButton.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 0, 0, 0, (camera, progress) => {
                if (progress === 1) {
                    this.scene.start('GameScene', { initialMoney: 1000000 });
                }
            });
        });

        startButton.on('pointerover', () => {
            startButton.setStyle({ fill: '#fff', backgroundColor: '#777' });
        });

        startButton.on('pointerout', () => {
            startButton.setStyle({ fill: '#0f0', backgroundColor: '#555' });
        });

        // Animación de entrada suave para el botón (opcional)
        this.tweens.add({
            targets: startButton,
            alpha: { from: 0, to: 1 },
            y: `+=${20}`, // Moverlo un poco hacia abajo
            ease: 'Power1',
            duration: 1000,
            delay: 300
        });
    }
}