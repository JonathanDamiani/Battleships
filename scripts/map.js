/* 
 *  Main
 *  @Copyright: (C) 2020, Jonathan 
 *  @Author: Jonathan Dean Damiani 
 *  @Version:  1.0.0
 *    
 *  @summary: Map class
 */
'use strict';

import { Audio }  from "./audio.js";
export const MAP_SIZE = 10;

// Constants for shoots and scores
const SHOOTS = 100;

const SCORE_PLUS = 100;
const SCORE_LESS = 30;

export default class Map {

    constructor (playerMapPositions, enemyMapPositions, playerShipList, enemyShipList) {

         // Initializing variables
        this.playerMapPositions = playerMapPositions;
        this.enemyMapPositions = enemyMapPositions;

        this.playerShipList = playerShipList;
        this.enemyShipList = enemyShipList;
        this.playerShipsPlaced = 0;
        this.canShipsRotate = true;
        this.playerWon = false;
        this.enemyWon = false;
        this.canAttack = true;

        // Generate map UI.
        this.generateMap(MAP_SIZE, "game-table", "droppable-player");
        this.generateMap(MAP_SIZE, "game-table-enemy", "droppable-enemy");

        this.dragShip(this.playerShipList);
        this.rotateShip(this.playerShipList);
        this.dropShip();
        
        // Creating score and number of shoots variables
        this.score = 0;
        this.shoots = SHOOTS;
        this.$score = $("#score-number");
        this.$shootLeft = $("#number-of-shoots");

        // Setting the values to the DOM
        this.$shootLeft.html(this.shoots);
        this.$score.html(this.score);

        // High Score variables
        this.highScore;
        this.$highScore = $("#high-score");

        // If does not exist the high_score on the cookies, create it and
        // set it to 0
        if (Cookies.get().high_score == undefined) {
            Cookies.set("high_score", 0, { expires: 365 }); 
            this.highScore = 0;
        }

        // if the high score is greater than 0 in the cookies, set the variable
        // to the value of the cookies. 
        if (Cookies.get().high_score > 0) {
            this.highScore = Cookies.get().high_score;
        }

        // Set the value of the high score to the dom
        this.$highScore.html(this.highScore);

        // instance of audio
        this.myAudio = new Audio();
    }

    // Method to start game, make the player able to hit the enemy field.
    // Receive shipList as parameters and call method from check
    // if the player placed all his ships and then call the enable the event that 
    // calls the getCellHitted method to let the player try to find
    // the enemies
    startGame( shipList, enemy ) {
        if (this.CheakAllShipsPlaced (shipList)) {
            this.myAudio.getMySounds().getSounds()[3].play();
            this.canShipsRotate = false;
            $("#game-table-enemy").on('click', (event) => this.getCellHitted(event, enemy)); 
        } 
    }

    // Check if all player ships is placed
    CheakAllShipsPlaced ( shipList ) {
        if (this.playerShipsPlaced >= shipList.length) {
            $.map((shipList), (eachShip) => {
                $(`#${eachShip.shipSelector}`).draggable('disable');
            });
            return true;
        }
        return false; 
    }

    // Generate the map header with letters.
    generateMapHeader ( size ) {
        let markup = "";
        let startingColumnChar = 'A';
        let currentCharCode = startingColumnChar.charCodeAt();

        for (let colId = 0; colId < size; colId++) {        
            currentCharCode = startingColumnChar.charCodeAt(0) + colId;    
            markup += `<th scope="col">${String.fromCharCode(currentCharCode)}</th>`;
        }
        
        return markup;
    }

    // Method to generate the map 
    generateMap( size, containerId, mapDropSelector ) {
        
        let $demoAreaEl = $(`#${containerId}`);

        // Build a table of cells 
        let markup = `<table class="game-table">`;
            markup += `<th scope="col">`;
            markup += `</th>`;
            markup += this.generateMapHeader( size );

            // creating the table with a for loop
            for (let eachRow = 0; eachRow < size; eachRow++) {

                markup += `<tr class="game-table-row">`;
                markup +=   `<th scope="row">${eachRow + 1}</th>`;
                for (let eachCol = 0; eachCol < size; eachCol++) {
                    markup += `<td class="${mapDropSelector}" data-col=${eachCol +1} data-row=${eachRow + 1}></td>`;           
                }    
                  
                markup += "</tr>"; 
            }
        markup += "</table>";

        $demoAreaEl.html(markup);
    }

