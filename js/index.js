"use strict";

//Set up and configure the application
let config = {
    type: Phaser.AUTO,
    width: 900,
    height: 900,
    zoom: 1.5,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    /* scale: {
        parent: "container",
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 700,
        height: 900
    }   */
};

const game = new Phaser.Game(config);

//Declare global variables used in multiple methods
let pacman,     //Arcade physics sprite 
    cursors,    //Keyboard controls
    map,        //Tiled tile map
    tiles,      //Used for testing purposes to keep track of tiles
    mazeLayer,  //Tiled layer containing the tiles 
    pelletLayer,
    movingDirection = "right",      //Direction Pac-Man is moving. Assignment here indicates Pac-Man's starting movement.
    energizerLocations = [{ x: 2, y: 3 }, {x: 27, y: 3}, {x: 2, y: 23}, {x: 27, y: 23}],
    score = 0,
    scoreText,
    blinky;

//Set global speed of pacman for each vector
const pacmanSpeedLeft = -200,
      pacmanSpeedRight = 200,
      pacmanSpeedUp = -200,
      pacmanSpeedDown = 200;

//Load the assets needed for the game
//Note: previously used maze5.png, test_tile_map.json, and pacman_01.png
function preload() {
    this.load.image("tiles", "./assets/tilesets/maze_tileset.png");
    this.load.image("pellets", "./assets/pellets.png");
    this.load.tilemapTiledJSON("map", "./assets/maze_tile_map.json");
    //this.load.image("pacman", "./assets/pacman_01.png");
    this.load.atlas("pacman", "./assets/pac_anims.png", "./assets/pac_anims.json");
    this.load.atlas("blinky", "./assets/blinky_anims.png", "./assets/blinky_anims.json");
}

