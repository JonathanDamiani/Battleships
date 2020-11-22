/* 
 *  Main
 *  @Copyright: (C) 2020, Jonathan 
 *  @Author: Jonathan Dean Damiani 
 *  @Version:  1.0.0
 *    
 *  @summary: Enemy class of game.
 */
'use strict';
import { MAP_SIZE } from './map.js';

export default class Enemy {
    constructor (map, enemyPositionMatrix, playerPositionsMatrix, playerShips, enemyShips) {
        this.map = map;
        this.enemyPositionMatrix = enemyPositionMatrix;
        this.playerPositionsMatrix = playerPositionsMatrix;
        this.playerShips = playerShips;
        this.enemyShips = enemyShips;
        // Check the enemy last hit
        this.lastEnemyHit = {
            row: 1,
            col: 1,
            hitted: false,
            testRow: false,
            testCol:  true,
            rowIncrease: true,
            colIncrease: true
        };

    }

      // Method to randomly place enemy ships in the enemy matrix. 
      placeEnemyShips ( shipList ) {
        // local variables
        let randomRow = 0;
        let randomCol = 0;
        let isHorizontal = true;
        let randomOrientation = 0 ;
        // Loop the enemy ship list and try to place enemies in the positions.
        for (let index = 0; index < shipList.length; index++) {
            // Generate random cols and rows
            randomRow = Math.floor(Math.random() * MAP_SIZE) + 1;
            randomCol = Math.floor(Math.random() * MAP_SIZE) + 1;
            // Generata number between 1 and 100 
            randomOrientation =  Math.floor(Math.random() * 100) + 1;
            // if random orientation is > 50 it will set the isHorizontal to false
            // giving the enemy a chance of 50% to put every ship in horizontal
            // of vertical position
            if (randomOrientation > 50) {
                isHorizontal = false;
            }
            else 
            {
                isHorizontal = true;
            }

            // If horizontal try to put in the horizontal position.
            if (isHorizontal) {
                if ( !(randomCol > MAP_SIZE - shipList[index].shipSize + 1 )) {
                    // Access the method canPlaceShip from Map class to check if
                    // the place is empty
                    if (this.map.canPlaceShip(randomRow, randomCol, shipList[index].shipSize, true, this.enemyPositionMatrix)) {
                        // Access the method manageShipPlace from Map class to place the ships
                        this.map.manageShipPlace (randomCol, randomRow, shipList[index], true, false, this.enemyPositionMatrix);
                    }
                    // if it is not possible reduce the index of the for to keep
                    // trying until all the ships is placed
                    else {
                        // I do not know why, but I couldnt figure out how to do it
                        // if the while, every time I had tried, the browser, stop
                        // responding.
                        index --;
                    }
                }
                // if it is not possible reduce the index of the for to keep
                // trying until all the ships is placed
                else {
                    index --;
                }
            }
            // If is not horizontal try to put in the vertical position.
            else {
                if (!(randomRow > MAP_SIZE - shipList[index].shipSize + 1 )) {
                    // Access the method canPlaceShip from Map class to check if
                    // the place is empty
                    if (this.map.canPlaceShip(randomRow, randomCol, shipList[index].shipSize, false, this.enemyPositionMatrix)) {
                          // Access the method manageShipPlace from Map class to place the ships
                        this.map.manageShipPlace (randomCol, randomRow, shipList[index], false, false, this.enemyPositionMatrix);
                    }
                    else {
                        index --;
                    }
                }
                else {
                    index --;
                }
            }        
        }
    }

    // Method to check if enemy hitted a ship or not
    isEnemyHittedShip (hitRow, hitCol, $selector) {
        if (this.map.isEmpty(hitRow, hitCol, this.playerPositionsMatrix)) {
            this.map.attack(false, $selector, "enemy");
            return false;
        }
        else {
            this.map.attack(true, $selector, "enemy");
            this.map.checkShipsDestroyed(this.playerShips, hitRow, hitCol);
            return true;
        }
    }