    // Get the cell hitted by the player and do action of attack
    async getCellHitted (event, enemy) {
        let $clickedItem = $(event.target);

        // Check if it is clicking on a TD
        if ($clickedItem.is('TD')) {
            let col = $(event.target).data('col');
            let row = $(event.target).data('row');
            // Verify if the cell already were clicked before 
            if (this.canAttack) {
                if ( !this.isCellHitted($clickedItem)) {
                    // if has not ship add miss-shoot class
                    // else add hit-shoot, the player found the enemy.
                    if (this.enemyMapPositions[row - 1][col - 1] == 0) {
                        await this.attack(false, $clickedItem, "player");
                        
                        
                        // Call enemy attack
                        enemy.enemyAttack();  
                    }  
                    else {
                        await this.attack(true, $clickedItem, "player")
                        // Check if the ships is destroyed
                        this.checkShipsDestroyed(this.enemyShipList, row, col);   
                        // check victory condition
                        this.checkVictoryCondition(this.enemyShipList);
                        // Call enemy attack if player not won yet
                        if (!this.playerWon) {
                            enemy.enemyAttack();
                        }
                    } 
                }
            }
        }       
    }

    // Attack Method 
    async attack(hitted, $target, turn) {

        this.canAttack = false;
        if (!hitted) {
            $target.addClass("miss-shoot");
        }
        else {
            $target.addClass("hit-shoot");
        }

        if (turn == "player") {
            this.updateScore (hitted); 
             // update shoots
            this.updateShoots();   
        }

        this.canAttack = true;
    }

    // Method to decrease number of shoots
    updateShoots () {
        this.shoots--;
        this.$shootLeft.html(this.shoots);
    }

    // method to update score
    updateScore (isMissed) {
        if (isMissed) {
            this.score -= SCORE_LESS;
        }
        else {
            this.score += SCORE_PLUS;
        }
        this.$score.html(this.score);
    }

    // Check if the cell is hitted
    isCellHitted (selector) {
        return (selector.hasClass("miss-shoot") || selector.hasClass("hit-shoot"));
    }
    
    // method to make the player ships rotate
    rotateShip(playerShipList)
    {
        // Go throught the player ship list and make then be able to rotate
        $.map((playerShipList), (eachShip) => {
            // local variables
            // Select the ship div
            let $myShip = $(`#${eachShip.shipSelector}`).children();

            // Select the div containing the ship
            let shipContainer = $(`#${eachShip.shipSelector}`);
            // Double click method to rotate the ship
            $myShip.on( 'dblclick', () => {
                // Check if the player can rotate the ships 
                if (this.canShipsRotate) {
                    // If the ship has the rotate class remove it and then 
                    // put the ship on the initial position
                    if ($myShip.hasClass(`rotate-${eachShip.shipSelector}`)) {
                        $myShip.removeClass(`rotate-${eachShip.shipSelector} `);
                        if (shipContainer.parent().hasClass("droppable-player")) {
                            this.manageShipPlace (
                                shipContainer.parent().data("col"), 
                                shipContainer.parent().data("row"),
                                eachShip,
                                false,
                                true,
                                this.playerMapPositions,
                                true
                            );
                        }
                        $(`#${eachShip.shipSelector}-initial-position`).append($(`#${eachShip.shipSelector}`));
                    }
                    // If the ship has the rotate class remove it and then 
                    // put the ship on the initial position 
                    else {
                        $myShip.addClass(`rotate-${eachShip.shipSelector} `);
                        if (shipContainer.parent().hasClass("droppable-player")) {
                            this.manageShipPlace (
                                shipContainer.parent().data("col"), 
                                shipContainer.parent().data("row"),
                                eachShip,
                                true,
                                true,
                                this.playerMapPositions,
                                true
                            );
                        }
                        $(`#${eachShip.shipSelector}-initial-position`).append($(`#${eachShip.shipSelector}`));
                    }
                }
            });
        });
    }
    
