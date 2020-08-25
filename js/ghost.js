export default class Ghost {
    constructor(scene, maze, positionX, positionY) {
        this.scene = scene;
        this.maze = maze;

        //Create the Arcade physics sprite for a Ghost
        this.sprite = null; 

        //Set the properties of the Ghost
        this.mode = null;
        this.targetTile = null;
        this.nextTile = null;
        this.decisionTile = null;
        this.movingDirection = null;
        this.nextTileCoord = {x: null, y: null};
        this.scatterTile = null;
        this.warpTileLeft = this.maze.getTileAt(0, 14);
        this.warpTileRight = this.maze.getTileAt(29, 14);
        this.currentTile = null;
        this.pelletLimit = null;
        this.speed = null;
        this.isInside = null;
        this.modeChanged = false;
        this.flash = false;
        this.enterStarted = null;
        this.center = {x: null, y: null};

        this.recentlyEaten = false;
        this.inTunnel = false;

        const anims = scene.anims;

        let frightenedFrames = anims.generateFrameNames("frightened", { start: 1, end: 2, zeroPad: 2, prefix:"frightened_", suffix:".png" });
        anims.create({ key: "frightened", frames: frightenedFrames, frameRate: 17, repeat: -1 });

        let frightenedFlashFrames = anims.generateFrameNames("frightened", { start: 3, end: 4, zeroPad: 2, prefix:"frightened_", suffix:".png" });
        anims.create({ key: "frightened_flash", frames: frightenedFlashFrames, frameRate: 5, repeat: -1 });

        let eyesRightFrames = anims.generateFrameNames("eyes", { start: 1, end: 1, zeroPad: 2, prefix:"eyes_", suffix:".png" });
        anims.create({ key: "eyes_right", frames: eyesRightFrames, frameRate: 17, repeat: -1 });

        let eyesLeftFrames = anims.generateFrameNames("eyes", { start: 2, end: 2, zeroPad: 2, prefix:"eyes_", suffix:".png" });
        anims.create({ key: "eyes_left", frames: eyesLeftFrames, frameRate: 17, repeat: -1 });

        let eyesDownFrames = anims.generateFrameNames("eyes", { start: 3, end: 3, zeroPad: 2, prefix:"eyes_", suffix:".png" });
        anims.create({ key: "eyes_down", frames: eyesDownFrames, frameRate: 17, repeat: -1 });

        let eyesUpFrames = anims.generateFrameNames("eyes", { start: 4, end: 4, zeroPad: 2, prefix:"eyes_", suffix:".png" });
        anims.create({ key: "eyes_up", frames: eyesUpFrames, frameRate: 17, repeat: -1 });
    }

    update() {
        if (this.modeChanged == true) {
            this.nextTile = this.findReverseTile(this.currentTile);
            this.nextTileCoord.x = this.nextTile.pixelX + 8;
            this.nextTileCoord.y = this.nextTile.pixelY + 8;
            this.modeChanged = false;
        }
        if (this.mode == "exit") {
            this.exitHouse();
        }

        if (this.mode == "enter") {
            this.speed = 0;
            this.enterHouse();
        }

        if (this.mode == "frozen") {
            this.sprite.setVelocityX(0);
            this.sprite.setVelocityY(0);
            this.sprite.anims.stop();
        }

        

        if (this.mode != "idle" && this.mode != "exit" && this.mode != "enter" && this.mode != "frozen"){
            //Find and store the distance between the Ghost and the next tile it will move to
            let distance = Phaser.Math.Distance.Between(this.sprite.x, this.sprite.y, this.nextTileCoord.x, this.nextTileCoord.y);

            //Move the Ghost towards the next tile if he isn't already inside it
            //Note: the magnitude (4) of the distance will need to increase if the Ghost's speed increases 
            if (distance > 4) {
                //If the next tile is to the left, move the Ghost left
                if (this.nextTileCoord.x < this.sprite.x) {
                    this.sprite.setVelocityY(0);
                    this.sprite.setVelocityX(-this.speed);
                    if (this.mode == "frightened") {
                        if (this.flash == false) {
                            this.sprite.anims.play("frightened", true);
                        }
                        else {
                            this.sprite.anims.play("frightened_flash", true);
                        }
                    }
                    else if (this.mode == "eyes") {
                        this.sprite.anims.play("eyes_left", true);
                    }
                    else {
                        this.animate("left");
                    }
                    this.movingDirection = "left";
                }
                //If the next tile is to the right, move the Ghost right
                else if (this.nextTileCoord.x > this.sprite.x) {
                    this.sprite.setVelocityY(0);
                    this.sprite.setVelocityX(this.speed);
                    if (this.mode == "frightened") {
                        if (this.flash == false) {
                            this.sprite.anims.play("frightened", true);
                        }
                        else {
                            this.sprite.anims.play("frightened_flash", true);
                        }
                    }
                    else if (this.mode == "eyes") {
                        this.sprite.anims.play("eyes_right", true);
                    }
                    else {
                        this.animate("right");
                    }
                    this.movingDirection = "right";
                }
                //If the next tile is above, move the Ghost upwards
                else if (this.nextTileCoord.y < this.sprite.y) {
                    this.sprite.setVelocityX(0);
                    this.sprite.setVelocityY(-this.speed);
                    if (this.mode == "frightened") {
                        if (this.flash == false) {
                            this.sprite.anims.play("frightened", true);    
                        }
                        else{
                            this.sprite.anims.play("frightened_flash", true);
                        }
                    }
                    else if (this.mode == "eyes") {
                        this.sprite.anims.play("eyes_up", true);
                    }
                    else {
                        this.animate("up");
                    }
                    this.movingDirection = "up";
                }
                //If the next tile is below, move the Ghost downwards
                else if (this.nextTileCoord.y > this.sprite.y) {
                    this.sprite.setVelocityX(0);
                    this.sprite.setVelocityY(this.speed);
                    if (this.mode == "frightened") {
                        if (this.flash == false) {
                            this.sprite.anims.play("frightened", true);
                        }
                        else {
                            this.sprite.anims.play("frightened_flash", true);
                        }
                    }
                    else if (this.mode == "eyes") {
                        this.sprite.anims.play("eyes_down", true);
                    }
                    else {
                        this.animate("down");
                    }
                    this.movingDirection = "down";
                }
            }
            //If the Ghost is inside the next tile, stop the Ghost and locate the next tile 
            //to move to
            else {
                this.sprite.setVelocityX(0);
                this.sprite.setVelocityY(0);

                //If the reset method isn't used the Ghost will be offset from the next tile's 
                //location by a small magnitude. This amount will continue to increase as the Ghost moves
                //from tile-to-tile
                this.sprite.body.reset(this.nextTileCoord.x, this.nextTileCoord.y);

                //Decide on the next tile the Ghost should move to
                this.updateNextTileCoords();

                this.currentTile = this.maze.getTileAtWorldXY(this.sprite.x, this.sprite.y);
            }
        }
        else if (this.mode == "idle"){
            this.playIdleAnimation();
        }

        if (this.modeChanged == true) {
            this.nextTile = this.maze.getTileAt(this.nextTile.x + 1, this.nextTile.y);
            this.modeChanged = false;
        }

        this.center.x = this.sprite.x + 8;
        this.center.y = this.sprite.y + 8;
    }

    setTargetTile(tile) {
        this.targetTile = tile;
    }

    setNextTile(tile) {
        this.nextTile = tile;
    }

    setMode(mode) {
        if (mode == "chase") {
            this.mode = "chase";
        }
        else if (mode == "scatter") {
            this.mode = "scatter";
        }
        else if (mode == "exit") {
            this.mode = "exit";
        }
        else if (mode == "idle") {
            this.mode = "idle";
        }
        else if (mode == "frightened") {
            this.mode = "frightened";
        }
        else if (mode == "eyes") {
            this.mode = "eyes";
        }
        else if (mode == "enter") {
            this.mode = "enter";
        }
        else if (mode == "frozen") {
            this.mode = "frozen";
        }
        else if (mode == "invisible") {
            this.mode = "invisible";
        }
    }

    //This function finds the possible tiles ghosts can move to
    //after moving to the next tile in the ghost's current path.
    //There possible tiles are the four tiles adjacent to a ghost's
    //next tile.
    //Args: nextTile - The next tile the ghost will move to in its 
    //current path
    //Returns: possible tiles the ghosts can move to
    findDecisionTiles(nextTile) {
        //The four possible "decision" tiles based on the sprite's next tile
        let tileUp = this.maze.getTileAt(nextTile.x, nextTile.y - 1),
            tileDown = this.maze.getTileAt(nextTile.x, nextTile.y + 1),
            tileRight = this.maze.getTileAt(nextTile.x + 1, nextTile.y),
            tileLeft = this.maze.getTileAt(nextTile.x - 1, nextTile.y);

        //Stores the location of the tile that would cause the ghost to reverse direction
        let reverseTile;

        //Find the current tile the ghost is on, and use it to eliminate that tile and prevent
        //ghosts from reversing their direction
        if (this.movingDirection == "left") {
            reverseTile = this.maze.getTileAt(nextTile.x + 1, nextTile.y);
        }
        else if (this.movingDirection == "right") {
            reverseTile = this.maze.getTileAt(nextTile.x - 1, nextTile.y);
        }
        else if (this.movingDirection == "up") {
            reverseTile = this.maze.getTileAt(nextTile.x, nextTile.y + 1);
        }
        else if (this.movingDirection == "down") {
            reverseTile = this.maze.getTileAt(nextTile.x, nextTile.y - 1);
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
    distanceToTarget(decisionTile, targetTile) {
        //Stores the distance between the two tiles
        let distance;

        //Calculate the distance between two points (A,B):
        // d(A,B) = sqrt((xB - xA)^2 + (yB - yA)^2)
        distance = Phaser.Math.Distance.Between(decisionTile.x + 8, decisionTile.y + 8, targetTile.x + 8, targetTile.y + 8); 

        return distance;
    }

    //This function takes an array of possible "decision" tiles and a target tile as parameters,
    //and returns the "decision" tile with the shortest distance to the target tile
    shortestDistanceTile(decisionTiles, targetTile) {
        //Stores the current shortest distance to the target
        let lowestValue = null;

        //Calculate distance to target tile for each decision tile
        //and store as a tile property
        for (let tile of decisionTiles) {
            tile.properties.distanceToTarget = this.distanceToTarget(tile, targetTile);
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
    updateNextTile(ghost) {
        //Store the next tile and target tile
        let nextTile = ghost.nextTile;
        let targetTile = ghost.targetTile;

        //Stores possible tiles
        let decisionTile;

        //If the nextTile is a warp tile, warp the Ghost
        if (nextTile == this.warpTileLeft) {
            this.sprite.x = this.warpTileRight.pixelX;
            this.sprite.y = this.warpTileRight.pixelY +8;
            ghost.nextTile = this.maze.getTileAt(28, 14);
            return;
        }
        else if (nextTile == this.warpTileRight) {
            this.sprite.x = this.warpTileLeft.pixelX;
            this.sprite.y = this.warpTileLeft.pixelY + 8;
            ghost.nextTile = this.maze.getTileAt(1, 14);
            return;
        }

        //Find and store possible tiles
        decisionTile = this.findDecisionTiles(nextTile);

        //If there is more than one possible tile, choose the tile closest to the target tile
        if (decisionTile.length > 1) {
            if (this.mode != "frightened") {
                decisionTile = this.shortestDistanceTile(decisionTile, targetTile);
            }
            else {
                decisionTile = this.findRandomTile(decisionTile);
            }
            
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
    updateNextTileCoords() {
        //Update the Ghost's next tile property
        this.updateNextTile(this);

        //Update the coordinates of the next tile
        this.nextTileCoord.x = this.nextTile.pixelX + 8;
        this.nextTileCoord.y = this.nextTile.pixelY + 8;
    }

    animate(direction) {}

    chase(pacmanTile) {}

    playIdleAnimation() {}

    exitHouse() {}

    enterHouse() {}

    findRandomTile(tiles) {
        let tile = tiles[Math.floor(Math.random() * tiles.length)];
        return tile;
    }

    findReverseTile(tile) {
        let reverseTile;
        if (this.movingDirection == "left") {
            reverseTile = this.maze.getTileAt(tile.x + 1, tile.y);
            
            if (reverseTile.properties.moveable == false) {
                reverseTile = tile;
            }
            else if (reverseTile == null) {
                reverseTile = tile;
            }
            return reverseTile;
        }
        else if (this.movingDirection == "right") {
            reverseTile = this.maze.getTileAt(tile.x - 1, tile.y);
            
            if (reverseTile.properties.moveable == false) {
                reverseTile = tile;
            }
            else if (reverseTile == null) {
                reverseTile = tile;
            }
            return reverseTile;
        }
        else if (this.movingDirection == "down") {
            reverseTile = this.maze.getTileAt(tile.x, tile.y - 1);
            
            if (reverseTile.properties.moveable == false) {
                reverseTile = tile;
            }
            else if (reverseTile == null) {
                reverseTile = tile;
            }
            return reverseTile;
        }
        else if (this.movingDirection == "up") {
            reverseTile = this.maze.getTileAt(tile.x, tile.y + 1);

            if (reverseTile.properties.moveable == false) {
                reverseTile = tile;
            }
            else if (reverseTile == null) {
                reverseTile = tile;
            }
            return reverseTile;
        }
    }

    //Used to reset the direction ghost are looking in the MazeScene after a new scene 
    //is called
    reset() {}
 
}