    // Method to generate a random attack for the enemy
    async enemyRandomAttack () {
        // Local Variables
        let $selector; 
        let hitRow;
        let hitCol;

        // Loop througth the cell of the grid to find a place to hit.
        while (true) {
            // Choosing random row and col to hir
            hitRow = Math.floor(Math.random() * MAP_SIZE) + 1;
            hitCol = Math.floor(Math.random() * MAP_SIZE) + 1;
            
            // selecting the row and col
            $selector = $(`.droppable-player[data-row="${hitRow}"][data-col="${hitCol}"]`);

            // Check the method isCellHitted from map to check if the cell can be
            // hitted, if it were not hitted before
            if (!this.map.isCellHitted($selector))
            {
                // Check if the cell is empty using the method from map class
                // if it is empty add class miss-shoot, the enemy does not hit 
                // anything
                if (this.map.isEmpty(hitRow, hitCol, this.playerPositionsMatrix)) {
                    // call attack for enemy
                    await this.map.attack(false, $selector, "enemy");
                    break;
                }
                // Check if the cell is not empty using the method from map class
                // if it is  not empty add class hit-shoot, the enemy does hit 
                // a ship
                else {
                     // save the informations to of the last hit of the enemy
                     this.lastEnemyHit = {
                        ...this.lastEnemyHit,
                        row: hitRow,
                        col: hitCol,
                        hitted: true
                    };
                    // call attack for enemy
                    await this.map.attack(true, $selector, "enemy");
                    this.map.checkShipsDestroyed(this.playerShips, hitRow, hitCol);
                    break;
                }
            }
        }
    }
    
