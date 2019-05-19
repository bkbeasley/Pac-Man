"use strict";

import MazeScene from "./maze_scene.js";

//Set up and configure the application
let config = {
    type: Phaser.AUTO,
    width: 900,
    height: 900,
    zoom: 1.5,
    scene: MazeScene,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    }
};

//Create a new Phaser game from the config
const game = new Phaser.Game(config);

/*
//Declare global variables used in multiple methods
let pacman,     //Arcade physics sprite for Pac-Man
    blinky,     //Acrade physics sprite for Blinky
    cursors,    //Keyboard controls
    map,        //Tiled tile map
    tiles,      //Used for testing purposes to keep track of tiles
    mazeLayer,  //Tiled layer containing the tiles 
    pelletLayer, //Tiled layer containing the pellets
    movingDirection = "right",      //Direction Pac-Man is moving. Assignment here indicates Pac-Man's starting movement.
    energizerLocations = [{ x: 2, y: 3 }, {x: 27, y: 3}, {x: 2, y: 23}, {x: 27, y: 23}],
    score = 0,
    scoreText;   //Used to display the text for the score       

let nextTileCoord = {x: 0, y: 0};

const pacmanStartingTile = {x: 15, y: 23},
      blinkyStartingTile = {x: 15, y: 11};

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

//Load the assets needed for the game
//Note: previously used maze5.png, test_tile_map.json, and pacman_01.png
function preload() {
    this.load.image("tiles", "./assets/tilesets/maze_tileset.png");
    this.load.image("pellets", "./assets/pellets.png");
    this.load.tilemapTiledJSON("map", "./assets/maze_tile_map.json");
    this.load.atlas("pacman", "./assets/sprites/pacman/pac_anims.png", "./assets/sprites/pacman/pac_anims.json");
    this.load.atlas("blinky", "./assets/sprites/blinky/blinky_anims.png", "./assets/sprites/blinky/blinky_anims.json");
}

function create() {
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

    //Create sprites for Pac-Man and the ghosts and set their positions
    pacman = this.physics.add.sprite(40, 40, "pacman", "pacman_01.png");
    blinky = this.physics.add.sprite(80, 60, "blinky", "blinky_01.png");
    
    //Used for testing purposes, for an easy way of looking
    //at all of the tiles in the layer map
    tiles = map.layers[0].data;

    //Used for testing purposes, for viewing tiles 
    //map.setCollision([30, 41]);

    //Set pacman's x and y positions in the World
    pacman.x = mazeLayer.getTileAt(15,23).pixelX + 8;
    pacman.y = mazeLayer.getTileAt(15,23).pixelY + 8;

    //Set Pac-Man's initial orientation and velocity
    pacman.setRotation(3.14);
    pacman.setVelocityX(-200);
    
    //Sizes and positions the boundary of Pac-Man's body as a rectangle
    //This is needed because otherwise, Pac-Man will be unable to move between tiles
    //because the pixel size of his sprite exceeds the size of a tile 
    pacman.body.setSize(16,16);

    //Set blinky's x and y positions in the World
    blinky.x = mazeLayer.getTileAt(15,11).pixelX + 8;
    blinky.y = mazeLayer.getTileAt(15,11).pixelY + 8;

    //Uncomment below to view tiles in console
    //console.log(tiles);
    
    //Used for testing purposes, for visually debugging collision tiles
    const debugGraphics = this.add.graphics().setAlpha(0.75);

   /*  mazeLayer.renderDebug(debugGraphics, {
        tileColor: null, // Color of non-colliding tiles
        collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
        faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
    });  */

    /*

    //Collision for Pac-Man and the "non-moveable" tiles
    this.physics.add.collider(pacman, mazeLayer);

    //Collision for Pac-Man and the world's boundaries
    pacman.setCollideWorldBounds(true);  

    //Generate frames for all the sprites 
    let pacmanFrames = this.anims.generateFrameNames("pacman", { start: 1, end: 3, zeroPad: 2, prefix:"pacman_", suffix:".png" });
    this.anims.create({ key: "chomp", frames: pacmanFrames, frameRate: 20, repeat: -1 });

    let blinkyRightFrames = this.anims.generateFrameNames("blinky", { start: 1, end: 2, zeroPad: 2, prefix:"blinky_", suffix:".png" });
    this.anims.create({ key: "blinky_right", frames: blinkyRightFrames, frameRate: 17, repeat: -1 });

    let blinkyLeftFrames = this.anims.generateFrameNames("blinky", { start: 3, end: 4, zeroPad: 2, prefix:"blinky_", suffix:".png" });
    this.anims.create({ key: "blinky_left", frames: blinkyLeftFrames, frameRate: 17, repeat: -1 });

    let blinkyDownFrames = this.anims.generateFrameNames("blinky", { start: 5, end: 6, zeroPad: 2, prefix:"blinky_", suffix:".png" });
    this.anims.create({ key: "blinky_down", frames: blinkyDownFrames, frameRate: 17, repeat: -1 });

    let blinkyUpFrames = this.anims.generateFrameNames("blinky", { start: 7, end: 8, zeroPad: 2, prefix:"blinky_", suffix:".png" });
    this.anims.create({ key: "blinky_up", frames: blinkyUpFrames, frameRate: 17, repeat: -1 });

    //Enable keyboard input
    cursors = this.input.keyboard.createCursorKeys();

    //Set Blinky's Properties
    blinky.mode = null;
    blinky.targetTile = mazeLayer.getTileAt(13, 26);
    blinky.nextTile = mazeLayer.getTileAt(14, 11);
    blinky.decisionTile = null;
    blinky.movingDirection = null;

    //Display the score
    scoreText = this.add.text(30, 520, "Score: " + score, { fontFamily: 'Verdana, "Times New Roman", Tahoma, serif' });

    //Set the coordinates of Blinky's next tile
    nextTileCoord.x = blinky.nextTile.pixelX + 8;
    nextTileCoord.y = blinky.nextTile.pixelY + 8;
}

function update(time, delta) {
    //Animate Pac-Man
    pacman.anims.play("chomp", true);

    //Allows Pac-Man to use the 2 warp tiles
    warpCharacter(pacman);

    //Update the score and remove pellets if eaten
    updatePellet();
    
    blinky.mode = "chase";
    
    if (blinky.mode == "scatter") {
        blinky.targetTile = mazeLayer.getTileAt(clydeScatterTile.x, clydeScatterTile.y);
    }
    else if (blinky.mode == "chase") {
        blinky.targetTile = findCharacter(pacman);
    }

    //Find and store the distance between Blinky and the next tile he will move to
    let distance = Phaser.Math.Distance.Between(blinky.x, blinky.y, nextTileCoord.x, nextTileCoord.y);

    //Move Blinky towards the next tile if he isn't already inside it
    //Note: the magnitude (4) of the distance will need to increase if Blinky's speed increases 
    if (distance > 4) {
        //If the next tile is to the left, move Blinky left
        if (nextTileCoord.x < blinky.x) {
            blinky.setVelocityY(0);
            blinky.setVelocityX(-160);
            blinky.anims.play("blinky_left", true);
            blinky.movingDirection = "left";
        }
        //If the next tile is to the right, move Blinky right
        else if (nextTileCoord.x > blinky.x) {
            blinky.setVelocityY(0);
            blinky.setVelocityX(160);
            blinky.anims.play("blinky_right", true);
            blinky.movingDirection = "right";
        }
        //If the next tile is above, move Blinky upwards
        else if (nextTileCoord.y < blinky.y) {
            blinky.setVelocityX(0);
            blinky.setVelocityY(-160);
            blinky.anims.play("blinky_up", true);
            blinky.movingDirection = "up";
        }
        //If the next tile is below, move Blinky downwards
        else if (nextTileCoord.y > blinky.y) {
            blinky.setVelocityX(0);
            blinky.setVelocityY(160);
            blinky.anims.play("blinky_down", true);
            blinky.movingDirection = "down";
        }
    }
    //If Blinky is inside the next tile, stop Blinky and locate the next tile 
    //to move to
    else {
        blinky.setVelocityX(0);
        blinky.setVelocityY(0);

        //If the reset method isn't used Blinky will be offset from the next tile's 
        //location by a small magnitude. This amount will continue to increase as Blinky moves
        //from tile-to-tile
        blinky.body.reset(nextTileCoord.x, nextTileCoord.y);

        //Decide on the next tile Blinky should move to
        updateP2();
    }
    
    //The if/else statements below occur when the player
    //uses the arrow keys to move Pac-Man and functions
    //similarly to the if/else statements above.
    
    //If the right arrow key is pressed
    if (cursors.right.isDown) {
        pacman.setVelocityX(200);

        if (pacman.body.velocity.y == 0) {
            pacman.setRotation(0);
        }
    }
    //If the left arrow key is pressed
    if (cursors.left.isDown) {
        pacman.setVelocityX(-200);

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
//Returns: the x and y Tiled coordinates of the tile Pac-man is currently occupying
function findCharacter(character) {
    let currentTile;

    if (character == pacman) {
        //Uses the width and height of each tile in its search
        currentTile = mazeLayer.findTile(function (tile) {
            //If Pac-Man's center coords are within the current tile's area
            if (pacman.x >= tile.pixelX && pacman.x <= tile.pixelX + 16 && pacman.y >= tile.pixelY && pacman.y <= tile.pixelY + 16) {
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

//Listener method that player's updates the score depending on which type of pellet 
//was eaten by Pac-Man
function updatePellet() {
    //If Pac-Man is occupying a tile with a pellet
    if (pelletLayer.getTileAt(findCharacter(pacman).x, findCharacter(pacman).y) != null) {
        //If Pac-Man has eaten an energizer
        if (energizerLocations.some(e => e.x === findCharacter(pacman).x && e.y === findCharacter(pacman).y)) {
            updateScore("large");
        }
        //If Pac-Man has eaten a normal pellet
        else {
            updateScore("small");
        }

        //Remove the pellet after Pac-Man has eaten it
        pelletLayer.removeTileAt(findCharacter(pacman).x, findCharacter(pacman).y)
    }
}

//This function allows Pac-Man to use the "warp tiles" and travel to
//opposite ends of the maze
function warpCharacter(sprite) {
    if (sprite == pacman) {
        //If Pac-Man is located at the "warp tile" on the left side of the maze
        if(findCharacter(sprite).x == 0 && findCharacter(sprite).y == 14) {
            pacman.x = mazeLayer.getTileAt(29, 14).pixelX;
            pacman.y = mazeLayer.getTileAt(29, 14).pixelY +8;
            
        }
        //If Pac-Man is located at the "warp tile" on the right side of the maze
        else if(findCharacter(sprite).x == 29 && findCharacter(sprite).y == 14) {
            pacman.x = mazeLayer.getTileAt(1, 14).pixelX;
            pacman.y == mazeLayer.getTileAt(1, 14).pixelY;
        }
    }
}

function moveToNextTile(sprite) {
    let nextTile = sprite.nextTile;
    let currentTile = findCharacter(blinky);

    //Move sprite to the left tile
    if (nextTile.x < currentTile.x) {
        sprite.setVelocityY(0);
        sprite.setVelocityX(-100);
    }
    //Move sprite to the right tile
    else if (nextTile.x > currentTile.x) {
        sprite.setVelocityY(0);
        sprite.setVelocityX(100);
        blinky.anims.play("blinky_right", true);
    }
    //Move sprite to the tile above
    else if(nextTile.y < currentTile.y) {
        sprite.setVelocityX(0);
        sprite.setVelocityY(-100);
        blinky.anims.play("blinky_up", true);
    }
    //Move sprite to the tile below
    else if(nextTile.y > currentTile.y) {
        sprite.setVelocityX(0);
        sprite.setVelocityY(100);
        blinky.anims.play("blinky_down", true);
    }
}

//This function finds the possible tiles ghosts can move to
//after moving to the next tile in the ghost's current path.
//There possible tiles are the four tiles adjacent to a ghost's
//next tile.
//Args: nextTile - The next tile the ghost will move to in its 
//current path
//Returns: possible tiles the ghosts can move to
function findDecisionTiles(nextTile) {
    //The four possible "decision" tiles based on the sprite's next tile
    let tileUp = mazeLayer.getTileAt(nextTile.x, nextTile.y - 1),
        tileDown = mazeLayer.getTileAt(nextTile.x, nextTile.y + 1),
        tileRight = mazeLayer.getTileAt(nextTile.x + 1, nextTile.y),
        tileLeft = mazeLayer.getTileAt(nextTile.x - 1, nextTile.y);

    //Stores the location of the tile that would cause the ghost to reverse direction
    let reverseTile;
    
    //Find the current tile the ghost is on, and use it to eliminate that tile and prevent
    //ghosts from reversing their direction
    if (blinky.movingDirection == "left") {
        reverseTile = mazeLayer.getTileAt(nextTile.x + 1, nextTile.y);
    }
    else if (blinky.movingDirection == "right") {
        reverseTile = mazeLayer.getTileAt(nextTile.x - 1, nextTile.y);
    }
    else if (blinky.movingDirection == "up") {
        reverseTile = mazeLayer.getTileAt(nextTile.x, nextTile.y + 1);
    }
    else if (blinky.movingDirection == "down") {
        reverseTile = mazeLayer.getTileAt(nextTile.x, nextTile.y - 1);
    }

    //Stores the possible tiles the ghost can move to after
    //eliminating invalid tiles
    let possibleTiles = [];

    //Find the possible tiles ghosts can move to by elimating collision tiles
    //and the reverse tile
    if (tileUp != reverseTile && tileUp.properties.moveable == true) {
        possibleTiles.push(tileUp);
    }

    if (tileDown != reverseTile && tileDown.properties.moveable == true) {
        possibleTiles.push(tileDown);
    }

    if (tileRight != reverseTile && tileRight.properties.moveable == true) {
        possibleTiles.push(tileRight);
    }

    if (tileLeft != reverseTile && tileLeft.properties.moveable == true) {
        possibleTiles.push(tileLeft);
    }

    //Possible tiles ghosts can move to after eliminating collision tiles, and
    //the reverse tile 
    return possibleTiles;
}

//Calculates the straight line distance in pixels from a start tile to a target tile,
//Args: decisionTile - a possible tile the ghost can move to
//      targetTile - the ghost's target tile
//Returns: the distance between the two tiles
function distanceToTarget(decisionTile, targetTile) {
    //Stores the distance between the two tiles
    let distance;

    //Calculate the distance between two points (A,B):
    // d(A,B) = sqrt((xB - xA)^2 + (yB - yA)^2)
    distance = Phaser.Math.Distance.Between(decisionTile.x + 8, decisionTile.y + 8, targetTile.x + 8, targetTile.y + 8); 

    return distance;
}

//This function takes an array of possible "decision" tiles and a target tile as parameters,
//and returns the "decision" tile with the shortest distance to the target tile
function shortestDistanceTile(decisionTiles, targetTile) {
    //Stores the current shortest distance to the target
    let lowestValue = null;
    
    //Calculate distance to target tile for each decision tile
    //and store as a tile property
    for (let tile of decisionTiles) {
        tile.properties.distanceToTarget = distanceToTarget(tile, targetTile);
        //Set lowestValue to the first target distance if this is the first tile in the array
        if (lowestValue == null) {
            lowestValue = tile.properties.distanceToTarget;
        }
        else {
            if (tile.properties.distanceToTarget < lowestValue) {
                lowestValue = tile.properties.distanceToTarget;
            }
        }
    }

    //Find and return the tile with the shortest distanceToTarget
    for  (let tile of decisionTiles) {
        if (tile.properties.distanceToTarget == lowestValue) {
            return tile;
        }
    }

    //Note: Distance tiebreaker not added, but should still function w/o this feature
}

//This method uses helper functions to find possible tiles ghosts can move to, and chooses the
//tile closest to the target tile. The method will then update their next tiles to the chosen tile.
//Args: ghost - the current ghost
function updateNextTile(ghost) {
    //Store the next tile and target tile
    let nextTile = ghost.nextTile;
    let targetTile = ghost.targetTile;

    //Find and store possible tiles
    let decisionTile = findDecisionTiles(nextTile);

    //If there is more than one possible tile, choose the tile closest to the target tile
    if (decisionTile.length > 1) {
        decisionTile = shortestDistanceTile(decisionTile, targetTile);
    }
    //If there is only one possible tile 
    else {
        decisionTile = decisionTile[0];
    }

    //Update the next tile property to the best choice decision tile
    ghost.nextTile = decisionTile;
}

//This method updates the next tile in the properties of ghosts as well 
//as the coordinates of the next tile
function updateP2() {
    //Update blinky's next tile property
    updateNextTile(blinky);

    //Update the coordinates of the next tile
    nextTileCoord.x = blinky.nextTile.pixelX + 8;
    nextTileCoord.y = blinky.nextTile.pixelY + 8;
} */