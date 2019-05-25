"use strict";

import PacMan from "./pacman.js";
import Blinky from "./blinky.js";
import Pinky from "./pinky.js";
import Inky from "./inky.js";
import Clyde from "./clyde.js";

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
        super();

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
        this.scatterPeriods = [];
        this.chasePeriods = [];

        //Index used to keep track of the current scatter/chase period
        this.scatterIndex = 0;
        this.chaseIndex = 0;
    }
    //Load the assets needed for the game
    //Note: previously used maze5.png, test_tile_map.json, and pacman_01.png
    preload() {
        this.load.image("tiles", "./assets/tilesets/maze_tileset.png");
        this.load.image("pellets", "./assets/pellets.png");
        this.load.tilemapTiledJSON("map", "./assets/maze_tile_map.json");
        this.load.atlas("pacman", "./assets/sprites/pacman/pac_anims.png", "./assets/sprites/pacman/pac_anims.json");
        this.load.atlas("blinky", "./assets/sprites/blinky/blinky_anims.png", "./assets/sprites/blinky/blinky_anims.json");
        this.load.atlas("pinky", "./assets/sprites/pinky/pinky_anims.png", "./assets/sprites/pinky/pinky_anims.json");
        this.load.atlas("inky", "./assets/sprites/inky/inky_anims.png", "./assets/sprites/inky/inky_anims.json");
        this.load.atlas("clyde", "./assets/sprites/clyde/clyde_anims.png", "./assets/sprites/clyde/clyde_anims.json");
    }

    create() {
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

        //Find and store Pac-Man's starting location
        const pacmanStartX = mazeLayer.getTileAt(15, 23).pixelX + 8,
              pacmanStartY = mazeLayer.getTileAt(15, 23).pixelY + 8;

        //Instantiate Pac-Man at the starting location
        this.pacman = new PacMan(this, mazeLayer, pacmanStartX, pacmanStartY);

        //Collision for Pac-Man and the "non-moveable" tiles
        this.physics.add.collider(this.pacman.sprite, mazeLayer);

        //Collision for Pac-Man and the world's boundaries
        this.pacman.sprite.setCollideWorldBounds(true); 

        //Find and store each ghost's starting location
        const blinkyStartX = mazeLayer.getTileAt(15, 11).pixelX + 8,
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
        scoreText = this.add.text(30, 520, "Score: " + score, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' });

        //Every second setCurrentMode() is called to determine how many seconds have passed and what mode the ghosts should be in
        this.currentTime = this.time.addEvent({ delay: 1000, callback: this.setCurrentMode, callbackScope: this, loop: true });

        //Initialize the four scatter and chase periods for level 1
        this.scatterPeriods = [7, 7, 5, 5];
        this.chasePeriods = [20, 20, 20, Infinity];
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
            }
            //If Pac-Man has eaten a normal pellet
            else {
                this.updateScore("small");
                this.pacman.pelletsEaten += 1;
            }

            //Remove the pellet after Pac-Man has eaten it
            pelletLayer.removeTileAt(this.findCharacter(this.pacman.sprite).x, this.findCharacter(this.pacman.sprite).y)
        }
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
        //Uncomment below to view the number of seconds that have passed in the current period/mode
        //console.log(this.tick);
        
        //Below used for testing.
        if (this.setupComplete == false) {
            this.inky.setMode("idle");
            this.clyde.setMode("idle");
            this.setupComplete = true;
        }

        //Set the settings for each level
        this.levelSettings(this.level);

        //Used for testing the number of pellets eaten by clyde and inky and for
        //testing their exit modes
        if (this.level == 1) {
            if (this.pacman.pelletsEaten >= this.inky.pelletLimit) {
                if (this.inky.isInside == true) {
                    this.inky.setMode("exit");
                }
            }

            if (this.pacman.pelletsEaten >= this.clyde.pelletLimit) {
                if (this.clyde.isInside == true) {
                    this.clyde.setMode("exit");
                }
            }
        } 

        //Update Pac-Man
        this.pacman.update();

        //Hide ghosts here when testing.
        //this.hide(this.blinky);
        //this.hide(this.pinky);

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

        if (this.pinky.mode == "scatter") {
            this.pinky.setTargetTile(this.pinky.scatterTile);
        }
        else if (this.pinky.mode == "chase") {
            this.pinky.chase(this.findCharacter(this.pacman.sprite), this.pacman.movingDirection);
        }

        if (this.inky.mode == "scatter") {
            this.inky.setTargetTile(this.inky.scatterTile);
        }
        else if (this.inky.mode == "chase") {
            this.inky.chase(this.findCharacter(this.pacman.sprite), this.pacman.movingDirection, mazeLayer.getTileAtWorldXY(this.blinky.sprite.x, this.blinky.sprite.y));
        }

        if (this.clyde.mode == "scatter") {
            this.clyde.setTargetTile(this.clyde.scatterTile);
        }
        else if (this.clyde.mode == "chase") {
            this.clyde.chase(this.findCharacter(this.pacman.sprite));
        }

        //Call each ghosts update function
        this.blinky.update();
        this.pinky.update();
        this.inky.update();
        this.clyde.update(); 
    }

    //This function sets the initial setting for each level
    //Args: level - the current level the player is on
    levelSettings(level) {
        if (level == 1) {
            //Set Pac-Man's level 1 speed
            this.pacman.speed = .8 * this.pacman.maxSpeed;

            //Set the Ghost's level 1 speed
            this.blinky.speed = .75 * this.pacman.maxSpeed;
            this.pinky.speed = .75 * this.pacman.maxSpeed;
            this.inky.speed = .75 * this.pacman.maxSpeed;
            this.clyde.speed = .75 * this.pacman.maxSpeed;
        } 
    }
    
    //Testing function used to "hide" the ghost only visually
    hide(character) {
        character.sprite.setVisible(0);
    }

    //This function use the tick property to determine how many seconds have passed
    //and uses the value stored in tick to determine which mode ghosts should be in
    setCurrentMode() {
        //Increment tick by 1 to store the number of seconds that have passed in the current mode
        this.tick += 1;

        //Switch the current mode to chase, if the ghosts have been in scatter mode for the pre-defined
        //scatter period
        if (this.currentMode == "scatter" && this.tick == this.scatterPeriods[this.scatterIndex]) {
            this.currentMode = "chase";
            this.blinky.setMode("chase");

            //Reset tick and go to the next period
            this.tick = 0;
            this.scatterIndex += 1;
        }
        //Switch the current mode to scatter, if the ghosts have been in chase mode for the pre-defined
        //scatter period
        else if (this.currentMode == "chase" && this.tick == this.chasePeriods[this.chaseIndex]) {
            this.currentMode = "scatter";
            this.blinky.setMode("scatter");
            
            //Reset tick and go to the next period
            this.tick = 0;
            this.chaseIndex += 1;
        }
    }

}