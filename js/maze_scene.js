"use strict";

import PacMan from "./pacman.js";
import Blinky from "./blinky.js";
import Pinky from "./pinky.js";
import Inky from "./inky.js";
import Clyde from "./clyde.js";
import Level from "./level.js";
import DeathScene from "./death_scene.js";

//Declare global variables used in multiple methods
let blinky, //Acrade physics sprite for Blinky
map,        //Tiled tile map
tiles,      //Used for testing purposes to keep track of tiles
mazeLayer,  //Tiled layer containing the tiles 
pelletLayer, //Tiled layer containing the pellets
energizerLocations = [{ x: 2, y: 3 }, {x: 27, y: 3}, {x: 2, y: 23}, {x: 27, y: 23}],
score = 0,
scoreText;   //Used to display the text for the score       

//Set global speed of pacman for each vector
const pacmanSpeedLeft = -200,
pacmanSpeedRight = 200,
pacmanSpeedUp = -200,
pacmanSpeedDown = 200;

export default class MazeScene extends Phaser.Scene {
    //Initialize the settings of the maze
    constructor() {
        super({ key: "MazeScene",   active: true });

        //The current level of the maze
        this.level = 1;

        //This property can be removed after testing has been completed
        this.setupComplete = false;

        //Current mode the ghost are in, depending on how much time
        //has passed in the current level
        this.currentMode = "scatter";

        //This property can be removed after testing has been completed
        this.currentTime;

        //Stores the number of seconds that have passed in the current level
        this.tick = 0;

        //Arrays that store the four scatter/chase periods
        //Each array element/period stored refers to the number of seconds ghosts
        //should be in the current mode 
        //this.scatterPeriods = [];
        //this.chasePeriods = [];

        this.tickPlaceHolder;
        this.previousMode;

        this.frightenedPlaceHolder;

        this.levels = [];
        this.levelIndex = 0;

        //Index used to keep track of the current scatter/chase period
        this.scatterIndex = 0;
        this.chaseIndex = 0;

        this.tunnelTiles = [];

        this.pelletsRemaining = 244;

        this.fruit;
        this.fruitDisplayX;
        this.fruitDisplayY;
        this.fruitTick = 0;

        this.lives;
        this.livesRemaining = 3;

        this.bonusPointsTick = 0;
        this.bonusPointsShowing = false;
        this.bonusPointsText;

        this.frightBonusPoints = [200, 400, 600, 800];
        this.frightBonusPointsIndex = 0;
        this.frightBonusPointsText;
        this.frightBonusPointsTick = 0;
        this.frightBonusPointsShowing = false;

        this.gameStarted = false;

        this.pelletsRemoved = [];

        this.chompAudio;
    }
    //Load the assets needed for the game
    preload() {
        this.load.image("tiles", "./assets/tilesets/maze_tileset.png");
        this.load.image("pellets", "./assets/pellets.png");
        this.load.tilemapTiledJSON("map", "./assets/maze_tile_map.json");
        this.load.atlas("pacman", "./assets/sprites/pacman/pac_anims.png", "./assets/sprites/pacman/pac_anims.json");
        this.load.atlas("blinky", "./assets/sprites/blinky/blinky_anims.png", "./assets/sprites/blinky/blinky_anims.json");
        this.load.atlas("pinky", "./assets/sprites/pinky/pinky_anims.png", "./assets/sprites/pinky/pinky_anims.json");
        this.load.atlas("inky", "./assets/sprites/inky/inky_anims.png", "./assets/sprites/inky/inky_anims.json");
        this.load.atlas("clyde", "./assets/sprites/clyde/clyde_anims.png", "./assets/sprites/clyde/clyde_anims.json");
        this.load.atlas("frightened", "./assets/sprites/frightened_ghost/frightened_anims.png", "./assets/sprites/frightened_ghost/frightened_anims.json");
        this.load.atlas("eyes", "./assets/sprites/eyes/eyes_anims.png", "./assets/sprites/eyes/eyes_anims.json");
        this.load.image("cherries", "./assets/sprites/fruit/cherries.png");
        this.load.image("strawberry", "./assets/sprites/fruit/strawberry.png");
        this.load.image("peach", "./assets/sprites/fruit/peach.png");
        this.load.image("apple", "./assets/sprites/fruit/apple.png");
        this.load.image("grapes", "./assets/sprites/fruit/grapes.png");
        this.load.image("galaxian", "./assets/sprites/fruit/galaxian.png");
        this.load.image("bell", "./assets/sprites/fruit/bell.png");
        this.load.image("key", "./assets/sprites/fruit/key.png");
        this.load.image("lives", "./assets/sprites/pacman/pacman_02.png");
        this.load.audio("pacman_chomp", "./assets/audio/waka.wav");
    }