    // Method to activate the drag of the ships 
    dragShip (playerShipList) {       
        playerShipList.map( (eachShip)=> {
            $(`#${eachShip.shipSelector}`).draggable(
                {
                    // Make the revert
                    revert: "invalid",
                    // start method of drag
                    start: (event) => {
                        let $shipReferenceParent = $(event.target).parent();
                        let $shipReference = $(event.target);

                        // Check if the ship parent have class to drop the player
                        // If it has reset the last position on the matrix
                        if ($shipReferenceParent.hasClass("droppable-player")) {
                            if ($shipReference.children().hasClass(`rotate-${eachShip.shipSelector}`)) {
                                // reset the positions, remove the last position of the player
                                // from the matrix in the vertical position
                                this.manageShipPlace (
                                    $shipReferenceParent.data("col"), 
                                    $shipReferenceParent.data("row"),
                                    eachShip,
                                    false,
                                    true,
                                    this.playerMapPositions,
                                    true
                                );
                            }
                            else {
                                // reset the positions, remove the last position of the player
                                // from the matrix in the horizontal position
                                this.manageShipPlace (
                                    $shipReferenceParent.data("col"), 
                                    $shipReferenceParent.data("row"),
                                    eachShip,
                                    true,
                                    true,
                                    this.playerMapPositions,
                                    true
                                );
                            }
                            
                        }   
                    },
                    // Stop the drag
                    stop: (event) => {
                        let $shipReferenceParent = $(event.target).parent();
                        let $shipReference = $(event.target);

                        // Check if the ship parent have class to drop the player
                        // To check for the player be able to drop
                        if ($shipReferenceParent.hasClass("droppable-player")) {
                            // Place the ship on vertical and save the positions on the matrix
                            if ($shipReference.children().hasClass(`rotate-${eachShip.shipSelector}`)) {
                                // Set the position and place ship
                                this.manageShipPlace (
                                    $shipReferenceParent.data("col"), 
                                    $shipReferenceParent.data("row"),
                                    eachShip,
                                    false,
                                    false,
                                    this.playerMapPositions,
                                    true
                                );
                            }
                            // Place the ship on horizontal and save the positions on the matrix
                            else {
                                // Set the position and place ship
                                this.manageShipPlace (
                                    $shipReferenceParent.data("col"), 
                                    $shipReferenceParent.data("row"),
                                    eachShip,
                                    true,
                                    false,
                                    this.playerMapPositions,
                                    true
                                );
                            }
                            
                        }   
                    }
                }
            )
        })
    }

    // Method to handle the drop conditions of the player ships
    dropShip ( ) {
        $( `.droppable-player` ).droppable({
            // just accept draggables with this class
            accept: ".ship-handle-drag",
            // check for the drop conditions
            drop: (event, ui) => {

                let $draggableShip = ui.draggable;
                let fieldDrop = event.target;
                // The ship has the class that make it rotate, 
                // drop it on the row, if it overlap any border put it back
                // on the initial position
                if ($draggableShip.children().hasClass(`rotate-${$draggableShip[0].id}`)) {
                    if (($(fieldDrop).data("row") > MAP_SIZE - $draggableShip.data("size") + 1)) {
                        // insert the div inside the initial grid
                        $(`#${$draggableShip[0].id}-initial-position`).append($draggableShip[0]);
                        // remove the attributes that the draggable put on the div
                        $($draggableShip[0]).removeAttr("style");
                    }
                    else {
                        // Check if the ship is overlapping other ships
                        // Call the method canPlace ship to verify if it is not
                        // overlaping anything on vertical
                        let checkFieldEmptyVertical = this.canPlaceShip($(fieldDrop).data("row"), $(fieldDrop).data("col"), $draggableShip.data("size"), false, this.playerMapPositions);
                        if (!checkFieldEmptyVertical) {
                            $(`#${$draggableShip[0].id}-initial-position`).append($draggableShip[0]);
                            $($draggableShip[0]).removeAttr("style");
                        }
                        // If the ship is not overlapping anything, place it 
                        else {
                            fieldDrop.append($draggableShip[0]);
                            $($draggableShip[0]).removeAttr("style");
                        }
                   
                    }
                }
                 // The ship has not the class that make it rotate, 
                // drop it on the col, if it overlap any border put it back
                // on the initial position
                else {
                    if (($(fieldDrop).data("col") > MAP_SIZE - $draggableShip.data("size") + 1)) {
                        $(`#${$draggableShip[0].id}-initial-position`).append($draggableShip[0]);
                        $($draggableShip[0]).removeAttr("style");
                    }
                    else {
                        // Check if the ship is overlapping other ships
                        // Call the method canPlace ship to verify if it is not
                        // overlaping anything in the horizontal
                        let checkFieldEmptyHorizontal = this.canPlaceShip($(fieldDrop).data("row"), $(fieldDrop).data("col"), $draggableShip.data("size"), true, this.playerMapPositions);
                        if (!checkFieldEmptyHorizontal) {
                            $(`#${$draggableShip[0].id}-initial-position`).append($draggableShip[0]);
                            $($draggableShip[0]).removeAttr("style");
                        }
                        // Check if the ship is overlapping other ships
                        // Call the method canPlace ship to verify if it is not
                        // overlaping anything
                        else {
                            fieldDrop.append($draggableShip[0]);
                            $($draggableShip[0]).removeAttr("style");
                        }
                    }
                }  
            }
        });
    }