    // Method that make the enemy attack, until the enemy find a ship, it just call
    // the enemyRandomAttack method, and if it find a ship, the enemy try to sink the
    // ship
    enemyAttack () {
        // declaring variables
        let hitRow = 0;
        let hitCol = 0;
        let $selector; 
        // Check if the last hit of enemy is on a ship, if it is not call the
        // the random atack, else, try to find the rest of the ship.
        if (!this.lastEnemyHit.hitted) {
            this.enemyRandomAttack ();
        }
        else {
            // Loop to find the rest of the ship
            while (true) 
            {
                // Set col and the row to the last enemy hit
                hitRow = this.lastEnemyHit.row;
                hitCol = this.lastEnemyHit.col;
                
                // If the test col of lastEnemyhit is true, test for the columns.
                // else test for the rows
                if (this.lastEnemyHit.testCol == true) {
                    // if colIncrease from lastEnemyHit is true, text next cols
                    // else test cols in the 
                    // decresing order.
                    if (this.lastEnemyHit.colIncrease == true) {
                        // if the last hitted col is equal the map size set the 
                        // colIncrease to false to test the cols in the 
                        // decresing order.
                        if (hitCol == MAP_SIZE) {
                            this.lastEnemyHit = {
                                ...this.lastEnemyHit,
                                col: hitCol,
                                colIncrease:false
                            };
                            continue;
                        }
                        // increase the col to test the next 
                        hitCol ++;
                        // Select the next 
                        $selector = $(`.droppable-player[data-row="${hitRow}"][data-col="${hitCol}"]`);
                        // test if the next is already hitted.
                        // Else set increaseCol To false to test the cols in the 
                        // decresing order.
                      
                        if (!this.map.isCellHitted($selector)) {
                            // Check if the enemy hitted the ship, and if it does,
                            // just keep going.
                            // Else change to check to test the previous cols
                            if (this.isEnemyHittedShip(hitRow, hitCol, $selector)) {
                                this.lastEnemyHit = {
                                    ...this.lastEnemyHit,
                                    col: hitCol,
                                };
                            } 
                            
                            else {
                                this.lastEnemyHit = {
                                    ...this.lastEnemyHit,
                                    col: hitCol,
                                    colIncrease:false
                                };
                            }
                            break;
                        }

                        else {
                            this.lastEnemyHit = {
                                ...this.lastEnemyHit,
                                col: hitCol,
                                colIncrease:false,
                            };
                        }
                    }
                    // Does the same logic of the cols, but decreasing the colums.
                    else {
                        if (hitCol == 1) {
                            this.lastEnemyHit = {
                                ...this.lastEnemyHit,
                                col: hitCol,
                                testRow: true,
                                testCol: false
                            };
                            continue;
                        }
                        hitCol--;
                        $selector = $(`.droppable-player[data-row="${hitRow}"][data-col="${hitCol}"]`);
                        
                        // If the enemy find something already hitted or
                        // empty, next time he will try the colums,
                        if (!this.map.isCellHitted($selector)) {
                            if (this.isEnemyHittedShip(hitRow, hitCol, $selector)) {
                                this.lastEnemyHit = {
                                    ...this.lastEnemyHit,
                                    col: hitCol,
                                };
                            } 
                            else {
                                this.lastEnemyHit = {
                                    ...this.lastEnemyHit,
                                    col: hitCol,
                                    testRow: true,
                                    testCol: false
                                };
                                this.lastEnemyHit.col++;
                            }
                            break;
                        }
                        else {
                            this.lastEnemyHit = {
                                ...this.lastEnemyHit,
                                col: hitCol
                            };
                        }
                    }
                }
                // Does the same logic from the cols to the rows, with a fell changes
                // in the next commets
                else if (this.lastEnemyHit.testRow == true) {
                    if (this.lastEnemyHit.rowIncrease == true) {
                        if (hitRow == MAP_SIZE) {
                            this.lastEnemyHit = {
                                ...this.lastEnemyHit,
                                row: hitRow,
                                rowIncrease:false
                            };
                            continue;
                        }
                        // Increase the rows 
                        hitRow ++;
                        $selector = $(`.droppable-player[data-row="${hitRow}"][data-col="${hitCol}"]`);
                        // Work the same as the cols increasing.
                        if (!this.map.isCellHitted($selector)) {
                            if (this.isEnemyHittedShip(hitRow, hitCol, $selector)) {
                                this.lastEnemyHit = {
                                    ...this.lastEnemyHit,
                                    row: hitRow,
                                };
                            } 
                            else {
                                this.lastEnemyHit = {
                                    ...this.lastEnemyHit,
                                    row: hitRow,
                                    rowIncrease:false
                                };
                            }
                            break;
                        }
                        else {
                            this.lastEnemyHit = {
                                ...this.lastEnemyHit,
                                row: hitRow,
                            };
                        }
                    }
                    else {
                        if (hitRow <= 1) {
                            this.lastEnemyHit = {
                                ...this.lastEnemyHit,
                                row: hitRow,
                                hitted: false,
                                testRow: false,
                                testCol:  true,
                                rowIncrease: true,
                                colIncrease: true
                            };
                            break;
                        }
                        hitRow--;
                        $selector = $(`.droppable-player[data-row="${hitRow}"][data-col="${hitCol}"]`);
                        if (!this.map.isCellHitted($selector)) {
                            if (this.isEnemyHittedShip(hitRow, hitCol, $selector)) {
                                this.lastEnemyHit = {
                                    ...this.lastEnemyHit,
                                    row: hitRow,
                                };
                            } 
                            // reset everything if the enemy not find the boat
                            else {
                                this.lastEnemyHit = {
                                    ...this.lastEnemyHit,
                                    row: hitRow,
                                    hitted: false,
                                    testRow: false,
                                    testCol:  true,
                                    rowIncrease: true,
                                    colIncrease: true
                                };
                            }
                            break;
                        }
                        else {
                            this.lastEnemyHit = {
                                ...this.lastEnemyHit,
                                row: hitRow,
                            };
                            continue;
                        }
                    }
                }
            }
        }
        this.map.checkVictoryCondition(this.playerShips);
    }
}