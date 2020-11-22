/*
 *  Main
 *  @Copyright: (C) 2020, Jonathan
 *  @Author: Jonathan Dean Damiani
 *  @Version:  1.0.0
 *
 *  @summary: Ship class
 */
'use strict';

/* [SH]  WET code, you cna probably find a better way to init this without copy paste */

// Creating ship list player
export const SHIP_LIST = [
    {
        name: "aircraft-carrier",
        size: 5,
        owner: "player"
    },
    {
        name: "battleship",
        size: 4,
        owner: "player"
    },
    {
        name: "cruiser",
        size: 4,
        owner: "player"
    },
    {
        name: "destroyer",
        size: 3,
        owner: "player"
    },
    {
        name: "submarine",
        size: 2,
        owner: "player"
    }
];

// Creating ship list enemy
export const SHIP_LIST_ENEMY = [
    {
        name: "aircraft-carrier-p2",
        size: 5,
        owner: "enemy",
    },
    {
        name: "battleship-p2",
        size: 4,
        owner: "enemy"
    },
    {
        name: "cruiser-p2",
        size: 4,
        owner: "enemy"
    },
    {
        name: "destroyer-p2",
        size: 3,
        owner: "enemy"
    },
    {
        name: "submarine-p2",
        size: 2,
        owner: "enemy"
    }
];


export default class Ship {
    // Contructor to the ship.
    constructor (shipSelector, shipSize, shipOwner, hitCount, shipPositions) {
        this.shipSelector = shipSelector;
        this.shipSize = shipSize;
        this.shipOwner = shipOwner;
        this.hitCount = hitCount;
        this.shipPositions = shipPositions;
    }
}