    // Method to place ships in the matrix and get the position of the ships in the
    // ship object and also clear the positions if the ship is removed.
    manageShipPlace (col, row, ship, isHorizontal, remove, mapMatrix, isPlayer) {
        // check if it is removing or placing the ship
        if (!remove) {
            // Check the direction to place the ship
            // Then place it on the matrix and save the position in the ship
            // object
            if (isHorizontal) {
                for (let index = 0; index < ship.shipSize; index++) {
                    mapMatrix[row - 1][(col - 1) + index ] = ship.shipSize;
                    ship.shipPositions[index] = {row: row , col: (col + index)};
                }
            }
            else {
                for (let index = 0; index < ship.shipSize; index++) {
                    mapMatrix[(row - 1) + index][col - 1] = ship.shipSize;
                    ship.shipPositions[index] = {row: (row + index), col: col };
                }
            }
            if (isPlayer) {
                this.playerShipsPlaced++;
            }
        }
        else {
            // Check the direction to place the ship
            // Then clear it on the matrix and clear the position in the ship
            // object
            if (isHorizontal) {
                for (let index = 0; index < ship.shipSize; index++) {
                    mapMatrix[row - 1][(col - 1) + index ] = 0;
                    ship.shipPositions.pop();
                }
            }
            else {
                for (let index = 0; index < ship.shipSize; index++) {
                    mapMatrix[(row - 1) + index][col - 1] = 0;
                    ship.shipPositions.pop();
                }
            }
            if (isPlayer) {
                this.playerShipsPlaced--;
            }
        }
    }
     
    // Check if the position of the matrix is empty
    isEmpty (row, col, mapMatrix) {
        if (mapMatrix[row - 1][col - 1] != 0) {
            return false;
        }
        else {
            return true;
        }
    }

    // Check if the player can be placed in the position of the matrix.
    // Return true if the ship is placable in the position
    canPlaceShip( row, col, shipSize, isHorizontal, mapMatrix ) {
        let counter = 0;
        // Loop the matrix position to check if it has some ship on it
        while (counter < shipSize) {
            if (isHorizontal) {
                if ((mapMatrix[row - 1][col - 1 + counter]) != 0) {
                    return false;
                }
            }
            else {
                if ((mapMatrix[row - 1 + counter][col - 1]) != 0) {
                    return false;
                }
            }
            counter++;
        }
        return true;
    }

    // Method to check if the ship is destroyed and then show it to the user on the
    // Initital position 
    checkShipsDestroyed (shipList, row, col) {
        let $shipReferenceInitialPosition;
        let $shipReference;
        // Go througth the ships
        $.map(shipList, (eachShip) => {
            // For it ship verify if it get hitted them increase the hitcount of
            // the ship object to 1 and when the ship is destroyed, it mark the ship
            // as destroyed and put it in the initial position with user feedback
            // so the player can see which ships it destroys and also the enemy.
            // Return true if the ship is destroyed.
            for (let index = 0; index < eachShip.shipPositions.length; index++) {
                if (eachShip.shipPositions[index].row == row && eachShip.shipPositions[index].col == col) {
                    eachShip.hitCount ++;
                }

                $shipReferenceInitialPosition = $(`#${eachShip.shipSelector}-initial-position`);

                if (eachShip.hitCount >= eachShip.shipSize) {

                    $shipReferenceInitialPosition.addClass("hit-shoot");
                    $.map(($shipReferenceInitialPosition.siblings("td")), (each)=> {
                        $(each).addClass("hit-shoot");
                    })

                    $shipReference = $(`#${eachShip.shipSelector}`);

                    if ($shipReference.parent().hasClass("ui-droppable")) {
                        if ($shipReference.children().hasClass(`rotate-${eachShip.shipSelector}`)) {
                            $shipReference.children().removeClass(`rotate-${eachShip.shipSelector}`);
                        }
                        $shipReferenceInitialPosition.append($shipReference);
                    }
                    return true;
                }
            }
        });
        return false;
    }

    // Method to check victory condition
    checkVictoryCondition (ships) {
        let counter = 0;

        if (this.shoots == 0) {
            this.enemyWon = true;
            $(".defeat-screen").removeClass("hide-screen");
        }
        // Check if the size of the ship is the same as the number of hits
        // if add to counter
        $.map((ships), (eachShip) => {
            if (eachShip.hitCount >= eachShip.shipSize) {
                counter++;
            }
        });
        // If the counter if equal the numbert of the ships someone wins
        if (counter == ships.length) {
            
            // If the counter if equal the numbert of the ships someone wins
            if (ships[0].shipOwner == "player") {
                this.enemyWon = true;
                $(".defeat-screen").removeClass("hide-screen");
            }
            else {
                this.playerWon = true;
                $(".victory-screen").removeClass("hide-screen");
            }

            // Set the high score on the cookies
            if (this.score > Cookies.get().high_score) {
                Cookies.set("high_score", this.score.toString(), { expires: 365 });        
            }
        }
    }
}
