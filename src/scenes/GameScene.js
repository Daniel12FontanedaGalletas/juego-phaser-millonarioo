// src/scenes/GameScene.js
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.currentMoney = 0;
        this.questions = [
            {
                id: 1,
                text: "¿Capital de Francia?",
                options: [
                    { text: "Berlín", isCorrect: false },
                    { text: "Madrid", isCorrect: false },
                    { text: "París", isCorrect: true },
                    { text: "Roma", isCorrect: false }
                ]
            },
            {
                id: 2,
                text: "¿Cuál es el río más largo del mundo?",
                options: [
                    { text: "Nilo", isCorrect: false },
                    { text: "Amazonas", isCorrect: true },
                    { text: "Misisipi", isCorrect: false },
                    { text: "Yangtsé", isCorrect: false }
                ]
            },
            {
                id: 3,
                text: "¿En qué año llegó el hombre a la luna?",
                options: [
                    { text: "1965", isCorrect: false },
                    { text: "1969", isCorrect: true },
                    { text: "1972", isCorrect: false },
                    { text: "1959", isCorrect: false }
                ]
            },
            {
                id: 4,
                text: "¿Cuántos lados tiene un hexágono?",
                options: [
                    { text: "Cinco", isCorrect: false },
                    { text: "Seis", isCorrect: true },
                    { text: "Siete", isCorrect: false },
                    { text: "Ocho", isCorrect: false }
                ]
            },
            {
                id: 5,
                text: "¿Cuál es el planeta más grande del sistema solar?",
                options: [
                    { text: "Tierra", isCorrect: false },
                    { text: "Marte", isCorrect: false },
                    { text: "Júpiter", isCorrect: true },
                    { text: "Saturno", isCorrect: false }
                ]
            }
        ];
        this.currentQuestionIndex = 0;
        this.optionElements = [];
        this.betInputs = [];
        this.feedbackGraphics = []; // Para guardar ticks y cruces
        this.confirmButton = null;
        this.continueButton = null; // Nuevo botón
        this.totalBetInfoText = null;
    }

    init(data) {
        this.currentMoney = data.initialMoney || 1000000;
        this.currentQuestionIndex = 0;
        // Limpiar cualquier feedback visual persistente si la escena se reinicia
        this.feedbackGraphics.forEach(graphic => graphic.destroy());
        this.feedbackGraphics = [];
    }

    create() {
        this.cameras.main.setBackgroundColor('#4A4A4A');

        this.moneyText = this.add.text(this.cameras.main.width - 20, 20, `Dinero: €${this.formatMoney(this.currentMoney)}`, {
            fontSize: '24px', fill: '#fff', fontFamily: 'Arial'
        }).setOrigin(1, 0);

        this.questionText = this.add.text(this.cameras.main.width / 2, 100, '', {
            fontSize: '28px', fill: '#fff', fontFamily: 'Arial', align: 'center', wordWrap: { width: this.cameras.main.width - 100 }
        }).setOrigin(0.5);

        this.totalBetInfoText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 150, '', {
            fontSize: '20px', fill: '#fff', fontFamily: 'Arial', align: 'center'
        }).setOrigin(0.5);

        // Botón de Confirmar Apuestas
        this.confirmButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 80, 'Confirmar Apuestas', {
            fontSize: '24px', fill: '#0f0', backgroundColor: '#555', padding: { x: 20, y: 10 }, fontFamily: 'Arial'
        })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.processBets())
        .on('pointerover', () => this.confirmButton.setStyle({ fill: '#fff' }))
        .on('pointerout', () => this.confirmButton.setStyle({ fill: '#0f0' }));

        // Botón de Continuar (inicialmente invisible)
        this.continueButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 80, 'Continuar', {
            fontSize: '24px', fill: '#0af', backgroundColor: '#555', padding: { x: 20, y: 10 }, fontFamily: 'Arial'
        })
        .setOrigin(0.5).setInteractive({ useHandCursor: true }).setVisible(false)
        .on('pointerdown', () => this.prepareNextQuestion())
        .on('pointerover', () => this.continueButton.setStyle({ fill: '#fff' }))
        .on('pointerout', () => this.continueButton.setStyle({ fill: '#0af' }));

        this.displayQuestion();
    }

    displayQuestion() {
        // Limpiar elementos de la pregunta anterior
        this.optionElements.forEach(element => {
            if (element.text) element.text.destroy();
            if (element.input) element.input.destroy();
        });
        this.feedbackGraphics.forEach(graphic => graphic.destroy()); // Limpiar ticks/cruces
        this.feedbackGraphics = [];
        this.optionElements = [];
        this.betInputs = [];

        this.updateTotalBetInfo(); // Limpia o actualiza el texto de información de apuesta

        if (this.currentQuestionIndex >= this.questions.length || this.currentMoney <= 0) {
            this.gameOver();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        this.questionText.setText(question.text);

        const optionStartY = 200;
        const optionSpacingY = 70;
        const optionStartX = this.cameras.main.width / 2 - 300; // Ajustar para dar espacio al tick/cruz

        question.options.forEach((option, index) => {
            const yPos = optionStartY + index * optionSpacingY;

            const optionLabel = this.add.text(optionStartX, yPos, `${String.fromCharCode(65 + index)}. ${option.text}`, {
                fontSize: '22px', fill: '#fff', fontFamily: 'Arial'
            }).setOrigin(0, 0.5);

            const betInput = this.add.dom(optionStartX + 450, yPos).createElement('input'); // Ajustar posición del input
            betInput.node.type = 'number';
            betInput.node.min = '0';
            betInput.node.placeholder = 'Apostar €';
            betInput.node.value = '0';
            betInput.node.classList.add('bet-input');
            betInput.node.addEventListener('input', () => this.updateTotalBetInfo());

            this.optionElements.push({ text: optionLabel, input: betInput, optionData: option });
            this.betInputs.push({ inputElement: betInput, optionData: option }); // Guardamos optionData aquí también
        });

        // Gestionar visibilidad de botones
        this.confirmButton.setVisible(true).setInteractive({ useHandCursor: true });
        this.continueButton.setVisible(false);
        this.totalBetInfoText.setVisible(true); // Mostrar información de apuesta

        this.updateTotalBetInfo();
    }

    updateTotalBetInfo() {
        if (!this.totalBetInfoText || !this.totalBetInfoText.active) return; // Si el texto ha sido destruido o no está activo

        let currentTotalBet = 0;
        this.betInputs.forEach(betInputItem => {
            if (betInputItem.inputElement.node) { // Verificar que el nodo exista
                 const value = parseInt(betInputItem.inputElement.node.value) || 0;
                 currentTotalBet += value;
            }
        });

        const remainingToBet = this.currentMoney - currentTotalBet;
        let infoText = `Total Apostado: €${this.formatMoney(currentTotalBet)}\n`;
        if (remainingToBet > 0) {
            infoText += `Debes apostar €${this.formatMoney(remainingToBet)} más.`;
        } else if (remainingToBet < 0) {
            infoText += `¡Has apostado €${this.formatMoney(Math.abs(remainingToBet))} de más!`;
        } else {
            infoText += `¡Todo apostado! Listo para confirmar.`;
        }
        this.totalBetInfoText.setText(infoText);

        if (this.confirmButton && this.confirmButton.active) {
            if (remainingToBet === 0 && currentTotalBet === this.currentMoney) {
                this.confirmButton.setAlpha(1).setInteractive({ useHandCursor: true });
            } else {
                this.confirmButton.setAlpha(0.5).disableInteractive();
            }
        }
    }

    processBets() {
        let totalBetOnThisQuestion = 0;
        let moneyOnCorrectAnswer = 0;
        let allBetsAreValid = true;

        this.betInputs.forEach(betInputItem => {
            const betAmount = parseInt(betInputItem.inputElement.node.value) || 0;
            if (betAmount < 0) {
                // No debería ocurrir, pero como validación
                allBetsAreValid = false;
                return;
            }
            totalBetOnThisQuestion += betAmount;
            if (betInputItem.optionData.isCorrect) {
                moneyOnCorrectAnswer = betAmount;
            }
        });

        if (!allBetsAreValid || totalBetOnThisQuestion !== this.currentMoney) {
            this.totalBetInfoText.setText(`Error: Debes apostar exactamente €${this.formatMoney(this.currentMoney)} sin valores negativos.`);
            // Mostrar un mensaje temporal de error si se desea, o simplemente confiar en que updateTotalBetInfo ya lo indica
            return;
        }

        this.currentMoney = moneyOnCorrectAnswer;
        this.moneyText.setText(`Dinero: €${this.formatMoney(this.currentMoney)}`);

        // Mostrar feedback visual (ticks y cruces)
        this.optionElements.forEach((element, index) => {
            const optionIsCorrect = element.optionData.isCorrect;
            const feedbackSymbol = optionIsCorrect ? '✔' : '✘';
            const feedbackColor = optionIsCorrect ? '#00ff00' : '#ff0000'; // Verde para correcto, Rojo para incorrecto
            
            // Posición del feedback visual (ej. al lado del texto de la opción)
            const feedbackX = element.text.x + element.text.width + 20; // Ajustar según sea necesario
            const feedbackY = element.text.y;

            const feedbackText = this.add.text(feedbackX, feedbackY, feedbackSymbol, {
                fontSize: '28px',
                fill: feedbackColor,
                fontFamily: 'Arial'
            }).setOrigin(0, 0.5);
            this.feedbackGraphics.push(feedbackText); // Guardar para limpiar después

            // Opcional: deshabilitar inputs después de confirmar
            if (element.input && element.input.node) {
                element.input.node.disabled = true;
            }
        });

        this.confirmButton.setVisible(false);
        this.continueButton.setVisible(true).setInteractive({useHandCursor: true});
        this.totalBetInfoText.setVisible(false); // Ocultar información de apuesta
    }

    prepareNextQuestion() {
        this.currentQuestionIndex++;
        this.displayQuestion(); // Esto limpiará los inputs y feedback de la pregunta anterior
    }

    gameOver() {
        this.questionText.setText('');
        this.optionElements.forEach(element => {
            if (element.text) element.text.destroy();
            if (element.input) element.input.destroy();
        });
        this.feedbackGraphics.forEach(graphic => graphic.destroy());
        this.feedbackGraphics = [];
        this.optionElements = [];
        this.betInputs = [];

        if (this.confirmButton) this.confirmButton.destroy();
        if (this.continueButton) this.continueButton.destroy();
        if (this.totalBetInfoText) this.totalBetInfoText.destroy(); // Destruir para evitar errores al reiniciar

        let gameOverMessage = "";
        if (this.currentMoney > 0 && this.currentQuestionIndex >= this.questions.length) {
            gameOverMessage = `¡Felicidades!\nHas terminado el juego con\n€${this.formatMoney(this.currentMoney)}`;
        } else {
            gameOverMessage = `¡Juego Terminado!\nTe has quedado sin dinero\no no hay más preguntas.`;
        }

        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, gameOverMessage, {
            fontSize: '32px', fill: '#fff', fontFamily: 'Arial', align: 'center', wordWrap: { width: this.cameras.main.width - 100 }
        }).setOrigin(0.5);

        const restartButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100, 'Volver al Inicio', {
            fontSize: '24px', fill: '#0f0', backgroundColor: '#555', padding: { x: 20, y: 10 }, fontFamily: 'Arial'
        })
        .setOrigin(0.5).setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.scene.start('WelcomeScene'); // Volver a la pantalla de bienvenida
        })
        .on('pointerover', () => restartButton.setStyle({ fill: '#fff' }))
        .on('pointerout', () => restartButton.setStyle({ fill: '#0f0' }));
    }

    formatMoney(amount) {
        return amount.toLocaleString('es-ES');
    }
}