"use strict";

//Set up and configure the application
let config = {
    type: Phaser.AUTO,
    width: 1000,
    height: 1000,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    },
     /* scale: {
        parent: "container",
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 640,
        height: 800
    }  */
};

const game = new Phaser.Game(config);

//Declare global variables used in multiple methods
let pacman,     //Arcade physics sprite 
    cursors,    //Keyboard controls
    map,        //Tiled tile map
    tiles,      //Used for testing purposes to keep track of tiles
    mazeLayer,  //Tiled layer containing the tiles 
    movingDirection = "right";      //Direction Pac-Man is moving. Assignment here indicates Pac-Man's starting movement.

//Set global speed of pacman for each vector
const pacmanSpeedLeft = -200,
      pacmanSpeedRight = 200,
      pacmanSpeedUp = -200,
      pacmanSpeedDown = 200;

//Load the assets needed for the game
//Note: previously used maze5.png, test_tile_map.json, and pacman_01.png
function preload() {
    this.load.image("tiles", "./assets/New Piskel.png");
    this.load.tilemapTiledJSON("map", "./assets/maze_tile_map.json");
    this.load.image("pacman", "./assets/pacman_01.png");
}

function create() {
    //Variable storing reference to the tile map
    map = this.make.tilemap({ key: "map" });

    // The parameters are the name of the tileset found in Tiled and the 
    // key of the tileset image in Phaser's cache (the name used in preload())
    const tileset = map.addTilesetImage("New Piskel", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    mazeLayer = map.createStaticLayer("Tile Layer 1", tileset, 0, 0);

    //Create a pacman sprite and set the sprite's position
    pacman = this.physics.add.image(40, 40, "pacman");

    //Used for testing purposes, for an easy way of looking
    //at all of the tiles in the layer map
    tiles = map.layers[0].data;

    //Used for testing purposes, for viewing tiles 
    map.setCollision([30, 41]);

    //Set pacman's x and y positions in the World
    pacman.x = 24;
    pacman.y = 24;

    //Uncomment below to view tiles in console
    //console.log(tiles)

    //Used for testing purposes, for visually debugging collision tiles
    const debugGraphics = this.add.graphics().setAlpha(0.75);

    mazeLayer.renderDebug(debugGraphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    }); 

    //Enable keyboard input
    cursors = this.input.keyboard.createCursorKeys();
}

