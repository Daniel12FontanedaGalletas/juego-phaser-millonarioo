// src/scenes/GameScene.js
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        this.currentMoney = 0;
        this.questions = [ // Asegúrate de que tu lista de preguntas esté aquí y sea válida
            { id: 1, text: "¿Capital de Francia?", options: [{ text: "Berlín", isCorrect: false }, { text: "Madrid", isCorrect: false }, { text: "París", isCorrect: true }, { text: "Roma", isCorrect: false }] },
            { id: 2, text: "¿Cuál es el río más largo del mundo?", options: [{ text: "Nilo", isCorrect: false }, { text: "Amazonas", isCorrect: true }, { text: "Misisipi", isCorrect: false }, { text: "Yangtsé", isCorrect: false }] },
            { id: 3, text: "¿En qué año llegó el hombre a la luna?", options: [{ text: "1965", isCorrect: false }, { text: "1969", isCorrect: true }, { text: "1972", isCorrect: false }, { text: "1959", isCorrect: false }] },
            { id: 4, text: "¿Cuántos lados tiene un hexágono?", options: [{ text: "Cinco", isCorrect: false }, { text: "Seis", isCorrect: true }, { text: "Siete", isCorrect: false }, { text: "Ocho", isCorrect: false }] },
            { id: 5, text: "¿Planeta más grande del sistema solar?", options: [{ text: "Tierra", isCorrect: false }, { text: "Marte", isCorrect: false }, { text: "Júpiter", isCorrect: true }, { text: "Saturno", isCorrect: false }] }
        ];
        this.currentQuestionIndex = 0;
        this.optionElements = []; 
        this.confirmButtonContainer = null; 
        this.continueButtonContainer = null; 
        this.totalBetInfoText = null;
        this.questionPanel = null;
    }

    init(data) {
        console.log("GameScene: init() STARTS", data);
        this.currentMoney = data.initialMoney || 1000000;
        this.currentQuestionIndex = 0;
        // Limpieza de elementos si la escena se reinicia
        this.optionElements.forEach(el => {
            if (el.label) el.label.destroy();
            if (el.input) el.input.destroy();
            if (el.feedbackIcon) el.feedbackIcon.destroy();
        });
        this.optionElements = [];
        console.log("GameScene: init() ENDS");
    }

    create() {
        console.log("GameScene: create() STARTS");

        // 1. Fondos en Capas
        try {
            let bgLayer1 = this.add.image(0, 0, 'backgroundLayer1').setOrigin(0,0);
            bgLayer1.displayWidth = this.cameras.main.width; bgLayer1.displayHeight = this.cameras.main.height;
            let bgLayer2 = this.add.image(0, 0, 'backgroundLayer2').setOrigin(0,0);
            bgLayer2.displayWidth = this.cameras.main.width; bgLayer2.displayHeight = this.cameras.main.height;
            console.log("GameScene: Backgrounds added.");
        } catch(e) { console.error("Error adding backgrounds:", e); }

        // 2. Panel para Preguntas y Opciones
        try {
            this.questionPanel = this.add.image(
                this.cameras.main.width / 2, 
                this.cameras.main.height / 2 - 50, 
                'newQuestionPanelImage' // Esta es 'buttonLong_brown_pressed.png'
            );
            if (this.questionPanel) {
                this.questionPanel.setOrigin(0.5);
                this.questionPanel.displayWidth = this.cameras.main.width * 0.85; 
                this.questionPanel.displayHeight = this.cameras.main.height * 0.6; 
                console.log("GameScene: Question panel ('newQuestionPanelImage') added and scaled.");
                console.log("GameScene: Panel dimensions - Width:", this.questionPanel.displayWidth, "Height:", this.questionPanel.displayHeight, "Texture key:", this.questionPanel.texture.key);
            } else {
                console.error("GameScene: FAILED to create questionPanel from 'newQuestionPanelImage'. Using fallback graphics.");
                // Fallback a un gráfico simple si la imagen del panel falla, para que el resto funcione
                this.questionPanel = this.add.graphics({ fillStyle: { color: 0x000000, alpha: 0.5 } });
                this.questionPanel.fillRect(this.cameras.main.width * 0.075, this.cameras.main.height * 0.2, this.cameras.main.width * 0.85, this.cameras.main.height * 0.6);
                // ¡OJO! Si usamos graphics, displayWidth y displayHeight no se calculan igual.
                // Para este fallback, usaremos dimensiones fijas para el posicionamiento relativo.
                this.questionPanel.fallbackWidth = this.cameras.main.width * 0.85;
                this.questionPanel.fallbackHeight = this.cameras.main.height * 0.6;
                this.questionPanel.fallbackY = this.cameras.main.height * 0.2 + (this.cameras.main.height * 0.6 / 2); // Centro Y del fallback
            }
        } catch (e) { 
            console.error("Error creating or scaling question panel:", e);
            // Implementar fallback similar si la creación de la imagen falla catastróficamente
            this.questionPanel = this.add.graphics({ fillStyle: { color: 0x111111, alpha: 0.7 } });
            this.questionPanel.fillRect(this.cameras.main.width * 0.075, this.cameras.main.height * 0.2, this.cameras.main.width * 0.85, this.cameras.main.height * 0.6);
            this.questionPanel.fallbackWidth = this.cameras.main.width * 0.85;
            this.questionPanel.fallbackHeight = this.cameras.main.height * 0.6;
            this.questionPanel.fallbackY = this.cameras.main.height * 0.2 + (this.cameras.main.height * 0.6 / 2);
        }

        // 3. Texto del Dinero
        try {
            this.moneyText = this.add.text(this.cameras.main.width - 30, 30, `Dinero: €${this.formatMoney(this.currentMoney)}`, {
                fontFamily: '"Montserrat", Arial, sans-serif', fontSize: '28px', fill: '#FFFF00',
                stroke: '#000000', strokeThickness: 4, align: 'right'
            }).setOrigin(1, 0.5);
            console.log("GameScene: Money text added.");
        } catch(e) { console.error("Error adding money text:", e); }

        // 4. Texto de la Pregunta
        try {
            const panelEffectiveY = this.questionPanel.fallbackY || this.questionPanel.y;
            const panelEffectiveHeight = this.questionPanel.fallbackHeight || this.questionPanel.displayHeight;
            const panelEffectiveWidth = this.questionPanel.fallbackWidth || this.questionPanel.displayWidth;

            this.questionText = this.add.text( 
                this.cameras.main.width / 2, 
                panelEffectiveY - panelEffectiveHeight / 2 + 70, // Posición Y relativa al panel
                '', 
                {
                    fontFamily: '"Montserrat", Arial, sans-serif', fontSize: '30px', fill: '#FFFFFF',
                    align: 'center', wordWrap: { width: panelEffectiveWidth ? panelEffectiveWidth - 80 : this.cameras.main.width * 0.7 }, // Fallback para wordWrap width
                    stroke: '#000000', strokeThickness: 3
                }
            ).setOrigin(0.5);
            console.log("GameScene: Question text object created. Y pos:", this.questionText.y);
        } catch(e) { console.error("Error adding question text:", e); }

        // 5. Texto de Información de Apuesta
        try {
            this.totalBetInfoText = this.add.text(this.cameras.main.width / 2, this.cameras.main.height - 150, '', {
                fontFamily: '"Roboto", Arial, sans-serif', fontSize: '20px', fill: '#FFFFFF', align: 'center'
            }).setOrigin(0.5);
            console.log("GameScene: Bet info text added.");
        } catch(e) { console.error("Error adding bet info text:", e); }

        // 6. Botones
        try {
            this.confirmButtonContainer = this.createGameButton(
                this.cameras.main.width / 2, this.cameras.main.height - 80,
                'Confirmar Apuestas', () => this.processBets()
            );
            this.continueButtonContainer = this.createGameButton(
                this.cameras.main.width / 2, this.cameras.main.height - 80,
                'Continuar', () => this.prepareNextQuestion()
            );
            this.continueButtonContainer.setVisible(false);
            console.log("GameScene: Action buttons created.");
        } catch(e) { console.error("Error creating action buttons:", e); }

        try {
            this.displayQuestion();
        } catch(e) { console.error("Error in initial call to displayQuestion():", e); }
        
        this.cameras.main.fadeIn(500, 20, 20, 20);
        console.log("GameScene: create() ENDS");
    }

    createGameButton(x, y, text, callback) {
        // ... (código de createGameButton como en la última versión, con el aumento de ancho) ...
        // Asegúrate que 'uiButtonSquareBlue' es la clave correcta
        const buttonImg = this.add.image(0, 0, 'uiButtonSquareBlue').setInteractive({ useHandCursor: false }).setOrigin(0.5);
        const baseScaleButtonGame = 1.3; 
        const widthMultiplierGame = 2.0; 
        buttonImg.setScale(baseScaleButtonGame);
        buttonImg.displayWidth = (buttonImg.width * baseScaleButtonGame) * widthMultiplierGame;
        const buttonText = this.add.text(0, 0, text, { fontFamily: '"Roboto", Arial, sans-serif', fontSize: '26px', fill: '#FFFFFF', align: 'center' }).setOrigin(0.5);
        if (buttonText.width > buttonImg.displayWidth * 0.90) { 
             const newFontSize = Math.floor(parseFloat(buttonText.style.fontSize) * ( (buttonImg.displayWidth * 0.90) / buttonText.width ) );
             buttonText.setFontSize(newFontSize + 'px');
             if (newFontSize < 12) { console.warn(`Texto del botón "${text}" podría ser demasiado largo.`); }
        }
        const container = this.add.container(x, y, [buttonImg, buttonText]);
        container.setSize(buttonImg.displayWidth, buttonImg.displayHeight);
        buttonImg.on('pointerdown', callback);
        const hoverEffectScaleGame = 1.05;
        buttonImg.on('pointerover', () => {
            buttonImg.setTint(0xDDDDDD);
            buttonImg.setScale(baseScaleButtonGame * hoverEffectScaleGame);
            buttonImg.displayWidth = (buttonImg.width * baseScaleButtonGame * hoverEffectScaleGame) * widthMultiplierGame;
        });
        buttonImg.on('pointerout', () => {
            buttonImg.clearTint();
            buttonImg.setScale(baseScaleButtonGame);
            buttonImg.displayWidth = (buttonImg.width * baseScaleButtonGame) * widthMultiplierGame;
        });
        return container;
    }

    displayQuestion() {
        console.log("GameScene: displayQuestion() for question index", this.currentQuestionIndex);
        console.log("GameScene: Current money for displayQuestion:", this.currentMoney);

        // Limpiar elementos
        this.optionElements.forEach(el => {
            if (el.label) el.label.destroy();
            if (el.input) el.input.destroy(); 
            if (el.feedbackIcon) el.feedbackIcon.destroy(); 
        });
        this.optionElements = [];
        
        if (this.totalBetInfoText) { // Comprobar si existe
            this.totalBetInfoText.setText('').setVisible(true); 
        } else {
            console.error("GameScene: totalBetInfoText is null in displayQuestion!");
        }


        if (this.currentQuestionIndex >= this.questions.length || this.currentMoney <= 0) {
            console.log("GameScene: Condition for gameOver met.");
            this.gameOver(); 
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        if (!question) {
            console.error("GameScene: Question not found for index", this.currentQuestionIndex, "- stopping.");
            this.gameOver(); // Ir a game over si no hay pregunta
            return;
        }

        if (this.questionText) { // Comprobar si existe
            this.questionText.setText(question.text);
            console.log("GameScene: Question text set to:", question.text);
        } else {
            console.error("GameScene: questionText is null in displayQuestion!");
        }
        

        // === AJUSTES DE POSICIONAMIENTO DE OPCIONES CON MÁS CUIDADO ===
        const panelRef = this.questionPanel; // Usar una referencia para claridad
        let panelY, panelDisplayHeight, panelDisplayWidth;

        if (panelRef && panelRef.texture && panelRef.texture.key !== '') { // Si es una imagen y se cargó
            panelY = panelRef.y;
            panelDisplayHeight = panelRef.displayHeight;
            panelDisplayWidth = panelRef.displayWidth;
            console.log("GameScene: Using image panel dimensions for options layout. Height:", panelDisplayHeight);
        } else if (panelRef && panelRef.fallbackHeight) { // Si es el graphics de fallback
            panelY = panelRef.fallbackY; // Usar el centro Y calculado para el graphics
            panelDisplayHeight = panelRef.fallbackHeight;
            panelDisplayWidth = panelRef.fallbackWidth;
            console.log("GameScene: Using fallback graphics panel dimensions for options layout. Height:", panelDisplayHeight);
        } else {
            console.error("GameScene: questionPanel is not available or has no valid dimensions! Using default screen positions.");
            // Fallback si el panel es completamente nulo o inválido
            panelY = this.cameras.main.height / 2;
            panelDisplayHeight = this.cameras.main.height * 0.5; // Un valor por defecto
            panelDisplayWidth = this.cameras.main.width * 0.8;
        }
        
        // Asegurarse de que panelDisplayHeight no sea 0 o negativo para evitar errores de división
        if(panelDisplayHeight <= 180) { // 180 es un valor arbitrario basado en tu cálculo anterior
            console.warn("GameScene: panelDisplayHeight is too small for option layout, defaulting to 300px for spacing calculation.");
            panelDisplayHeight = 300; // Un valor mínimo para que el cálculo de espaciado no sea negativo/cero
        }


        const optionStartY = panelY - panelDisplayHeight / 2 + 160; // Ajusta el offset vertical inicial
        const optionsAreaHeight = panelDisplayHeight - 180; // Altura disponible para las opciones
        const optionCount = question.options ? question.options.length : 0;
        const optionSpacingY = optionCount > 0 ? optionsAreaHeight / Math.max(1, optionCount) : 70; // Evitar división por cero

        console.log("GameScene: Option layout params - startY:", optionStartY, "spacingY:", optionSpacingY, "optionsCount:", optionCount);

        if (question.options && optionCount > 0) {
            question.options.forEach((option, index) => {
                const yPos = optionStartY + index * optionSpacingY;
                const optionStartX = this.cameras.main.width / 2 - (panelDisplayWidth / 2) + 50; // Relativo al borde izq del panel

                const optionLabel = this.add.text(optionStartX, yPos, `${String.fromCharCode(65 + index)}. ${option.text}`, { 
                    fontFamily: '"Roboto", Arial, sans-serif', fontSize: '20px', fill: '#FFFFFF', 
                    stroke: '#000000', strokeThickness: 2,
                    wordWrap: {width: panelDisplayWidth ? panelDisplayWidth * 0.45 : 350 } // Ancho para el texto de la opción
                }).setOrigin(0, 0.5);

                const inputX = optionStartX + (panelDisplayWidth ? panelDisplayWidth * 0.55 : 400) + 20; // Posicionar input a la derecha del texto de opción
                const betInput = this.add.dom(inputX, yPos).createElement('input');
                betInput.node.type = 'number'; betInput.node.min = '0'; betInput.node.placeholder = 'Apostar €'; betInput.node.value = '0';
                betInput.node.classList.add('bet-input');
                betInput.node.addEventListener('input', () => this.updateTotalBetInfo());
                this.optionElements.push({ label: optionLabel, input: betInput, optionData: option, feedbackIcon: null });
            });
        } else {
            console.warn("GameScene: No options found for current question or question.options is undefined.");
        }


        if (this.confirmButtonContainer) {
            this.confirmButtonContainer.setVisible(true).setAlpha(0.5); 
            if (this.confirmButtonContainer.list[0]) (this.confirmButtonContainer.list[0]).disableInteractive(); 
        }
        if (this.continueButtonContainer) {
            this.continueButtonContainer.setVisible(false);
        }
        
        this.updateTotalBetInfo();
        console.log("GameScene: displayQuestion() ENDS");
    }

    // ... (updateTotalBetInfo, processBets, prepareNextQuestion, gameOver, formatMoney como en la última versión,
    //      con ticks/cruces de texto en processBets) ...
    updateTotalBetInfo() {
        if (!this.totalBetInfoText || !this.totalBetInfoText.active) return;
        let currentTotalBet = 0;
        this.optionElements.forEach(el => { 
            if (el.input && el.input.node) {
                 const value = parseInt(el.input.node.value) || 0; currentTotalBet += value;
            }
        });
        const remainingToBet = this.currentMoney - currentTotalBet;
        let infoText = `Total Apostado: €${this.formatMoney(currentTotalBet)}\n`;
        let canConfirm = false;
        if (remainingToBet > 0) infoText += `Debes apostar €${this.formatMoney(remainingToBet)} más.`;
        else if (remainingToBet < 0) infoText += `¡Has apostado €${this.formatMoney(Math.abs(remainingToBet))} de más!`;
        else if (this.currentMoney > 0 && currentTotalBet === this.currentMoney) { infoText += `¡Todo apostado! Listo para confirmar.`; canConfirm = true; }
        else if (this.currentMoney === 0 && currentTotalBet === 0) { infoText += `No tienes dinero para apostar.`; canConfirm = true; }
        this.totalBetInfoText.setText(infoText);
        if (this.confirmButtonContainer && this.confirmButtonContainer.visible) {
            const confirmButtonImage = this.confirmButtonContainer.list[0]; 
            if (canConfirm) { this.confirmButtonContainer.setAlpha(1); if (confirmButtonImage && !confirmButtonImage.input.enabled) confirmButtonImage.setInteractive({useHandCursor: false}); }
            else { this.confirmButtonContainer.setAlpha(0.5); if (confirmButtonImage && confirmButtonImage.input.enabled) confirmButtonImage.disableInteractive(); }
        }
    }

    processBets() {
        console.log("GameScene: processBets()");
        let totalBetOnThisQuestion = 0; let moneyOnCorrectAnswer = 0; let allBetsAreValid = true;
        this.optionElements.forEach(el => {
            const betAmount = parseInt(el.input.node.value) || 0;
            if (betAmount < 0) { allBetsAreValid = false; return; }
            totalBetOnThisQuestion += betAmount;
            if (el.optionData.isCorrect) { moneyOnCorrectAnswer = betAmount; }
        });

        if (!allBetsAreValid || totalBetOnThisQuestion !== this.currentMoney) {
            this.totalBetInfoText.setText(`Error: Apuesta inválida. Verifica el total.`); return;
        }
        this.currentMoney = moneyOnCorrectAnswer;
        this.moneyText.setText(`Dinero: €${this.formatMoney(this.currentMoney)}`);
        this.optionElements.forEach((element) => {
            const optionIsCorrect = element.optionData.isCorrect;
            const feedbackSymbol = optionIsCorrect ? '✔' : '✘'; 
            const feedbackColor = optionIsCorrect ? '#00FF00' : '#FF0000'; 
            const feedbackX = element.input.x + element.input.width + 40; 
            const feedbackY = element.label.y;
            if (element.feedbackIcon) element.feedbackIcon.destroy(); 
            element.feedbackIcon = this.add.text(feedbackX, feedbackY, feedbackSymbol, { fontSize: '32px', fill: feedbackColor, fontFamily: 'Arial' }).setOrigin(0.5);
            if (element.input && element.input.node) { element.input.node.disabled = true; }
        });
        if(this.confirmButtonContainer) this.confirmButtonContainer.setVisible(false);
        if(this.continueButtonContainer) {
            this.continueButtonContainer.setVisible(true).setAlpha(1);
            if(this.continueButtonContainer.list[0]) (this.continueButtonContainer.list[0]).setInteractive({useHandCursor: false});
        }
        if(this.totalBetInfoText) this.totalBetInfoText.setVisible(false);
    }
    prepareNextQuestion() {
        console.log("GameScene: prepareNextQuestion()");
        this.currentQuestionIndex++;
        this.optionElements.forEach(el => { if (el.input && el.input.node) el.input.node.disabled = false; });
        this.displayQuestion();
    }
    gameOver() {
        console.log("GameScene: gameOver()");
        if(this.questionText) this.questionText.setText('');
        this.optionElements.forEach(el => {
            if (el.label) el.label.destroy(); if (el.input) el.input.destroy(); if (el.feedbackIcon) el.feedbackIcon.destroy();
        });
        this.optionElements = [];
        if (this.confirmButtonContainer) {this.confirmButtonContainer.destroy(); this.confirmButtonContainer = null;}
        if (this.continueButtonContainer) {this.continueButtonContainer.destroy(); this.continueButtonContainer = null;}
        if (this.totalBetInfoText) {this.totalBetInfoText.destroy(); this.totalBetInfoText = null;}
        if (this.questionPanel) {this.questionPanel.destroy(); this.questionPanel = null;}

        let gameOverMessage = "";
        if (this.currentMoney > 0 && this.currentQuestionIndex >= this.questions.length) {
            gameOverMessage = `¡Felicidades!\nHas terminado con\n€${this.formatMoney(this.currentMoney)}`;
        } else {
            gameOverMessage = `¡Juego Terminado!`; if (this.currentMoney <= 0) gameOverMessage += `\nTe has quedado sin dinero.`;
        }
        this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 - 50, gameOverMessage, { fontFamily: '"Montserrat", Arial, sans-serif', fontSize: '40px', fill: '#fff', align: 'center', stroke: '#000', strokeThickness: 5, backgroundColor: 'rgba(0,0,0,0.7)', padding: {x:20, y:20} }).setOrigin(0.5);
        
        // Recrear el botón de reinicio con una verificación
        try {
            const restartButtonContainer = this.createGameButton(
                this.cameras.main.width / 2, this.cameras.main.height / 2 + 100,
                'Volver al Inicio', () => this.scene.start('WelcomeScene')
            );
            if (restartButtonContainer) { 
                 restartButtonContainer.setVisible(true).setAlpha(1);
                if (restartButtonContainer.list && restartButtonContainer.list[0] && restartButtonContainer.list[0].setInteractive) {
                    (restartButtonContainer.list[0]).setInteractive({useHandCursor: false});
                }
            }
        } catch (e) { // Fallback si createGameButton falla o la escena ya no puede agregar más
            console.error("Error creating restart button in gameOver, using fallback text button:", e);
            const fallbackRestart = this.add.text(this.cameras.main.width / 2, this.cameras.main.height / 2 + 100, 'Volver al Inicio', {fontSize: '24px', fill: '#0f0', backgroundColor: '#555', padding: {x:10,y:10}}).setOrigin(0.5).setInteractive();
            fallbackRestart.on('pointerdown', () => this.scene.start('WelcomeScene'));
        }
    }
    formatMoney(amount) { return amount.toLocaleString('es-ES'); }
}