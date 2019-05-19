"use strict";

import PacMan from "./pacman.js";
import Ghost from "./ghost.js";
import Blinky from "./blinky.js";

//Declare global variables used in multiple methods
let blinky, //Acrade physics sprite for Blinky
map,        //Tiled tile map
tiles,      //Used for testing purposes to keep track of tiles
mazeLayer,  //Tiled layer containing the tiles 
pelletLayer, //Tiled layer containing the pellets
movingDirection = "right",      //Direction Pac-Man is moving. Assignment here indicates Pac-Man's starting movement.
energizerLocations = [{ x: 2, y: 3 }, {x: 27, y: 3}, {x: 2, y: 23}, {x: 27, y: 23}],
score = 0,
scoreText;   //Used to display the text for the score       

let nextTileCoord = {x: 0, y: 0};

const blinkyStartingTile = {x: 15, y: 11};

//Target tile locations when the ghosts are in "scatter" mode
const blinkyScatterTile = {x: 25, y: 0},
pinkyScatterTile = {x: 4, y: 0},
inkyScatterTile = {x: 28, y: 30},
clydeScatterTile = {x: 1, y: 30};

//Set global speed of pacman for each vector
const pacmanSpeedLeft = -200,
pacmanSpeedRight = 200,
pacmanSpeedUp = -200,
pacmanSpeedDown = 200;

export default class MazeScene extends Phaser.Scene {
    //Load the assets needed for the game
    //Note: previously used maze5.png, test_tile_map.json, and pacman_01.png
    preload() {
        this.load.image("tiles", "./assets/tilesets/maze_tileset.png");
        this.load.image("pellets", "./assets/pellets.png");
        this.load.tilemapTiledJSON("map", "./assets/maze_tile_map.json");
        this.load.atlas("pacman", "./assets/sprites/pacman/pac_anims.png", "./assets/sprites/pacman/pac_anims.json");
        this.load.atlas("blinky", "./assets/sprites/blinky/blinky_anims.png", "./assets/sprites/blinky/blinky_anims.json");
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

        //Find and store Blinky's starting location
        const blinkyStartX = mazeLayer.getTileAt(15,11).pixelX + 8,
              blinkyStartY = mazeLayer.getTileAt(15,11).pixelY + 8;

        //Instantiate Blinky at the starting location
        //this.blinky = new Ghost(this, mazeLayer, blinkyStartX, blinkyStartY);

        this.blinky = new Blinky(this, mazeLayer, blinkyStartX, blinkyStartY);

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

    //Listener method that player's updates the score depending on which type of pellet 
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
        //Update Pac-Man
        this.pacman.update();

        //Allows Pac-Man to use the 2 warp tiles
        this.warpCharacter(this.pacman);

        //Update the score and remove pellets if eaten
        this.updatePellet();

        //Set Blinky's Mode
        this.blinky.setMode("chase");

        if (this.blinky.mode == "scatter") {
            this.blinky.setTargetTile(this.blinky.scatterTile);
        }
        else if (this.blinky.mode == "chase") {
            this.blinky.chase(this.findCharacter(this.pacman.sprite));
        }

        //this.blinky.update();
        this.blinky.update();
    } 

}