function update(time, delta) {
    //Stores the tile Pac-Man is moving to, or attempting to move to
    let nextTile;
/* 
    //The if/else statements below check for "collisions" each frame
    //and set Pac-Man's velocity correspondingly

    //If Pac-Man is moving, or attempting to move right
    if (movingDirection == "right") {
        //Retrieve the tile to the right of Pac-Man 
        nextTile = getNextTile("right");

        //If the tile to the right of Pac-Man is "non-colliding"
        if (checkNextTile(nextTile)) {
            //Move Pac-Man only across the x-axis
            pacman.body.setVelocityY(0);
            pacman.body.setVelocityX(pacmanSpeedRight);
        }
        //If the tile to the right of Pac-Man is "colliding"
        else {
            //Stop Pac-Man
            pacman.body.setVelocityY(0);
            pacman.body.setVelocityX(0);
        }
    }
    //If Pac-Man is moving, or attempting to move left
    else if (movingDirection == "left") {
        //Retrieve the tile to the left of Pac-Man
        nextTile = getNextTile("left");

        //If the tile to the left of Pac-Man is "non-colliding"
        if (checkNextTile(nextTile)) {
            //Move Pac-Man only across the x-axis
            pacman.body.setVelocityY(0);
            pacman.body.setVelocityX(pacmanSpeedLeft);
        }
        else {
            //Stop Pac-Man
            pacman.body.setVelocityY(0);
            pacman.body.setVelocityX(0);
        }
    }
    //If Pac-Man is moving, or attempting to move up
    else if (movingDirection == "up") {
        //Retrieve the tile directly above Pac-Man
        nextTile = getNextTile("up");

        //If the tile above Pac-Man is "non-colliding"
        if (checkNextTile(nextTile)) {
            //Move Pac-Man only across the y-axis
            pacman.body.setVelocityX(0);
            pacman.body.setVelocityY(pacmanSpeedUp);
        }
        //If the tile above Pac-Man is "colliding"
        else {
            //Stop Pac-Man
            pacman.body.setVelocityX(0);
            pacman.body.setVelocityY(0);
        }
    }
    //If Pac-Man is moving, or attempting to move down
    else if (movingDirection == "down") {
        //Retrieve the tile directly below Pac-Man
        nextTile = getNextTile("down");

        //If the tile below Pac-Man is "non-colliding"
        if (checkNextTile(nextTile)) {
            //Move Pac-Man only across the y-axis
            pacman.body.setVelocityX(0);
            pacman.body.setVelocityY(pacmanSpeedDown);
        }
        //If the tile below Pac-Man is "colliding"
        else {
            //Stop Pac-Man
            pacman.body.setVelocityX(0);
            pacman.body.setVelocityY(0);
        }
    }
    
    //The if/else statements below occur when the player
    //uses the arrow keys to move Pac-Man and functions
    //similarly to the if/else statements above.
    
    //If the right arrow key is pressed
    if (cursors.right.isDown) {
        //Retrieve the tile to the right of Pac-Man
        nextTile = getNextTile("right");
        
        //If the tile to the right of Pac-Man is "non-colliding"
        if(checkNextTile(nextTile)) {
            //Move Pac-Man only across the x-axis and set his
            //moving direction to right
            pacman.body.setVelocityY(0);
            pacman.body.setVelocityX(pacmanSpeedRight);
            movingDirection = "right";
        }
        //If the tile to the right of Pac-Man "colliding"
        else {
            //If the tile to the right of Pac-Man is "colliding" 
            //and the tile Pac-Man was moving to before the key 
            //was pressed is "non-colliding", keep moving 
            if (checkNextTile(getNextTile(movingDirection))) {
                //Do nothing
            }
            //If the tile to the right of Pac-Man is "non-colliding"
            //and the tile Pac-Man was moving to before the key
            //was pressed is "colliding", stop Pac-Man
            else {
                //Set Pac-Man's velocity on all vectors to 0 and
                //set his moving direction to right
                pacman.body.setVelocityY(0);
                pacman.body.setVelocityX(0);
                movingDirection = "right";
            }     
        }

        //Below used for testing purposes
        // pacman.x += 5;
    }
    //If the left arrow key is pressed
    if (cursors.left.isDown) {
        //Retrieve the tile to the left of Pac-Man
        nextTile = getNextTile("left");
        
        //If the tile to the left of Pac-Man is "non-colliding"
        if(checkNextTile(nextTile)) {
            //Move Pac-Man only across the x-axis and set his
            //moving direction to left
            pacman.body.setVelocityY(0);
            pacman.body.setVelocityX(pacmanSpeedLeft);
            movingDirection = "left";
        }
        //If the tile to the left of Pac-Man is "colliding"
        else {
            //If the tile to the left of Pac-Man is "colliding" 
            //and the tile Pac-Man was moving to before the key 
            //was pressed is "non-colliding", keep moving 
            if (checkNextTile(getNextTile(movingDirection))) {
                //Do nothing
            }
            //If the tile to the right of Pac-Man is "non-colliding"
            //and the tile Pac-Man was moving to before the key
            //was pressed is "colliding", stop Pac-Man
            else {
                //Set Pac-Man's velocity on all vectors to 0 and
                //set his moving direction to left
                pacman.body.setVelocityY(0);
                pacman.body.setVelocityX(0);
                movingDirection = "left";
            }
        }

        //Below used for testing purposes
        //pacman.x -= 5;
    } 
    //If the up arrow key is pressed
    if (cursors.up.isDown) {
        //Retrieve the tile directly above Pac-Man
        nextTile = getNextTile("up");
        
        //If the next tile is moveable
        if(checkNextTile(nextTile)) {
            //Move Pac-Man only across the y-axis and set his
            //moving direction to up
            pacman.body.setVelocityX(0);
            pacman.body.setVelocityY(pacmanSpeedUp);
            movingDirection = "up";
        }
        //If the next tile is not moveable
        else {
            //If the tile directly above Pac-Man is "colliding" 
            //and the tile Pac-Man was moving to before the key 
            //was pressed is "non-colliding", keep moving 
            if (checkNextTile(getNextTile(movingDirection))) {
                //Do nothing
            }
            //If the tile directly above Pac-Man is "non-colliding"
            //and the tile Pac-Man was moving to before the key
            //was pressed is "colliding", stop Pac-Man
            else {
                //Set Pac-Man's velocity on all vectors to 0 and
                //set his moving direction to up
                pacman.body.setVelocityX(0);
                pacman.body.setVelocityY(0);
                movingDirection = "up";
            }
        }

        //Below used for testing purposes
        //pacman.y -= 5;
    } 
    //If the down arrow key is pressed
    if (cursors.down.isDown) {
        //Retrieve the tile directly below Pac-Man
        nextTile = getNextTile("down");
        
        //If the next tile is moveable
        if(checkNextTile(nextTile)) {
            //Move Pac-Man only across the y-axis and set his
            //moving direction to down
            pacman.body.setVelocityX(0);
            pacman.body.setVelocityY(pacmanSpeedDown);
            movingDirection = "down";
        }
        //If the next tile is not moveable
        else {
            //If the tile directly below Pac-Man is "colliding" 
            //and the tile Pac-Man was moving to before the key 
            //was pressed is "non-colliding", keep moving 
            if (checkNextTile(getNextTile(movingDirection))) {
                //Do nothing
            }
            //If the tile directly below Pac-Man is "non-colliding"
            //and the tile Pac-Man was moving to before the key
            //was pressed is "colliding", stop Pac-Man
            else {
                //Set Pac-Man's velocity on all vectors to 0 and
                //set his moving direction to down
                pacman.body.setVelocityX(0);
                pacman.body.setVelocityY(0);
                movingDirection = "down";
            }
        }

        //Below used for testing purposes
        //pacman.y += 5;
    }*/
} 

