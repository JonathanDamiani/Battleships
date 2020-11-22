/*
 *  Main
 *  @Copyright: (C) 2020, Jonathan
 *  @Author: Jonathan Dean Damiani
 *  @Version:  1.0.0
 *
 *  @summary: Main class of game.
 */
'use strict';

import Map, { MAP_SIZE } from './map.js';
import Ship, { SHIP_LIST, SHIP_LIST_ENEMY } from './ship.js';
import Enemy from './enemy.js';
import { Audio }  from "./audio.js";

// Method that create a promise that receive the amount of seconds the code
// Wait, good for use with async/await to wait something happens before do
// another thing.

export const WaitSeconds = (seconds) => {
    return new Promise(resolve => setTimeout(resolve, seconds*1000));
}

class Game {

    constructor() {
        // initialize variables
        this.map;
        // Player and enemy list ships
        this.playerShipList = [];
        this.enemyShipList = [];
        this.canShipsRotate = true;

        // Player and enemy positions matrix
        this.playerMapPositions = [];
        this.enemyMapPositions = [];

        // Initialize enemy;
        this.enemy;

        $("#start-game-menu-btn").on('click', () => this.setupGameHandlers());
        $("#side-menu-btn").on('click', () => this.sideMenuController());
        $("#rules-btn").on('click', () => this.showRules());

        // Select how buttons to close screens
        let $closeBtns = $(".btn-close");

        // Add event listener to all close
        $.each(($closeBtns), (index, closeBtn) => {
            $(closeBtn).on('click', () => this.hideAssistScreens());
        })

        // Restart the screen
        $('.btn-restart').on('click', () => {
            location.reload();
        });

        // instance of audio
        this.myAudio = new Audio();

    }

    run() {
        // Splash Screen and loading
        this.transition('#splash-screen', '#menu-screen')

        // Generate list of ships creating instances of the ship class for the enemy and the player
        $.map((SHIP_LIST),(eachShip, index) => {
            this.playerShipList[index] = new Ship(eachShip.name, eachShip.size, eachShip.owner, 0, []);
        });

        $.map((SHIP_LIST_ENEMY), (eachShip, index) => {
            this.enemyShipList[index] = new Ship(eachShip.name, eachShip.size, eachShip.owner, 0 ,[]);
        });

        // Call the function to generate the matrix of the size of the game.
        this.playerMapPositions = this.generateGameFieldMatrix();
        this.enemyMapPositions = this.generateGameFieldMatrix();

        // Create the new instance of the map
        this.map = new Map (
            this.playerMapPositions,
            this.enemyMapPositions,
            this.playerShipList,
            this.enemyShipList
        );

        // Adding event listener to the button start game calling the function to start game.
        $("#start-game-btn").on('click', (() => this.map.startGame(this.playerShipList, this.enemy)));

        // Creating instance of enemy
        this.enemy = new Enemy(
            this.map,
            this.enemyMapPositions,
            this.playerMapPositions,
            this.playerShipList,
            this.enemyShipList
        );

        // Call the method to place enemy ships
        this.enemy.placeEnemyShips(this.enemyShipList);

        $("button").on('click', () => {
            this.myAudio.getMySounds().getSounds()[3].play();
        });
    }

    // Setup the game handles for the menu screen, waiting a 2 seconds load.
    async setupGameHandlers () {
        let $menuScreen = $("#menu-screen"); // Reference to menu screen.
        // wait 2 seconds to load, creating a fake load for the game.
        await this.loadingGame (WaitSeconds(.5));

        $menuScreen.addClass("hide-screen"); // Hide the game screen.
    }

    // Asynchournos function to load game, receive a promise that represent the
    // process to load, after the process finish to load hide the loading screen.
    async loadingGame (processToLoad) {
        let $loadScreen = $("#loading"); // reference to the load section.

        $loadScreen.removeClass("hide-screen"); // Add loading screen.

        await processToLoad;    // Wait process to finish.

        $loadScreen.addClass("hide-screen"); // Hide Screen.
    }

    // Control the functionalities of the side menu
    sideMenuController () {
        // reference to the button of the side menu
        let sideMenuButton = $("#side-menu-btn");
        let sideMenu = $("#side-menu"); // reference to the side menu

        // if the menu has a class to show it, remove it
        // else add it, works as a toggle.
        if (sideMenuButton.hasClass("side-menu-button--open")) {
            this.myAudio.getMySounds().getSounds()[3].play();
            sideMenuButton.removeClass("side-menu-button--open");
            sideMenu.removeClass("side-menu--open");
        }
        else {
            this.myAudio.getMySounds().getSounds()[3].play();
            sideMenuButton.addClass("side-menu-button--open");
            sideMenu.addClass("side-menu--open");
        }
    }
    // Method to show the rules screen.
    showRules () {
        let rulesScreen = $("#rules-screen");
        rulesScreen.removeClass("hide-screen");
        this.myAudio.getMySounds().getSounds()[3].play();
        this.sideMenuController();
    }

    // Method to hide all assist screens.
    hideAssistScreens () {
        let assistScreens = $(".js-assist-screen"); // reference to the screen
        // loop through the open screens, and if find any hide it.
        $.each((assistScreens), (index, eachScreen) => {
             if (!$(eachScreen).hasClass("hide-screen")) {
                $(eachScreen).addClass("hide-screen");
             }
        });
    }

    // Function to create "matrix", it simple create a array of arrays.
    generateGameFieldMatrix () {
        let myMapMatrix = [];

        for (let i = 0; i < MAP_SIZE; i++) {
            myMapMatrix[i] = [];
            for (let j = 0; j < MAP_SIZE; j++) {
                myMapMatrix[i][j] = 0;
            }
        }
        return myMapMatrix;
    }

    // Create the transiton effect
    transition (fromScreenId, toScreenId) {
        let $from = $(fromScreenId);
        let $to = $(toScreenId);
        $from.fadeOut(2000);
        $to.fadeIn(3000);
    }
}


// Wait for the DOM finish load.
$(document).ready( event => {
    let game = new Game();
    game.run();
});
