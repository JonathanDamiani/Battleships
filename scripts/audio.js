/* 
 *  Main
 *  @Copyright: (C) 2020, Jonathan 
 *  @Author: Jonathan Dean Damiani 
 *  @Version:  1.0.0
 *     
 *  @summary: Audio class 
 */
'use strict';

export class Audio {
    constructor () { 
        this.myAudio = new buzz.group([
            new buzz.sound("../sounds/explosion.wav"),
            new buzz.sound("../sounds/missil.wav"),
            new buzz.sound("../sounds/splash.wav"),
            new buzz.sound("../sounds/water.wav")
        ]);
    }
    // Returning the sounds
    getMySounds () {
        return this.myAudio;
    }
} 