//This function returns the tile Pac-Man's center is currently occupying
//Returns the x and y Tiled coordinates of the tile Pac-man is currently occupying
function trackPacMan() {
    //Uses the width and height of each tile in its search
    let pacmanTile = mazeLayer.findTile(function (tile) {
        //If Pac-Man's center coords are within the current tile's area
        if (pacman.x >= tile.pixelX && pacman.x <= tile.pixelX + 23 && pacman.y >= tile.pixelY && pacman.y <= tile.pixelY + 23) {
            return tile;
        }
    });

    if (pacmanTile == null) { return null };
    
    //Return the occupied tile if the tile is not equal to null
    return {x: pacmanTile.x, y: pacmanTile.y};
}

//This function returns the next tile based on Pacman's velocity vector
//Parameters: 
//direction: the direction pacman is currently moving, or if a wall was
//encounter, the direction the player last attempted to move Pac-Man
function getNextTile(direction) {
    //Stores the x and y coordinates of the next tile
    let nextTileXY;

    //Stores the next tile
    let nextTile;

    if (direction == "right") {
        nextTileXY = trackPacMan();
        nextTileXY.x += 1;
        nextTile = mazeLayer.getTileAt(nextTileXY.x, nextTileXY.y);
    }
    else if (direction == "left") {
        nextTileXY = trackPacMan();
        nextTileXY.x -= 1;
        nextTile = mazeLayer.getTileAt(nextTileXY.x, nextTileXY.y);
    }
    else if (direction == "up") {
        nextTileXY = trackPacMan();
        nextTileXY.y -= 1;
        nextTile = mazeLayer.getTileAt(nextTileXY.x, nextTileXY.y);
    }
    else if (direction == "down") {
        nextTileXY = trackPacMan();
        nextTileXY.y += 1;
        nextTile = mazeLayer.getTileAt(nextTileXY.x, nextTileXY.y);
    }

    return nextTile;
}

//This function looks at the next tile Pac-Man will encounter
//in his current direction of travel, or if stationary, the 
//next tile the player is attempting to move Pac-Man to
//Parameters:
//nextTile: The tile Pac-Man is attempting to move to
//Returns true if the next tile is not a "collision" tile,
//and false if the next tile is a "collision" tile
function checkNextTile(nextTile) {
    if (nextTile.properties.moveable == true) {
        return true;
    }
    else {
        return false;
    }
}