    create() {
        this.chompAudio = this.sound.add("pacman_chomp");
        //Variable storing reference to the tile map
        map = this.make.tilemap({ key: "map" });

        //The parameters are the name of the tileset found in Tiled and the 
        //key of the tileset image in Phaser's cache (the name used in preload())
        const tileset = map.addTilesetImage("maze_tileset", "tiles");

        //Parameters: layer name (or index) from Tiled, tileset, x, y
        mazeLayer = map.createStaticLayer("Tile Layer", tileset, 0, 0);

        //Set the collision tiles of the maze
        mazeLayer.setCollisionByProperty({ moveable: false });

        //Add the pellets to the maze 
        const pellet = map.addTilesetImage("pellets", "pellets");
        pelletLayer = map.createDynamicLayer("Pellet Layer", pellet, 0, 0);

        let level1 = new Level(1, "cherries",   100, .8, .75, .4, 20, .8, 10, .85, .9, .5, [7, 7, 5, 5], [20, 20, 20, Infinity], 6, 174, 214, 154);
        let level2 = new Level(2, "strawberry", 300, .9, .85, .45, 30, .9, 15, .95, .95, .55, [7, 7, 5, 1/60], [20, 20, 1033, Infinity], 5, 74, 244, 164);
        let level3 = new Level(3, "peach",      500, .9, .85, .45, 40, .9, 20, .95, .95, .55, [7, 7, 5, 1/60], [20, 20, 1033, Infinity], 4, 74, 244, 244);
        let level4 = new Level(4, "peach",      500, .9, .85, .45, 40, .9, 20, .95, .95, .55, [7, 7, 5, 1/60], [20, 20, 1033, Infinity], 3, 74, 244, 244);
        let level5 = new Level(5, "apple",      700, 1, .95, .5, 40, 1, 20, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 2, 74, 244, 244);
        let level6 = new Level(6, "apple",      700, 1, .95, .5, 50, 1, 25, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 2, 74, 244, 244);
        let level7 = new Level(7, "grapes",     1000, 1, .95, .5, 50, 1, 25, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 2, 74, 244, 244);
        let level8 = new Level(8, "grapes",     1000, 1, .95, .5, 50, 1, 25, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 2, 74, 244, 244);
        let level9 = new Level(9, "galaxian",   2000, 1, .95, .5, 60, 1, 30, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level10 = new Level(10, "galaxian", 2000, 1, .95, .5, 60, 1, 30, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level11 = new Level(11, "bell",     3000, 1, .95, .5, 60, 1, 30, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level12 = new Level(12, "bell",     3000, 1, .95, .5, 80, 1, 40, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level13 = new Level(13, "key",      5000, 1, .95, .5, 80, 1, 40, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level14 = new Level(14, "key",      5000, 1, .95, .5, 80, 1, 40, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level15 = new Level(15, "key",      5000, 1, .95, .5, 100, 1, 50, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level16 = new Level(16, "key",      5000, 1, .95, .5, 100, 1, 50, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level17 = new Level(17, "key",      5000, 1, .95, .5, 100, 1, 50, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level18 = new Level(18, "key",      5000, 1, .95, .5, 100, 1, 50, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level19 = new Level(19, "key",      5000, 1, .95, .5, 120, 1, 60, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level20 = new Level(20, "key",      5000, 1, .95, .5, 120, 1, 60, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        let level21 = new Level(21, "key",      5000, 1, .95, .5, 120, 1, 60, 1.05, 1, .6, [5, 5, 5, 1/60], [20, 20, 1037, Infinity], 1, 74, 244, 244);
        this.levels.push(level1, level2, level3, level4, level5, level6, level7, level8, level9, level10, level11, level12, level13, level14,
                         level15, level16, level17, level18, level19, level20, level21);

        this.tunnelTiles = [mazeLayer.getTileAt(1, 14), mazeLayer.getTileAt(2, 14), mazeLayer.getTileAt(3, 14), 
                            mazeLayer.getTileAt(2, 14), mazeLayer.getTileAt(5, 14), mazeLayer.getTileAt(24, 14), 
                            mazeLayer.getTileAt(25, 14), mazeLayer.getTileAt(26, 14), mazeLayer.getTileAt(27, 14),
                            mazeLayer.getTileAt(28, 14)];

        //Find and store Pac-Man's starting location
        const pacmanStartX = mazeLayer.getTileAt(15, 23).pixelX + 3,
              pacmanStartY = mazeLayer.getTileAt(15, 23).pixelY + 8;

        //Instantiate Pac-Man at the starting location
        this.pacman = new PacMan(this, mazeLayer, pacmanStartX, pacmanStartY);

        //Collision for Pac-Man and the "non-moveable" tiles
        this.physics.add.collider(this.pacman.sprite, mazeLayer);

        //Collision for Pac-Man and the world's boundaries
        this.pacman.sprite.setCollideWorldBounds(true); 

        //Find and store each ghost's starting location
        const blinkyStartX = mazeLayer.getTileAt(15, 11).pixelX,
              blinkyStartY = mazeLayer.getTileAt(15, 11).pixelY + 8;

        const pinkyStartX = mazeLayer.getTileAt(15, 14).pixelX,
              pinkyStartY = mazeLayer.getTileAt(15, 14).pixelY + 8;

        const inkyStartX = mazeLayer.getTileAt(13, 14).pixelX,
              inkyStartY = mazeLayer.getTileAt(13, 14).pixelY + 8;

        const clydeStartX = mazeLayer.getTileAt(17, 14).pixelX,
              clydeStartY = mazeLayer.getTileAt(17, 14).pixelY + 8;

        //Instantiate Blinky at the starting location
        this.blinky = new Blinky(this, mazeLayer, blinkyStartX, blinkyStartY);
        this.pinky = new Pinky(this, mazeLayer, pinkyStartX, pinkyStartY);
        this.inky = new Inky(this, mazeLayer, inkyStartX, inkyStartY);
        this.clyde = new Clyde(this, mazeLayer, clydeStartX, clydeStartY);
        
        //Used for testing purposes, for an easy way of looking
        //at all of the tiles in the layer map
        tiles = map.layers[0].data;

        //Used for testing purposes, for viewing tiles 
        //map.setCollision([30, 41]);

        //Uncomment below to view tiles in console
        //console.log(tiles);

        //Used for testing purposes, for visually debugging collision tiles
        const debugGraphics = this.add.graphics().setAlpha(0.75);

        /*  mazeLayer.renderDebug(debugGraphics, {
            tileColor: null, // Color of non-colliding tiles
            collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
            faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
        });  */

        //Display the score
        scoreText = this.add.text(30, 520, "Score: " + score, { fontFamily: 'emulogic, Verdana, "Times New Roman", Tahoma, serif', fontSize: "12px"});

        //Every second setCurrentMode() is called to determine how many seconds have passed and what mode the ghosts should be in
        this.currentTime = this.time.addEvent({ delay: 1000, callback: this.setCurrentMode, callbackScope: this, loop: true });

        //Initialize the four scatter and chase periods for level 1
        //this.scatterPeriods = [7, 7, 5, 5];
        //this.chasePeriods = [20, 20, 20, Infinity];

        this.fruitDisplayX = mazeLayer.getTileAt(15, 17).pixelX;
        this.fruitDisplayY = mazeLayer.getTileAt(15, 17).pixelY + 8;

        this.fruit = this.add.image(this.fruitDisplayX, this.fruitDisplayY, this.levels[this.levelIndex].fruit);
        this.fruit.setVisible(0);

        //this.add.text(200, 272, "READY!", {fontFamily: 'emulogic, Verdana, "Times New Roman", Tahoma, serif', fontSize: "14px"}).setColor("#f6f91d");

        this.lives = this.add.image(0, 0, "lives");
        this.lives.setVisible(0);

        this.bonusPointsText = this.add.text(mazeLayer.getTileAt(14, 17).pixelX + 2, mazeLayer.getTileAt(14, 17).pixelY + 8, this.levels[this.levelIndex].bonusPoints, 
                               { fontFamily: 'emulogic, Verdana, "Times New Roman", Tahoma, serif', fontSize: "8px" }).setColor("#ff87a5");
        this.bonusPointsText.setVisible(0);

        this.frightBonusPointsText = this.add.text(mazeLayer.getTileAt(16, 1).pixelX, mazeLayer.getTileAt(16, 1).pixelY, this.frightBonusPoints[this.frightBonusPointsIndex], 
                                     { fontFamily: 'emulogic, Verdana, "Times New Roman", Tahoma, serif', fontSize: "8px" }).setColor("#1cb3ff");
        this.frightBonusPointsText.setVisible(0);

        //Reset the direction the Ghosts are looking in
        this.blinky.reset();
        this.pinky.reset();
        this.inky.reset();
        this.clyde.reset();

        if (this.pelletsRemoved.length > 0) {
            this.removePellets();
        }
    }

    //This function returns the tile Pac-Man's center is currently occupying
    //Returns: the x and y Tiled coordinates of the tile Pac-man is currently occupying
    findCharacter(character) {
        let currentTile;

        if (character == this.pacman.sprite) {
            //Uses the width and height of each tile in its search
            currentTile = mazeLayer.findTile(function (tile) {
                //If Pac-Man's center coords are within the current tile's area
                if (character.x >= tile.pixelX && character.x <= tile.pixelX + 16 && character.y >= tile.pixelY && character.y <= tile.pixelY + 16) {
                    return tile;
                }
            });

            if (currentTile == null) { return null };

            //Return the occupied tile if the tile is not equal to null
            return {x: currentTile.x, y: currentTile.y};
        }
        else if (character == blinky) {
            //Uses the width and height of each tile in its search
            currentTile = mazeLayer.findTile(function (tile) {
                //If Blinky's center coords are within the current tile's area
                if (blinky.x >= tile.pixelX && blinky.x <= tile.pixelX + 16 && blinky.y >= tile.pixelY && blinky.y <= tile.pixelY + 16) {
                    return tile;
                }
            });

            //Return null if the current tile the character occupies is invalid
            if (currentTile == null) { return null };

            //Return the occupied tile if the tile is not equal to null
            return {x: currentTile.x, y: currentTile.y};
        }
    }

    //This function updates the value stored in score and updates
    //the display to reflect this
    //Args: pelletType - The type of pellet eaten by Pac-Man
    updateScore(pelletType) {
        if (pelletType == "small") {
            score += 10;
            scoreText.setText("Score: " + score);
        }
        else if (pelletType == "large") {
            score += 50;
            scoreText.setText("Score: " + score);
        }
    }

    //Listener function that player's updates the score depending on which type of pellet 
    //was eaten by Pac-Man
    updatePellet() {
        //If Pac-Man is occupying a tile with a pellet
        if (pelletLayer.getTileAt(this.findCharacter(this.pacman.sprite).x, this.findCharacter(this.pacman.sprite).y) != null) {
            //If Pac-Man has eaten an energizer
            if (energizerLocations.some(e => e.x === this.findCharacter(this.pacman.sprite).x && e.y === this.findCharacter(this.pacman.sprite).y)) {
                this.updateScore("large");

                if (this.currentMode != "frightened") {
                    if (this.blinky.isInside == false) {
                        this.blinky.modeChanged = true;
                    }

                    if (this.pinky.isInside == false) {
                        this.pinky.modeChanged = true;
                    }

                    if (this.inky.isInside == false) {
                        this.inky.modeChanged = true;
                    }

                    if (this.clyde.isInside == false) {
                        this.clyde.modeChanged = true;
                    }
                    
                    this.previousMode = this.currentMode;
                    this.tickPlaceHolder = this.tick;
                    this.tick = 0;
                    this.currentMode = "frightened";
                }
                else {
                    this.blinky.flash = false;
                    this.pinky.flash = false;
                    this.inky.flash = false;
                    this.clyde.flash =false;
                    this.tick = 0;
                }
                
                this.pelletsRemaining -= 1;
            }
            //If Pac-Man has eaten a normal pellet
            else {
                
                /* if (this.chompAudio.isPlaying == false) {
                    this.chompAudio.play({loop: false});
                }
                
                console.log(this.chompAudio); */
                
                this.updateScore("small");
                this.pacman.pelletsEaten += 1;
                this.pelletsRemaining -= 1;
            }

            //New stuff below
            let pelletTile = pelletLayer.getTileAt(this.findCharacter(this.pacman.sprite).x, this.findCharacter(this.pacman.sprite).y);
            pelletLayer.removeTileAt(pelletTile.x, pelletTile.y)
            this.pelletsRemoved.push(pelletTile);
            
            //Old stuff below
            //Remove the pellet after Pac-Man has eaten it
            //pelletLayer.removeTileAt(this.findCharacter(this.pacman.sprite).x, this.findCharacter(this.pacman.sprite).y)
        }
        /* else {
            if (this.chompAudio.isPlaying == true) {
                this.chompAudio.pause();
            }
        } */
    }

    //This function allows Pac-Man to use the "warp tiles" and travel to
    //opposite ends of the maze
    warpCharacter(character) {
        if (character == this.pacman) {
            //If Pac-Man is located at the "warp tile" on the left side of the maze
            if(this.findCharacter(this.pacman.sprite).x == 0 && this.findCharacter(this.pacman.sprite).y == 14) {
                this.pacman.sprite.x = mazeLayer.getTileAt(29, 14).pixelX;
                this.pacman.sprite.y = mazeLayer.getTileAt(29, 14).pixelY +8;
            }
            //If Pac-Man is located at the "warp tile" on the right side of the maze
            else if(this.findCharacter(this.pacman.sprite).x == 29 && this.findCharacter(this.pacman.sprite).y == 14) {
                this.pacman.sprite.x = mazeLayer.getTileAt(1, 14).pixelX;
                this.pacman.sprite.y == mazeLayer.getTileAt(1, 14).pixelY;
            }
        }
    }

    update(time, delta) {
        if (this.gameStarted == false) {
            this.startReadyScene();
            this.gameStarted = true;
        }

        if (this.pelletsRemaining == 0) {
            this.levelIndex += 1;
            this.pelletsRemoved = [];
            this.clearLevel();
            this.scene.restart();
            this.startReadyScene();
        }

        this.displayLives();

        this.checkIdleState();
        
        this.setBaseSpeed();

        this.checkElroy();
        this.setElroySpeed();
        
        this.checkTunnel();
        this.setTunnelSpeed();

        if (this.currentMode == "frightened") {
            this.setFrightSpeed();
        }

        this.checkCollision();

        this.displayFruit();
        this.checkFruit();

        if (this.blinky.isInside == false && this.blinky.mode != "eyes" && this.blinky.recentlyEaten == false) {
            this.blinky.setMode(this.currentMode);
        }

        if (this.blinky.recentlyEaten == true && this.blinky.mode != "eyes" && this.blinky.mode != "enter" && this.blinky.mode != "exit") {
            this.blinky.setMode("chase");
            this.blinky.recentlyEaten = false;
        }

        if (this.pinky.isInside == false && this.pinky.mode != "eyes" && this.pinky.recentlyEaten == false) {
            this.pinky.setMode(this.currentMode);
        }

        if (this.pinky.recentlyEaten == true && this.pinky.mode != "eyes" && this.pinky.mode != "enter" && this.pinky.mode != "exit") {
            this.pinky.setMode("chase");
            this.pinky.recentlyEaten = false;
        }

        if (this.inky.isInside == false && this.inky.mode != "eyes" && this.inky.recentlyEaten == false) {
            this.inky.setMode(this.currentMode);
        }

        if (this.inky.recentlyEaten == true && this.inky.mode != "eyes" && this.inky.mode != "enter" && this.inky.mode != "exit") {
            this.inky.setMode("chase");
            this.inky.recentlyEaten = false;
        }

        if (this.clyde.isInside == false && this.clyde.mode != "eyes" && this.clyde.recentlyEaten == false) {
            this.clyde.setMode(this.currentMode);
        }

        if (this.clyde.recentlyEaten == true && this.clyde.mode != "eyes" && this.clyde.mode != "enter" && this.clyde.mode != "exit") {
            this.clyde.setMode("chase");
            this.clyde.recentlyEaten = false;
        }
        
        //Uncomment below to view the number of seconds that have passed in the current period/mode
        //console.log(this.tick);
        
        //Below used for testing.
        if (this.setupComplete == false) {
            this.inky.setMode("idle");
            this.clyde.setMode("idle");
            this.setupComplete = true;
        }

        //Set the settings for each level
        //this.levelSettings(this.level);

        //Update Pac-Man
        this.pacman.update();

        //Allows Pac-Man to use the 2 warp tiles
        this.warpCharacter(this.pacman);

        //Update the score and remove pellets if eaten
        this.updatePellet();

        //Set the ghosts target tiles depending on which mode they're on
        if (this.blinky.mode == "scatter") {
            this.blinky.setTargetTile(this.blinky.scatterTile);
        }
        else if (this.blinky.mode == "chase") {
            this.blinky.chase(this.findCharacter(this.pacman.sprite));
        }
        else if (this.blinky.mode == "eyes") {
            this.blinky.sprite.setVisible(1);
            if (mazeLayer.getTileAtWorldXY(this.blinky.sprite.x + 8, this.blinky.sprite.y) == mazeLayer.getTileAt(15, 11)) {
                this.blinky.sprite.body.reset(mazeLayer.getTileAt(15 , 11).pixelX, mazeLayer.getTileAt(15, 11).pixelY + 8);
                this.blinky.setMode("enter");                
            }
            this.blinky.setTargetTile(mazeLayer.getTileAt(15, 11));
        }

        if (this.pinky.mode == "scatter") {
            this.pinky.setTargetTile(this.pinky.scatterTile);
        }
        else if (this.pinky.mode == "chase") {
            this.pinky.chase(this.findCharacter(this.pacman.sprite), this.pacman.movingDirection);
        }
        else if (this.pinky.mode == "eyes") {
            this.pinky.sprite.setVisible(1);
            if (mazeLayer.getTileAtWorldXY(this.pinky.sprite.x + 8, this.pinky.sprite.y) == mazeLayer.getTileAt(15, 11)) {
                this.pinky.sprite.body.reset(mazeLayer.getTileAt(15 , 11).pixelX, mazeLayer.getTileAt(15, 11).pixelY + 8);
                this.pinky.setMode("enter");                
            }
            this.pinky.setTargetTile(mazeLayer.getTileAt(15, 11));
        }

        if (this.inky.mode == "scatter") {
            this.inky.setTargetTile(this.inky.scatterTile);
        }
        else if (this.inky.mode == "chase") {
            this.inky.chase(this.findCharacter(this.pacman.sprite), this.pacman.movingDirection, mazeLayer.getTileAtWorldXY(this.blinky.sprite.x, this.blinky.sprite.y));
        }
        else if (this.inky.mode == "eyes") {
            this.inky.sprite.setVisible(1);
            if (mazeLayer.getTileAtWorldXY(this.inky.sprite.x + 8, this.inky.sprite.y) == mazeLayer.getTileAt(15, 11)) {
                this.inky.sprite.body.reset(mazeLayer.getTileAt(15 , 11).pixelX, mazeLayer.getTileAt(15, 11).pixelY + 8);
                this.inky.setMode("enter");                
            }
            this.inky.setTargetTile(mazeLayer.getTileAt(15, 11));
        }

        if (this.clyde.mode == "scatter") {
            this.clyde.setTargetTile(this.clyde.scatterTile);
        }
        else if (this.clyde.mode == "chase") {
            this.clyde.chase(this.findCharacter(this.pacman.sprite));
        }
        else if (this.clyde.mode == "eyes") {
            this.clyde.sprite.setVisible(1);
            if (mazeLayer.getTileAtWorldXY(this.clyde.sprite.x + 8, this.clyde.sprite.y) == mazeLayer.getTileAt(15, 11)) {
                this.clyde.sprite.body.reset(mazeLayer.getTileAt(15 , 11).pixelX, mazeLayer.getTileAt(15, 11).pixelY + 8);
                this.clyde.setMode("enter");
            }
            this.clyde.setTargetTile(mazeLayer.getTileAt(15, 11));
        }

        //Call each ghost's update function
        this.blinky.update();
        this.pinky.update();
        this.inky.update();
        this.clyde.update();
        
    }

    displayLives() {
        /* if (this.livesRemaining > 0) {
            for (let i = 0; i < this.livesRemaining; i++) {
                this.lives = 
            }
        } */
    }

    setBaseSpeed() {
        this.pacman.speed = this.levels[this.levelIndex].pacmanSpeed * this.pacman.maxSpeed;

        this.blinky.speed = this.levels[this.levelIndex].ghostSpeed * this.pacman.maxSpeed;
        this.pinky.speed = this.levels[this.levelIndex].ghostSpeed * this.pacman.maxSpeed;
        this.inky.speed = this.levels[this.levelIndex].ghostSpeed * this.pacman.maxSpeed;
        this.clyde.speed = this.levels[this.levelIndex].ghostSpeed * this.pacman.maxSpeed;
    }

    setTunnelSpeed() {
        if (this.blinky.inTunnel == true) {
            this.blinky.speed = this.levels[this.levelIndex].tunnelSpeed * this.pacman.maxSpeed;
        }

        if (this.pinky.inTunnel == true) {
            this.pinky.speed = this.levels[this.levelIndex].tunnelSpeed * this.pacman.maxSpeed;
        }

        if (this.inky.inTunnel == true) {
            this.inky.speed = this.levels[this.levelIndex].tunnelSpeed * this.pacman.maxSpeed;
        }

        if (this.clyde.inTunnel == true) {
            this.clyde.speed = this.levels[this.levelIndex].tunnelSpeed * this.pacman.maxSpeed;
        }
    }

    checkIdleState() {
        if (this.inky.mode == "idle" && this.levels[this.levelIndex].inkyPelletAmount == this.pelletsRemaining) {
            this.inky.setMode("exit");
        }

        if (this.clyde.mode == "idle" && this.levels[this.levelIndex].clydePelletAmount == this.pelletsRemaining) {
            this.clyde.setMode("exit");
        }
    }

    checkTunnel() {
        if(this.tunnelTiles.some(e => e === mazeLayer.getTileAtWorldXY(this.blinky.sprite.x, this.blinky.sprite.y))) {
            this.blinky.inTunnel = true;
        }
        else {
            this.blinky.inTunnel = false;
        }

        if(this.tunnelTiles.some(e => e === mazeLayer.getTileAtWorldXY(this.pinky.sprite.x, this.pinky.sprite.y))) {
            this.pinky.inTunnel = true;
        }
        else {
            this.pinky.inTunnel = false;
        }

        if(this.tunnelTiles.some(e => e === mazeLayer.getTileAtWorldXY(this.inky.sprite.x, this.inky.sprite.y))) {
            this.inky.inTunnel = true;
        }
        else {
            this.inky.inTunnel = false;
        }

        if(this.tunnelTiles.some(e => e === mazeLayer.getTileAtWorldXY(this.clyde.sprite.x, this.clyde.sprite.y))) {
            this.clyde.inTunnel = true;
        }
        else {
            this.clyde.inTunnel = false;
        }
    }

    setFrightSpeed() {
        this.pacman.speed = this.levels[this.levelIndex].pacmanFrightSpeed * this.pacman.maxSpeed;

        this.blinky.speed = this.levels[this.levelIndex].ghostFrightSpeed * this.pacman.maxSpeed;
        this.pinky.speed = this.levels[this.levelIndex].ghostFrightSpeed * this.pacman.maxSpeed;
        this.inky.speed = this.levels[this.levelIndex].ghostFrightSpeed * this.pacman.maxSpeed;
        this.clyde.speed = this.levels[this.levelIndex].ghostFrightSpeed * this.pacman.maxSpeed;
    }

    checkElroy() {
        if (this.pelletsRemaining == this.levels[this.levelIndex].elroyOneDotsLeft) {
            this.blinky.elroyOneStarted = true;
        }

        if (this.blinky.elroyOneStarted == true &&
            this.pelletsRemaining == this.levels[this.levelIndex].elroyTwoDotsLeft) {
                this.blinky.elroyTwoStarted = true;
        }
    }

    setElroySpeed() {
        if (this.blinky.elroyOneStarted == true && this.blinky.elroyTwoStarted == false) {
            this.blinky.speed = this.levels[this.levelIndex].elroyOneSpeed * this.pacman.maxSpeed;
        }
        else if (this.blinky.elroyOneStarted == true && this.blinky.elroyTwoStarted == true) {
            this.blinky.speed = this.levels[this.levelIndex].elroyTwoSpeed * this.pacman.maxSpeed;
        }
    }

    displayFruit() {
        if (this.pelletsRemaining <= this.levels[this.levelIndex].fruitDotsLeft && 
            this.levels[this.levelIndex].fruitDisplayed == false &&
            this.levels[this.levelIndex].fruitTimeout == false && 
            this.levels[this.levelIndex].fruitEaten == false) 
        {
            this.levels[this.levelIndex].fruitDisplayed = true;
            this.fruit.setVisible(1);
        }
    }

    displayBonusPoints() {
        this.bonusPointsText.setVisible(1);
    }

    displayFrightBonusPoints(tile) {
        this.frightBonusPointsText.setPosition(tile.pixelX, tile.pixelY);
        this.frightBonusPointsText.setVisible(1);
        this.frightBonusPointsShowing = true;
    }

    checkFruit() {
        let pacmanTile = this.findCharacter(this.pacman.sprite);

        if ((mazeLayer.getTileAt(pacmanTile.x, pacmanTile.y) == mazeLayer.getTileAt(14, 17) ||
            mazeLayer.getTileAt(pacmanTile.x, pacmanTile.y) == mazeLayer.getTileAt(15, 17)) &&
            this.levels[this.levelIndex].fruitDisplayed == true &&
            this.levels[this.levelIndex].fruitEaten == false && 
            this.levels[this.levelIndex].fruitTimeout== false) 
        {
            this.fruit.setVisible(0);
            this.levels[this.levelIndex].fruitDisplayed = false;
            this.levels[this.levelIndex].fruitEaten = true;
            score += this.levels[this.levelIndex].bonusPoints;
            scoreText.setText("Score: " + score);
            this.bonusPointsShowing = true;
            this.bonusPointsText.setVisible(1);
        }
    }
    
    //Testing function used to "hide" the ghost only visually
    hide(character) {
        character.sprite.setVisible(0);
    }

    //This function use the tick property to determine how many seconds have passed
    //and uses the value stored in tick to determine which mode ghosts should be in
    setCurrentMode() {
        if (this.levels[this.levelIndex].fruitDisplayed == true) {
            this.fruitTick += 1;

            if (this.fruitTick == 9) {
                this.levels[this.levelIndex].fruitDisplayed = false;
                this.levels[this.levelIndex].fruitTimeout = true;
                this.fruit.setVisible(0);
            }
        }

        if (this.bonusPointsShowing == true) {
            this.bonusPointsTick += 1;

            if (this.bonusPointsTick == 2) {
                this.bonusPointsShowing = false;
                this.bonusPointsText.setVisible(0);
            }
        }

        if (this.frightBonusPointsShowing == true) {
            this.frightBonusPointsTick += 1;

            if (this.frightBonusPointsTick == 2) {
                this.frightBonusPointsShowing = false;
                this.frightBonusPointsText.setVisible(0);
                this.frightBonusPointsTick = 0;
            }
        }

        if (this.currentMode == "frightened") {
            this.tick += 1;
            if (this.levels[this.levelIndex].frightTime <= 2) {
                this.blinky.flash = true;
                this.pinky.flash = true;
                this.inky.flash = true;
                this.clyde.flash = true;
            }
            else if (this.tick >= this.levels[this.levelIndex].frightTime - 2) {
                this.blinky.flash = true;
                this.pinky.flash = true;
                this.inky.flash = true;
                this.clyde.flash = true;
            }

            if (this.tick == this.levels[this.levelIndex].frightTime) {
                this.currentMode = this.previousMode;
                this.blinky.flash = false;
                this.pinky.flash = false;
                this.inky.flash = false;
                this.clyde.flash = false;

                this.tick = this.tickPlaceHolder;
                this.pinky.recentlyEaten = false;
                this.blinky.recentlyEaten = false;
                this.inky.recentlyEaten = false;
                this.clyde.recentlyEaten = false;
            }
        }
        else if (this.currentMode == "frozen") {
            this.tick += 1;

            if (this.tick == 2) {
                this.currentMode = "frightened";
                this.tick = this.frightenedPlaceHolder;
                //this.pinky.setMode("eyes");
                
                //this.pinky.recentlyEaten = true;

                if (this.blinky.sprite.visible == false) {
                    this.blinky.setMode("eyes");
                }

                if (this.pinky.sprite.visible == false) {
                    this.pinky.setMode("eyes");
                }

                if (this.inky.sprite.visible == false) {
                    this.inky.setMode("eyes");
                }

                if (this.clyde.sprite.visible == false) {
                    this.clyde.setMode("eyes");
                }

                this.pacman.sprite.setVisible(1);
                this.pacman.sprite.body.velocity.x = this.pacman.placeHolderVelocityX;
                this.pacman.sprite.body.velocity.y = this.pacman.placeHolderVelocityY;
                this.pacman.mode = "";
            }
        }
        else {
            //Increment tick by 1 to store the number of seconds that have passed in the current mode
            this.tick += 1;

            //Switch the current mode to chase, if the ghosts have been in scatter mode for the pre-defined
            //scatter period
            if (this.currentMode == "scatter" && this.tick == this.levels[this.levelIndex].scatterPeriods[this.scatterIndex]) {
                this.currentMode = "chase";

                //Reset tick and go to the next period
                this.tick = 0;
                this.scatterIndex += 1;
            }
            //Switch the current mode to scatter, if the ghosts have been in chase mode for the pre-defined
            //scatter period
            else if (this.currentMode == "chase" && this.tick == this.levels[this.levelIndex].chasePeriods[this.chaseIndex]) {
                this.currentMode = "scatter";

                //Reset tick and go to the next period
                this.tick = 0;
                this.chaseIndex += 1;
            }
        }
    }

    checkCollision() {
        let distanceBlinky = Phaser.Math.Distance.Between(this.pacman.center.x, this.pacman.center.y, this.blinky.center.x, this.blinky.center.y);
        let distancePinky = Phaser.Math.Distance.Between(this.pacman.center.x, this.pacman.center.y, this.pinky.center.x, this.pinky.center.y);
        let distanceInky = Phaser.Math.Distance.Between(this.pacman.center.x, this.pacman.center.y, this.inky.center.x, this.inky.center.y); 
        let distanceClyde = Phaser.Math.Distance.Between(this.pacman.center.x, this.pacman.center.y, this.clyde.center.x, this.clyde.center.y); 

        if (distanceBlinky < 15) {
            if (this.currentMode == "frightened" && this.blinky.mode == "frightened") {
                this.frightenedPlaceHolder = this.tick;
                this.tick = 0;
                this.currentMode = "frozen";
                this.pacman.placeHolderVelocityX = this.pacman.sprite.body.velocity.x;
                this.pacman.placeHolderVelocityY = this.pacman.sprite.body.velocity.y;
                this.pacman.mode = "frozen";
                this.blinky.recentlyEaten = true;
                this.hide(this.blinky);
                this.hide(this.pacman);
                this.displayFrightBonusPoints(mazeLayer.getTileAtWorldXY(this.blinky.sprite.x, this.blinky.sprite.y));
                score += this.frightBonusPoints[this.frightBonusPointsIndex];
                scoreText.setText("Score: " + score);
            }
            else if (this.blinky.mode != "frozen" && this.blinky.mode != "eyes" && this.blinky.sprite.visible == true && this.blinky.mode != "enter"){
                this.resumeLevel();
                
                this.scene.restart();
                this.scene.pause();
                
                this.scene.launch("DeathScene", { pacman: this.pacman, blinky: this.blinky, pinky: this.pinky, inky: this.inky, clyde: this.clyde });
            }
            else if (this.blinky.sprite.visible == false && this.currentMode != "frightened" && this.currentMode != "frozen") {
                this.blinky.sprite.setVisible(1);
            }
        }
        
        if (distancePinky < 15) {
            if (this.currentMode == "frightened" && this.pinky.mode == "frightened") {
                this.frightenedPlaceHolder = this.tick;
                this.tick = 0;
                this.currentMode = "frozen";
                this.pacman.placeHolderVelocityX = this.pacman.sprite.body.velocity.x;
                this.pacman.placeHolderVelocityY = this.pacman.sprite.body.velocity.y;
                this.pacman.mode= "frozen";
                this.pinky.recentlyEaten = true;
                this.hide(this.pinky);
                this.hide(this.pacman);
                this.displayFrightBonusPoints(mazeLayer.getTileAtWorldXY(this.pinky.sprite.x, this.pinky.sprite.y));
                score += this.frightBonusPoints[this.frightBonusPointsIndex];
                scoreText.setText("Score: " + score);
            }
            /* else if (this.pinky.mode != "frozen" && this.pinky.mode != "eyes" && this.pinky.sprite.visible == true && this.pinky.mode != "enter"){
                throw new Error();
            } */
            else if (this.pinky.mode != "frozen" && this.pinky.mode != "eyes" && this.pinky.sprite.visible == true && this.pinky.mode != "enter"){
                this.resumeLevel();
                
                this.scene.restart();
                this.scene.pause();
                
                this.scene.launch("DeathScene", { pacman: this.pacman, blinky: this.blinky, pinky: this.pinky, inky: this.inky, clyde: this.clyde });
            }
            else if (this.pinky.sprite.visible == false && this.currentMode != "frightened" && this.currentMode != "frozen") {
                this.pinky.sprite.setVisible(1);
            }
        }

        if (distanceInky < 15) {
            if (this.currentMode == "frightened" && this.inky.mode == "frightened") {
                this.frightenedPlaceHolder = this.tick;
                this.tick = 0;
                this.currentMode = "frozen";
                this.pacman.placeHolderVelocityX = this.pacman.sprite.body.velocity.x;
                this.pacman.placeHolderVelocityY = this.pacman.sprite.body.velocity.y;
                this.pacman.mode= "frozen";
                this.inky.recentlyEaten = true;
                this.hide(this.inky);
                this.hide(this.pacman);
                this.displayFrightBonusPoints(mazeLayer.getTileAtWorldXY(this.inky.sprite.x, this.inky.sprite.y));
                score += this.frightBonusPoints[this.frightBonusPointsIndex];
                scoreText.setText("Score: " + score);
            }
            /* else if (this.inky.mode != "frozen" && this.inky.mode != "eyes" && this.inky.sprite.visible == true && this.inky.mode != "enter"){
                throw new Error();
            } */
            else if (this.inky.mode != "frozen" && this.inky.mode != "eyes" && this.inky.sprite.visible == true && this.inky.mode != "enter"){
                this.resumeLevel();
                
                this.scene.restart();
                this.scene.pause();
                
                this.scene.launch("DeathScene", { pacman: this.pacman, blinky: this.blinky, pinky: this.pinky, inky: this.inky, clyde: this.clyde });
            }
            else if (this.inky.sprite.visible == false && this.currentMode != "frightened" && this.currentMode != "frozen") {
                this.inky.sprite.setVisible(1);
            }

        }

        if (distanceClyde < 15) {
            if (this.currentMode == "frightened" && this.clyde.mode == "frightened") {
                this.frightenedPlaceHolder = this.tick;
                this.tick = 0;
                this.currentMode = "frozen";
                this.pacman.placeHolderVelocityX = this.pacman.sprite.body.velocity.x;
                this.pacman.placeHolderVelocityY = this.pacman.sprite.body.velocity.y;
                this.pacman.mode= "frozen";
                this.clyde.recentlyEaten = true;
                this.hide(this.clyde);
                this.hide(this.pacman);
                this.displayFrightBonusPoints(mazeLayer.getTileAtWorldXY(this.clyde.sprite.x, this.clyde.sprite.y));
                score += this.frightBonusPoints[this.frightBonusPointsIndex];
                scoreText.setText("Score: " + score);
            }
            /* else if (this.clyde.mode != "frozen" && this.clyde.mode != "eyes" && this.clyde.sprite.visible == true && this.clyde.mode != "enter"){
                throw new Error();
            } */
            else if (this.clyde.mode != "frozen" && this.clyde.mode != "eyes" && this.clyde.sprite.visible == true && this.clyde.mode != "enter"){
                this.resumeLevel();
                
                this.scene.restart();
                this.scene.pause();
                
                this.scene.launch("DeathScene", { pacman: this.pacman, blinky: this.blinky, pinky: this.pinky, inky: this.inky, clyde: this.clyde });
            }
            else if (this.clyde.sprite.visible == false && this.currentMode != "frightened" && this.currentMode != "frozen") {
                this.clyde.sprite.setVisible(1);
            }
        }
    }

    resumeLevel() {
        this.tick = 0;
        this.scatterIndex = 0;
        this.chaseIndex = 0;
        this.currentMode = "scatter";
        this.removePellets();
        
        
        /* const blinkyStartX = mazeLayer.getTileAt(15, 11).pixelX,
              blinkyStartY = 

        const pinkyStartX = mazeLayer.getTileAt(15, 14).pixelX,
              pinkyStartY = mazeLayer.getTileAt(15, 14).pixelY + 8;

        const inkyStartX = mazeLayer.getTileAt(13, 14).pixelX,
              inkyStartY = mazeLayer.getTileAt(13, 14).pixelY + 8;

        const clydeStartX = mazeLayer.getTileAt(17, 14).pixelX,
              clydeStartY = mazeLayer.getTileAt(17, 14).pixelY + 8; */
    }

    clearLevel() {
        this.tick = 0;
        this.scatterIndex = 0;
        this.chaseIndex = 0;
        this.pelletsRemaining = 244;
        this.fruitTick = 0;
        this.currentMode = "scatter";
        this.bonusPointsTick = 0;
        this.bonusPointsShowing = false;
        this.frightenedPlaceHolder = 0;
    }

    startReadyScene() {
        this.scene.pause();
        this.scene.launch("ReadyScene", { pacman: this.pacman, blinky: this.blinky, pinky: this.pinky, inky: this.inky, clyde: this.clyde });
    }

    removePellets() {
        for (let i = 0; i < this.pelletsRemoved.length; i++) {
            pelletLayer.removeTileAt(this.pelletsRemoved[i].x, this.pelletsRemoved[i].y);
        }
        
    }

}