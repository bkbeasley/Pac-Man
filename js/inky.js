import Ghost from "./ghost.js";

export default class Inky extends Ghost {
    constructor(scene, maze, positionX, positionY) {
        super(scene, maze, positionX, positionY);

        //Create the Arcade physics sprite for Inky
        this.sprite = scene.physics.add.sprite(positionX, positionY, "inky", "inky_01.png")
                              
        const anims = scene.anims;

        //Create Inky's animations by using the inky_anims sprite sheet and json file 
        let inkyRightFrames = anims.generateFrameNames("inky", { start: 1, end: 2, zeroPad: 2, prefix:"inky_", suffix:".png" });
        anims.create({ key: "inky_right", frames: inkyRightFrames, frameRate: 17, repeat: -1 });

        let inkyLeftFrames = anims.generateFrameNames("inky", { start: 3, end: 4, zeroPad: 2, prefix:"inky_", suffix:".png" });
        anims.create({ key: "inky_left", frames: inkyLeftFrames, frameRate: 17, repeat: -1 });

        let inkyDownFrames = anims.generateFrameNames("inky", { start: 5, end: 6, zeroPad: 2, prefix:"inky_", suffix:".png" });
        anims.create({ key: "inky_down", frames: inkyDownFrames, frameRate: 17, repeat: -1 });

        let inkyUpFrames = anims.generateFrameNames("inky", { start: 7, end: 8, zeroPad: 2, prefix:"inky_", suffix:".png" });
        anims.create({ key: "inky_up", frames: inkyUpFrames, frameRate: 17, repeat: -1 });

        //Set inky's initial next tile and target tile
        this.targetTile = this.maze.getTileAt(14, 11);
        this.nextTile = this.maze.getTileAt(14, 14);

        //Set the coordinates of inky's next tile
        this.nextTileCoord.x = this.nextTile.pixelX + 8;
        this.nextTileCoord.y = this.nextTile.pixelY + 8;

        this.scatterTile = this.maze.getTileAt(28, 30);

        this.pelletLimit = 30;

        this.distance = 0;
        this.idleStarted = false;
        this.moveNeutralUp = false;
        this.exitStarted = false;
        this.isInside = true;

        this.mode = "idle";    
    }

    chase(pacmanTile, movingDirection, blinkyTile) {
        const offset = 2;
        let offsetTile;
        let nextTileX, nextTileY,
            distanceX, distanceY;

        if (movingDirection == "left") {
            offsetTile = this.maze.getTileAt(pacmanTile.x - offset, pacmanTile.y);

            if (offsetTile == null) {
                offsetTile = this.maze.getTileAt(1, pacmanTile.y);
            }

            distanceX = offsetTile.x - blinkyTile.x;
            distanceY = offsetTile.y - blinkyTile.y; 

            nextTileX = offsetTile.x + distanceX;
            nextTileY = offsetTile.y + distanceY;

            if (nextTileX < 1 || nextTileX > 28 || nextTileY < 0 || nextTileY > 30) {

                if (this.maze.getTileAt(nextTileX, nextTileY) == this.warpTileLeft || 
                    this.maze.getTileAt(nextTileX, nextTileY) == this.warpTileRight) 
                {
                    this.setTargetTile(this.maze.getTileAt(nextTileX, nextTileY));
                    return;
                }
                else {
                    this.setTargetTile(this.findInBoundsTile(nextTileX, nextTileY));
                    return;
                }
            }
            else {
                this.setTargetTile(this.maze.getTileAt(nextTileX, nextTileY));
                return;
            }
        }
        else if (movingDirection == "right") {
            offsetTile = this.maze.getTileAt(pacmanTile.x + offset, pacmanTile.y);

            if (offsetTile == null) {
                offsetTile = this.maze.getTileAt(28, pacmanTile.y);
            }

            distanceX = offsetTile.x - blinkyTile.x;
            distanceY = offsetTile.y - blinkyTile.y; 

            nextTileX = offsetTile.x + distanceX;
            nextTileY = offsetTile.y + distanceY;

            if (nextTileX < 1 || nextTileX > 28 || nextTileY < 0 || nextTileY > 30) {

                if (this.maze.getTileAt(nextTileX, nextTileY) == this.warpTileLeft || 
                    this.maze.getTileAt(nextTileX, nextTileY) == this.warpTileRight) 
                {
                    this.setTargetTile(this.maze.getTileAt(nextTileX, nextTileY));
                    return;
                }
                else {
                    this.setTargetTile(this.findInBoundsTile(nextTileX, nextTileY));
                    return;
                }
            }
            else {
                this.setTargetTile(this.maze.getTileAt(nextTileX, nextTileY));
                return;
            }
        }
        else if (movingDirection == "up") {
            offsetTile = this.maze.getTileAt(pacmanTile.x, pacmanTile.y - offset);

            if (offsetTile == null) {
                offsetTile = this.maze.getTileAt(pacmanTile.x, 0);
            }

            distanceX = offsetTile.x - blinkyTile.x;
            distanceY = offsetTile.y - blinkyTile.y; 

            nextTileX = offsetTile.x + distanceX;
            nextTileY = offsetTile.y + distanceY;

            if (nextTileX < 1 || nextTileX > 28 || nextTileY < 0 || nextTileY > 30) {

                if (this.maze.getTileAt(nextTileX, nextTileY) == this.warpTileLeft || 
                    this.maze.getTileAt(nextTileX, nextTileY) == this.warpTileRight) 
                {
                    this.setTargetTile(this.maze.getTileAt(nextTileX, nextTileY));
                    return;
                }
                else {
                    this.setTargetTile(this.findInBoundsTile(nextTileX, nextTileY));
                    return;
                }
            }
            else {
                this.setTargetTile(this.maze.getTileAt(nextTileX, nextTileY));
                return;
            }
        }
        else if (movingDirection == "down") {
            offsetTile = this.maze.getTileAt(pacmanTile.x, pacmanTile.y + offset);

            if (offsetTile == null) {
                offsetTile = this.maze.getTileAt(pacmanTile.x, 30);
            }

            distanceX = offsetTile.x - blinkyTile.x;
            distanceY = offsetTile.y - blinkyTile.y; 

            nextTileX = offsetTile.x + distanceX;
            nextTileY = offsetTile.y + distanceY;

            if (nextTileX < 1 || nextTileX > 28 || nextTileY < 0 || nextTileY > 30) {

                if (this.maze.getTileAt(nextTileX, nextTileY) == this.warpTileLeft || 
                    this.maze.getTileAt(nextTileX, nextTileY) == this.warpTileRight) 
                {
                    this.setTargetTile(this.maze.getTileAt(nextTileX, nextTileY));
                    return;
                }
                else {
                    this.setTargetTile(this.findInBoundsTile(nextTileX, nextTileY));
                    return;
                }
            }
            else {
                this.setTargetTile(this.maze.getTileAt(nextTileX, nextTileY));
                return;
            }
        }
    }

