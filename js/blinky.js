import Ghost from "./ghost.js";

export default class Blinky extends Ghost {
    constructor(scene, maze, positionX, positionY) {
        super(scene, maze, positionX, positionY);

        //Create the Arcade physics sprite for Blinky
        this.sprite = scene.physics.add.sprite(positionX, positionY, "blinky", "blinky_01.png")
                              
        const anims = scene.anims;

        //Create Blinky's animations by using the blinky_anims sprite sheet and json file 
        let blinkyRightFrames = anims.generateFrameNames("blinky", { start: 1, end: 2, zeroPad: 2, prefix:"blinky_", suffix:".png" });
        anims.create({ key: "blinky_right", frames: blinkyRightFrames, frameRate: 17, repeat: -1 });

        let blinkyLeftFrames = anims.generateFrameNames("blinky", { start: 3, end: 4, zeroPad: 2, prefix:"blinky_", suffix:".png" });
        anims.create({ key: "blinky_left", frames: blinkyLeftFrames, frameRate: 17, repeat: -1 });

        let blinkyDownFrames = anims.generateFrameNames("blinky", { start: 5, end: 6, zeroPad: 2, prefix:"blinky_", suffix:".png" });
        anims.create({ key: "blinky_down", frames: blinkyDownFrames, frameRate: 17, repeat: -1 });

        let blinkyUpFrames = anims.generateFrameNames("blinky", { start: 7, end: 8, zeroPad: 2, prefix:"blinky_", suffix:".png" });
        anims.create({ key: "blinky_up", frames: blinkyUpFrames, frameRate: 17, repeat: -1 });

        //Set Blinky's initial next tile and target tile
        this.targetTile = this.maze.getTileAt(13, 26);
        this.nextTile = this.maze.getTileAt(14, 11);

        //Set the coordinates of Blinky's next tile
        this.nextTileCoord.x = this.nextTile.pixelX + 8;
        this.nextTileCoord.y = this.nextTile.pixelY + 8;

        this.scatterTile = this.maze.getTileAt(25, 0);

        this.pelletLimit = 0;

        this.mode = "scatter";
    }

    chase(pacmanTile) {
        this.setTargetTile(pacmanTile);
    }

    animate(direction) {
        if (direction == "left") {
            this.sprite.anims.play("blinky_left", true);
        }
        else if (direction == "right") {
            this.sprite.anims.play("blinky_right", true);
        }
        else if (direction == "up") {
            this.sprite.anims.play("blinky_up", true);
        }
        else if (direction == "down") {
            this.sprite.anims.play("blinky_down", true);
        }
    }

}