function create() {
    //Variable storing reference to the tile map
    map = this.make.tilemap({ key: "map" });

    //The parameters are the name of the tileset found in Tiled and the 
    //key of the tileset image in Phaser's cache (the name used in preload())
    const tileset = map.addTilesetImage("maze_tileset", "tiles");

    //Parameters: layer name (or index) from Tiled, tileset, x, y
    mazeLayer = map.createStaticLayer("Tile Layer", tileset, 0, 0);

    mazeLayer.setCollisionByProperty({ moveable: false });

    const pellet = map.addTilesetImage("pellets", "pellets");
    pelletLayer = map.createDynamicLayer("Pellet Layer", pellet, 0, 0);
    

    //Create a pacman sprite and set the sprite's position
    pacman = this.physics.add.sprite(40, 40, "pacman", "pacman_01.png");

    blinky = this.physics.add.sprite(80, 60, "blinky", "blinky_01.png");

    pacman.setCollideWorldBounds(true);  
    
    pacman.body.setSize(16,16);


    //Used for testing purposes, for an easy way of looking
    //at all of the tiles in the layer map
    tiles = map.layers[0].data;

    //Used for testing purposes, for viewing tiles 
    //map.setCollision([30, 41]);

    //Set pacman's x and y positions in the World
    pacman.x = mazeLayer.getTileAt(15,23).pixelX + 8;
    pacman.y = mazeLayer.getTileAt(15,23).pixelY + 8;

    pacman.setRotation(3.14);
    pacman.setVelocityX(-200);

    //Uncomment below to view tiles in console
    //console.log(tiles);
    
    //Used for testing purposes, for visually debugging collision tiles
    const debugGraphics = this.add.graphics().setAlpha(0.75);

   /*  mazeLayer.renderDebug(debugGraphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });  */

    this.physics.add.collider(pacman, mazeLayer);

    var frameNames = this.anims.generateFrameNames("pacman", { start: 1, end: 3, zeroPad: 2, prefix:"pacman_", suffix:".png" });
    this.anims.create({ key: "chomp", frames: frameNames, frameRate: 20, repeat: -1 });
    pacman.anims.play("chomp");

    var frameNames2 = this.anims.generateFrameNames("blinky", { start: 1, end: 2, zeroPad: 2, prefix:"blinky_", suffix:".png" });
    this.anims.create({ key: "blinky_right", frames: frameNames2, frameRate: 17, repeat: -1 });
    //blinky.anims.play("blinky_right");

    var frameNames3 = this.anims.generateFrameNames("blinky", { start: 3, end: 4, zeroPad: 2, prefix:"blinky_", suffix:".png" });
    this.anims.create({ key: "blinky_left", frames: frameNames3, frameRate: 17, repeat: -1 });

    //Enable keyboard input
    cursors = this.input.keyboard.createCursorKeys();

    blinky.setVelocityX(100);

    scoreText = this.add.text(30, 520, "Score: " + score, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' });
}

function update(time, delta) {
    
    pacman.anims.play("chomp", true);

    warpCharacter("pacman");

    updatePellet();

    //Stores the tile Pac-Man is moving to, or attempting to move to
    let nextTile; 
    
    //The if/else statements below occur when the player
    //uses the arrow keys to move Pac-Man and functions
    //similarly to the if/else statements above.
    
    //If the right arrow key is pressed
    if (cursors.right.isDown) {
        pacman.setVelocityX(200);
        blinky.setVelocityX(100);
        blinky.anims.play("blinky_right", true);

        if (pacman.body.velocity.y == 0) {
            pacman.setRotation(0);
        }

    }
    //If the left arrow key is pressed
    if (cursors.left.isDown) {
        pacman.setVelocityX(-200);
        blinky.setVelocityX(-100);
        blinky.anims.play("blinky_left", true);

        if (pacman.body.velocity.y == 0) {
            pacman.setRotation(3.14);
        }
    
    } 
    //If the up arrow key is pressed
    if (cursors.up.isDown) {
        pacman.setVelocityY(-200);

        if(pacman.body.velocity.x == 0) {
            pacman.setRotation(4.71);
        }

    } 
    //If the down arrow key is pressed
    if (cursors.down.isDown) {
        pacman.setVelocityY(200);

        if (pacman.body.velocity.x == 0) {
            pacman.setRotation(1.57);
        }
    }
} 

//This function returns the tile Pac-Man's center is currently occupying
//Returns the x and y Tiled coordinates of the tile Pac-man is currently occupying
function trackPacMan() {
    //Uses the width and height of each tile in its search
    let pacmanTile = mazeLayer.findTile(function (tile) {
        //If Pac-Man's center coords are within the current tile's area
        if (pacman.x >= tile.pixelX && pacman.x <= tile.pixelX + 16 && pacman.y >= tile.pixelY && pacman.y <= tile.pixelY + 16) {
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

function updateScore(pelletType) {
    if (pelletType == "small") {
        score += 10;
        scoreText.setText("Score: " + score);
    }
    else if (pelletType == "large") {
        score += 50;
        scoreText.setText("Score: " + score);
    }
}

function updatePellet() {
    if (pelletLayer.getTileAt(trackPacMan().x, trackPacMan().y) != null) {
        if (energizerLocations.some(e => e.x === trackPacMan().x && e.y === trackPacMan().y)) {
            updateScore("large");
        }
        else {
            updateScore("small");
        }

        pelletLayer.removeTileAt(trackPacMan().x, trackPacMan().y)
    }
}

function warpCharacter(sprite) {
    if (sprite == "pacman") {
        if(trackPacMan().x == 0 && trackPacMan().y == 14) {
            pacman.x = mazeLayer.getTileAt(29, 14).pixelX;
            pacman.y = mazeLayer.getTileAt(29, 14).pixelY +8;
            
        }
        else if(trackPacMan().x == 29 && trackPacMan().y == 14) {
            pacman.x = mazeLayer.getTileAt(1, 14).pixelX;
            pacman.y == mazeLayer.getTileAt(1, 14).pixelY;
        }
    }

}