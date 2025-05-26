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
                    { text: "Nilo", isCorrect: false }, // Amazonas es considerado el más largo actualmente por muchos geógrafos
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
            }
            // Añade más preguntas aquí
        ];
        this.currentQuestionIndex = 0;
        this.optionElements = []; // Para guardar referencias a los elementos de las opciones (texto e inputs)
        this.betInputs = []; // Para guardar referencias a los inputs de apuesta
        this.confirmButton = null;
        this.totalBetText = null; // Para mostrar la suma de las apuestas actuales
    }

    init(data) {
        this.currentMoney = data.initialMoney || 1000000; // Recibe el dinero inicial o usa un valor por defecto
        this.currentQuestionIndex = 0; // Reinicia el índice de pregunta si la escena se reinicia
    }

    create() {
        this.cameras.main.setBackgroundColor('#4A4A4A'); // Un color de fondo un poco más claro

        // Mostrar dinero actual
        this.moneyText = this.add.text(this.cameras.main.width - 20, 20, `Dinero: €${this.formatMoney(this.currentMoney)}`, {
            fontSize: '24px',
            fill: '#fff',
            fontFamily: 'Arial'
        }).setOrigin(1, 0);

        // Espacio para la pregunta
        this.questionText = this.add.text(this.cameras.main.width / 2, 100, '', {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Arial',
            align: 'center',
            wordWrap: { width: this.cameras.main.width - 100 }
        }).setOrigin(0.5);

        // Texto para mostrar el total apostado y el restante
        this.totalBetInfoText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 150, '', {
            fontSize: '20px',
            fill: '#fff',
            fontFamily: 'Arial',
            align: 'center'
        }).setOrigin(0.5);


        this.displayQuestion();
    }

    displayQuestion() {
        // Limpiar opciones e inputs anteriores
        this.optionElements.forEach(element => {
            if (element.text) element.text.destroy();
            if (element.input) element.input.destroy();
        });
        this.optionElements = [];
        this.betInputs = [];
        if (this.confirmButton) this.confirmButton.destroy();
        this.updateTotalBetInfo();


        if (this.currentQuestionIndex >= this.questions.length || this.currentMoney <= 0) {
            this.gameOver();
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        this.questionText.setText(question.text);

        const optionStartY = 200;
        const optionSpacingY = 70; // Espacio vertical entre opciones
        const optionStartX = this.cameras.main.width / 2 - 250; // Centrar opciones

        question.options.forEach((option, index) => {
            const yPos = optionStartY + index * optionSpacingY;

            const optionLabel = this.add.text(optionStartX, yPos, `${String.fromCharCode(65 + index)}. ${option.text}`, {
                fontSize: '22px',
                fill: '#fff',
                fontFamily: 'Arial'
            }).setOrigin(0, 0.5); // Alinear al centro verticalmente

            // Crear input de HTML para la apuesta
            const betInput = this.add.dom(optionStartX + 400, yPos).createElement('input');
            betInput.node.type = 'number';
            betInput.node.min = '0';
            betInput.node.placeholder = 'Apostar €';
            betInput.node.value = '0'; // Valor inicial
            betInput.node.classList.add('bet-input'); // Para aplicar estilos CSS

            // Actualizar total apostado cuando cambie el valor del input
            betInput.node.addEventListener('input', () => this.updateTotalBetInfo());

            this.optionElements.push({ text: optionLabel, input: betInput });
            this.betInputs.push({ inputElement: betInput, optionData: option });
        });

        // Botón de Confirmar Apuestas (inicialmente podría estar deshabilitado)
        this.confirmButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 80, 'Confirmar Apuestas', {
            fontSize: '24px',
            fill: '#0f0',
            backgroundColor: '#555',
            padding: { x: 20, y: 10 },
            fontFamily: 'Arial'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.processBets())
        .on('pointerover', () => this.confirmButton.setStyle({ fill: '#fff' }))
        .on('pointerout', () => this.confirmButton.setStyle({ fill: '#0f0' }));

        this.updateTotalBetInfo(); // Calcular y mostrar el total inicial
    }

    updateTotalBetInfo() {
        let currentTotalBet = 0;
        this.betInputs.forEach(betInputItem => {
            const value = parseInt(betInputItem.inputElement.node.value) || 0;
            currentTotalBet += value;
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

        // Habilitar o deshabilitar botón de confirmar
        if (this.confirmButton) {
            if (remainingToBet === 0 && currentTotalBet === this.currentMoney) {
                this.confirmButton.setAlpha(1);
                this.confirmButton.setInteractive({ useHandCursor: true });
            } else {
                this.confirmButton.setAlpha(0.5);
                this.confirmButton.disableInteractive(); // No usar useHandCursor: false aquí
            }
        }
    }

    processBets() {
        let totalBetOnThisQuestion = 0;
        let moneyOnCorrectAnswer = 0;

        this.betInputs.forEach(betInputItem => {
            const betAmount = parseInt(betInputItem.inputElement.node.value) || 0;
            if (betAmount < 0) {
                // No debería ocurrir si el input es type="number" min="0", pero por si acaso
                this.showTemporaryMessage("Las apuestas no pueden ser negativas.", '#ff0000');
                return; // Salir si hay un error
            }
            totalBetOnThisQuestion += betAmount;
            if (betInputItem.optionData.isCorrect) {
                moneyOnCorrectAnswer = betAmount;
            }
        });

        if (totalBetOnThisQuestion !== this.currentMoney) {
            this.showTemporaryMessage(`Debes apostar exactamente €${this.formatMoney(this.currentMoney)}. Has apostado €${this.formatMoney(totalBetOnThisQuestion)}.`, '#ffcc00');
            return;
        }

        // El jugador solo "gana" lo que apostó a la respuesta correcta.
        // El resto del dinero (apostado a incorrectas) se pierde.
        this.currentMoney = moneyOnCorrectAnswer;
        this.moneyText.setText(`Dinero: €${this.formatMoney(this.currentMoney)}`);

        let resultMessage = "";
        if (moneyOnCorrectAnswer > 0 && totalBetOnThisQuestion === this.currentMoney) {
             // Chequear si la opción que tenía moneyOnCorrectAnswer era realmente la correcta
            const question = this.questions[this.currentQuestionIndex];
            const correctOption = question.options.find(opt => opt.isCorrect);
            // Si moneyOnCorrectAnswer > 0, significa que apostó algo a la opción correcta
            resultMessage = `¡Correcto! Conservas €${this.formatMoney(moneyOnCorrectAnswer)}`;
            this.showTemporaryMessage(resultMessage, '#00ff00');
        } else {
            resultMessage = `Incorrecto. Has perdido lo apostado en esta ronda.`;
            this.showTemporaryMessage(resultMessage, '#ff0000');
        }

        this.currentQuestionIndex++;

        // Pequeña pausa antes de la siguiente pregunta o fin de juego
        this.time.delayedCall(3000, () => {
            this.clearTemporaryMessage();
            this.displayQuestion();
        });
    }

    gameOver() {
        // Limpiar elementos de la pregunta actual
        this.questionText.setText('');
        this.optionElements.forEach(element => {
            if (element.text) element.text.destroy();
            if (element.input) element.input.destroy();
        });
        this.optionElements = [];
        this.betInputs = [];
        if (this.confirmButton) this.confirmButton.destroy();
        if (this.totalBetInfoText) this.totalBetInfoText.setText('');


        let gameOverMessage = "";
        if (this.currentMoney > 0) {
            gameOverMessage = `¡Felicidades!\nHas terminado el juego con\n€${this.formatMoney(this.currentMoney)}`;
        } else {
            gameOverMessage = `¡Juego Terminado!\nTe has quedado sin dinero.`;
        }

        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, gameOverMessage, {
            fontSize: '32px',
            fill: '#fff',
            fontFamily: 'Arial',
            align: 'center',
            wordWrap: { width: this.cameras.main.width - 100 }
        }).setOrigin(0.5);

        // Botón de Reiniciar
        const restartButton = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100, 'Jugar de Nuevo', {
            fontSize: '24px',
            fill: '#0f0',
            backgroundColor: '#555',
            padding: { x: 20, y: 10 },
            fontFamily: 'Arial'
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            // Reiniciar la escena actual con el dinero inicial
            this.scene.restart({ initialMoney: 1000000 });
        })
        .on('pointerover', () => restartButton.setStyle({ fill: '#fff' }))
        .on('pointerout', () => restartButton.setStyle({ fill: '#0f0' }));
    }

    formatMoney(amount) {
        return amount.toLocaleString('es-ES'); // Formato de moneda para euros
    }

    showTemporaryMessage(message, color = '#ffffff') {
        if (this.tempMessage) {
            this.tempMessage.destroy();
        }
        this.tempMessage = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 50, message, {
            fontSize: '22px',
            fill: color,
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: { x: 15, y: 10 },
            fontFamily: 'Arial',
            align: 'center',
            wordWrap: { width: this.cameras.main.width - 150 }
        }).setOrigin(0.5);
    }

    clearTemporaryMessage() {
        if (this.tempMessage) {
            this.tempMessage.destroy();
            this.tempMessage = null;
        }
    }
}