// src/scenes/WelcomeScene.js
export default class WelcomeScene extends Phaser.Scene {
    constructor() { super({ key: 'WelcomeScene' }); }

    create() {
        console.log("WelcomeScene: create() STARTS");

        // 1. Fondos en Capas y Cursor (como en la versión anterior)
        let bgLayer1 = this.add.image(0, 0, 'backgroundLayer1').setOrigin(0,0);
        bgLayer1.displayWidth = this.cameras.main.width; bgLayer1.displayHeight = this.cameras.main.height;
        let bgLayer2 = this.add.image(0, 0, 'backgroundLayer2').setOrigin(0,0);
        bgLayer2.displayWidth = this.cameras.main.width; bgLayer2.displayHeight = this.cameras.main.height;
        try { this.input.setDefaultCursor(`url(assets/PNG/cursorGauntlet_grey.png) 8 8, auto`); } catch (e) { console.error(e); }

        // 3. Título del Juego (tamaño de fuente original)
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 3, 'Millonario Phaser', {
            fontFamily: '"Montserrat", Arial, sans-serif',
            fontSize: '64px', // <--- TAMAÑO DE FUENTE RESTAURADO A GRANDE
            fill: '#FFFFFF',
            align: 'center',
            stroke: '#000000',
            strokeThickness: 6,
            shadow: { offsetX: 3, offsetY: 3, color: '#000000', blur: 5, stroke: true, fill: true }
        }).setOrigin(0.5);

        const buttonX = this.cameras.main.width / 2;
        const buttonY = this.cameras.main.height / 2 + 120; // Un poco más abajo para el título grande

        const startButtonImg = this.add.image(buttonX, buttonY, 'uiButtonSquareBlue')
            .setInteractive({ useHandCursor: false })
            .setOrigin(0.5);
        
        // === AJUSTES PARA BOTÓN MÁS GRANDE ===
        const baseScaleButtonStart = 1.5; // <--- AUMENTO SIGNIFICATIVO DE ESCALA BASE
        const widthMultiplierStart = 1.5; // <--- MANTENEMOS O AJUSTAMOS EL ANCHO EXTRA
        
        startButtonImg.setScale(baseScaleButtonStart);
        startButtonImg.displayWidth = (startButtonImg.width * baseScaleButtonStart) * widthMultiplierStart; // Ancho relativo a la imagen original escalada

        const startButtonText = this.add.text(buttonX, buttonY, 'Empezar Juego', {
            fontFamily: '"Roboto", Arial, sans-serif',
            fontSize: '30px', // <--- TAMAÑO DE FUENTE AUMENTADO PARA EL BOTÓN MÁS GRANDE
            fill: '#FFFFFF',
            align: 'center'
        }).setOrigin(0.5);

        // Ajuste final de texto si se desborda (opcional, depende de tu imagen de botón)
        if (startButtonText.width > startButtonImg.displayWidth * 0.9) {
            const newFontSize = Math.floor(parseFloat(startButtonText.style.fontSize) * ( (startButtonImg.displayWidth * 0.9) / startButtonText.width ) );
            startButtonText.setFontSize(newFontSize + 'px');
        }


        // Efectos del botón (ajustados para el nuevo displayWidth)
        startButtonImg.on('pointerdown', () => {
            this.cameras.main.fadeOut(500, 20, 20, 20, (camera, progress) => {
                if (progress === 1) this.scene.start('GameScene', { initialMoney: 1000000 });
            });
        });

        const hoverEffectScaleStart = 1.05; 
        startButtonImg.on('pointerover', () => {
            startButtonImg.setTint(0xDDDDDD);
            startButtonImg.setScale(baseScaleButtonStart * hoverEffectScaleStart);
            startButtonImg.displayWidth = (startButtonImg.width * baseScaleButtonStart * hoverEffectScaleStart) * widthMultiplierStart;
        });

        startButtonImg.on('pointerout', () => {
            startButtonImg.clearTint();
            startButtonImg.setScale(baseScaleButtonStart);
            startButtonImg.displayWidth = (startButtonImg.width * baseScaleButtonStart) * widthMultiplierStart;
        });

        // Animación de entrada
        const finalScaleYStart = startButtonImg.scaleY;
        const finalDisplayWidthStart = startButtonImg.displayWidth;

        startButtonImg.setAlpha(0).setScale(baseScaleButtonStart * 0.7);
        startButtonImg.displayWidth = (startButtonImg.width * baseScaleButtonStart * 0.7) * widthMultiplierStart;
        startButtonText.setAlpha(0);
        
        this.tweens.add({
            targets: startButtonImg,
            alpha: 1,
            scaleY: finalScaleYStart,
            displayWidth: finalDisplayWidthStart,
            ease: 'Back.easeOut',
            duration: 800,
            delay: 500
        });
        this.tweens.add({
            targets: startButtonText,
            alpha: 1,
            ease: 'Power1',
            duration: 800,
            delay: 500
        });
        console.log("WelcomeScene: create() ENDS");
    }
}