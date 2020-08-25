import Ghost from "./ghost.js";

export default class Pinky extends Ghost {
    constructor(scene, maze, positionX, positionY) {
        super(scene, maze, positionX, positionY);

        //Create the Arcade physics sprite for Pinky
        this.sprite = scene.physics.add.sprite(positionX, positionY, "pinky", "pinky_01.png")
                              
        const anims = scene.anims;

        //Create Pinky's animations by using the pinky_anims sprite sheet and json file 
        let pinkyRightFrames = anims.generateFrameNames("pinky", { start: 1, end: 2, zeroPad: 2, prefix:"pinky_", suffix:".png" });
        anims.create({ key: "pinky_right", frames: pinkyRightFrames, frameRate: 17, repeat: -1 });

        let pinkyLeftFrames = anims.generateFrameNames("pinky", { start: 3, end: 4, zeroPad: 2, prefix:"pinky_", suffix:".png" });
        anims.create({ key: "pinky_left", frames: pinkyLeftFrames, frameRate: 17, repeat: -1 });

        let pinkyDownFrames = anims.generateFrameNames("pinky", { start: 5, end: 6, zeroPad: 2, prefix:"pinky_", suffix:".png" });
        anims.create({ key: "pinky_down", frames: pinkyDownFrames, frameRate: 17, repeat: -1 });

        let pinkyUpFrames = anims.generateFrameNames("pinky", { start: 7, end: 8, zeroPad: 2, prefix:"pinky_", suffix:".png" });
        anims.create({ key: "pinky_up", frames: pinkyUpFrames, frameRate: 17, repeat: -1 });

        //Set pinky's initial next tile and target tile
        this.targetTile = this.maze.getTileAt(13, 26);
        this.nextTile = this.maze.getTileAt(14, 13);

        //Set the coordinates of pinky's next tile
        this.nextTileCoord.x = this.nextTile.pixelX + 8;
        this.nextTileCoord.y = this.nextTile.pixelY + 8;

        this.scatterTile = this.maze.getTileAt(4, 0);

        this.pelletLimit = 0;
        this.mode = "exit";

        this.distance = 0;
        this.idleStarted = false;
        this.moveNeutralUp = false;
        this.isInside = true;
        this.exitStarted = false;
        this.enterStarted = false;
    }

    chase(pacmanTile, movingDirection) {
        const offset = 4;
        let offsetTile;

        if (movingDirection == "left") {
            offsetTile = this.maze.getTileAt(pacmanTile.x - 4, pacmanTile.y);

            if (offsetTile == null) {
                offsetTile = this.maze.getTileAt(1, pacmanTile.y);
            }

            this.setTargetTile(offsetTile);
        }
        else if (movingDirection == "right") {
            offsetTile = this.maze.getTileAt(pacmanTile.x + 4, pacmanTile.y);

            if (offsetTile == null) {
                offsetTile = this.maze.getTileAt(28, pacmanTile.y);
            }

            this.setTargetTile(offsetTile);
        }
        else if (movingDirection == "up") {
            offsetTile = this.maze.getTileAt(pacmanTile.x - offset, pacmanTile.y - offset);

            if (offsetTile == null) {
                offsetTile = this.maze.getTileAt(pacmanTile.x, 0);
            }

            this.setTargetTile(offsetTile);
        }
        else if (movingDirection == "down") {
            offsetTile = this.maze.getTileAt(pacmanTile.x - 4, pacmanTile.y + 4);

            if (offsetTile == null) {
                offsetTile = this.maze.getTileAt(pacmanTile.x, 30);
            }

            this.setTargetTile(offsetTile);
        }
    }

    animate(direction) {
        if (direction == "left") {
            this.sprite.anims.play("pinky_left", true);
        }
        else if (direction == "right") {
            this.sprite.anims.play("pinky_right", true);
        }
        else if (direction == "up") {
            this.sprite.anims.play("pinky_up", true);
        }
        else if (direction == "down") {
            //An if statement is needed in order to reset Pinky's eyes when the 
            //ReadyScene is called
            if (this.sprite.anims != undefined) {
                this.sprite.anims.play("pinky_down", true);
            }
        }
    }

    exitHouse() {
        if (this.exitStarted == false) {
            this.distance = 0;
            this.exitStarted = true;
        }

        if (this.distance < 48) {
            this.sprite.y -= 1;
            this.animate("up");
            this.distance += 1;
        }

        if (this.distance >= 48) {
            this.sprite.body.reset(this.maze.getTileAt(15, 11).pixelX, this.maze.getTileAt(15, 11).pixelY + 8);
            this.nextTile = this.maze.getTileAt(14, 11);
            this.nextTileCoord.x = this.nextTile.pixelX + 8;
            this.nextTileCoord.y = this.nextTile.pixelY + 8;
            this.isInside = false;
            if (this.scene.currentMode != "frightened" && this.scene.currentMode != "frozen") {
                this.setMode(this.scene.currentMode);
            }
            else {
                this.setMode("chase");
            }
        }
        
    }

    checkHeight() {
        if (this.sprite.y > this.maze.getTileAt(15, 11).pixelY + 8) {
            this.sprite.body.reset(this.maze.getTileAt(15, 11).pixelX, this.maze.getTileAt(15, 11).pixelY + 8);
        }
        else {
            if (this.scene.currentMode != "frightened" && this.scene.currentMode != "frozen") {
                this.setMode(this.scene.currentMode);
            }
            else {
                this.setMode("chase");
            }
        }
    }

    enterHouse() {
        if (this.enterStarted == false) {
            this.distance = 0;
            this.enterStarted = true;
            this.isInside = true;
        }

        if (this.distance < 48) {
            this.sprite.y += 1;
            this.animate("down");
            this.distance += 1;
        }

        if (this.distance >= 48) {
            this.sprite.body.reset(this.maze.getTileAt(15, 14).pixelX, this.maze.getTileAt(15, 14).pixelY + 8);
            this.distance = 0;
            this.enterStarted = false;
            this.setMode("exit");
        } 
    }

    reset() {
        this.animate("down");
    }

}