    animate(direction) {
        if (direction == "left") {
            this.sprite.anims.play("inky_left", true);
        }
        else if (direction == "right") {
            this.sprite.anims.play("inky_right", true);
        }
        else if (direction == "up") {
            this.sprite.anims.play("inky_up", true);
        }
        else if (direction == "down") {
            this.sprite.anims.play("inky_down", true);
        }
    }

    findInBoundsTile(tileX, tileY) {
        let inBoundsTile;

        if (tileX < 1) {
            if (tileY < 0) {
                inBoundsTile = this.maze.getTileAt(1, 0);
                return inBoundsTile;
            }
            else if (tileY > 30) {
                inBoundsTile = this.maze.getTileAt(1, 30);
                return inBoundsTile;
            }
            else {
                inBoundsTile = this.maze.getTileAt(1, tileY);
                return inBoundsTile;
            }
        }
        else if (tileX > 28) {
            if (tileY < 0) {
                inBoundsTile = this.maze.getTileAt(28, 0);
                return inBoundsTile;
            }
            else if (tileY > 30) {
                inBoundsTile = this.maze.getTileAt(28, 30);
                return inBoundsTile;
            }
            else {
                inBoundsTile = this.maze.getTileAt(28, tileY);
                return inBoundsTile;
            }
        }
        else if (tileY < 0) {
            if (tileX < 1) {
                inBoundsTile = this.maze.getTileAt(1, 0);
                return inBoundsTile;
            }
            else if (tileX > 28) {
                inBoundsTile = this.maze.getTileAt(28, 0);
                return inBoundsTile;
            }
            else {
                inBoundsTile = this.maze.getTileAt(tileX, 0);
                return inBoundsTile;
            }
        }
        else if (tileY > 30) {
            if (tileX < 1) {
                inBoundsTile = this.maze.getTileAt(1, 30);
                return inBoundsTile;
            }
            else if (tileX > 28) {
                inBoundsTile = this.maze.getTileAt(28, 30);
                return inBoundsTile;
            }
            else {
                inBoundsTile = this.maze.getTileAt(tileX, 30);
                return inBoundsTile;
            }
        }
        else {
            throw new Error("The current tile is already in bounds.");
        }
    }

    playIdleAnimation() {
        if (this.idleStarted != true) {
            this.distance = 0;
            this.idleStarted = true;
        }

        if (this.moveNeutralUp == true) {
            if (this.distance < 12) {
                this.sprite.y -= 1;
                this.distance += 1;
                this.animate("up");
            }
            else {
                this.distance = 0;
                this.moveNeutralUp = false;
            }
        
        }

        if (this.distance < 12) {
            this.sprite.y -= 1;
            this.distance += 1;
            this.animate("up");
        }
        else if (this.distance >= 12) {
            this.sprite.y += 1;
            this.distance += 1;
            this.animate("down");

            if (this.distance == 36) {
                this.distance = 0;
                this.moveNeutralUp = true;
            }
        }

    }

    exitHouse() {
        if (this.exitStarted == false) {
            this.distance = 0;
            this.exitStarted = true;
        }

        if (this.distance < 32) {
            this.sprite.x += 1;
            this.animate("right");
            this.distance += 1;
        }
        else {
            if (this.distance > 80) {
                this.nextTile = this.maze.getTileAt(14, 11);
                this.nextTileCoord.x = this.nextTile.pixelX + 8;
                this.nextTileCoord.y = this.nextTile.pixelY + 8;
                this.isInside = false;

                //this.setMode("scatter");
                this.checkHeight();
            }
            if (this.distance >= 32) {
                this.sprite.y -= 1;
                this.distance += 1
                this.animate("up");
                
                if (this.sprite.y == this.maze.getTileAt(15, 11).pixelY + 8) {
                    
                    this.nextTile = this.maze.getTileAt(14, 11);
                    this.nextTileCoord.x = this.nextTile.pixelX + 8;
                    this.nextTileCoord.y = this.nextTile.pixelY + 8;
                    this.isInside = false;

                    this.checkHeight();
//                    this.setMode("scatter");
                }
            } 
        }

    }

    checkHeight() {
        if (this.sprite.y > this.maze.getTileAt(15, 11).pixelY + 8) {
            this.sprite.body.reset(this.maze.getTileAt(15, 11).pixelX, this.maze.getTileAt(15, 11).pixelY + 8);
        }
        else {
            this.setMode("scatter");
        }
    }

    

}