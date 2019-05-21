import Ghost from "./ghost.js";

export default class Clyde extends Ghost {
    constructor(scene, maze, positionX, positionY) {
        super(scene, maze, positionX, positionY);

        //Create the Arcade physics sprite for Clyde
        this.sprite = scene.physics.add.sprite(positionX, positionY, "clyde", "clyde_01.png")
                              
        const anims = scene.anims;

        //Create Clyde's animations by using the clyde_anims sprite sheet and json file 
        let clydeRightFrames = anims.generateFrameNames("clyde", { start: 1, end: 2, zeroPad: 2, prefix:"clyde_", suffix:".png" });
        anims.create({ key: "clyde_right", frames: clydeRightFrames, frameRate: 17, repeat: -1 });

        let clydeLeftFrames = anims.generateFrameNames("clyde", { start: 3, end: 4, zeroPad: 2, prefix:"clyde_", suffix:".png" });
        anims.create({ key: "clyde_left", frames: clydeLeftFrames, frameRate: 17, repeat: -1 });

        let clydeDownFrames = anims.generateFrameNames("clyde", { start: 5, end: 6, zeroPad: 2, prefix:"clyde_", suffix:".png" });
        anims.create({ key: "clyde_down", frames: clydeDownFrames, frameRate: 17, repeat: -1 });

        let clydeUpFrames = anims.generateFrameNames("clyde", { start: 7, end: 8, zeroPad: 2, prefix:"clyde_", suffix:".png" });
        anims.create({ key: "clyde_up", frames: clydeUpFrames, frameRate: 17, repeat: -1 });

        //Set Clyde's initial next tile and target tile
        this.targetTile = this.maze.getTileAt(13, 26);
        this.nextTile = this.maze.getTileAt(14, 11);

        //Set the coordinates of Clyde's next tile
        this.nextTileCoord.x = this.nextTile.pixelX + 8;
        this.nextTileCoord.y = this.nextTile.pixelY + 8;

        this.scatterTile = this.maze.getTileAt(1, 30);

        //The minimum distance Clyde can be away from Pac-Man before switching to scatter mode
        //Clyde must be 8 tiles (8 x 16 pixels) away from Pac-Man to stay in chase mode
        this.minDistance = 176;
    }

    chase(pacmanTile) {
        //Find and store the exact tile Pac-Man currently occupies
        let tile = this.maze.getTileAt(pacmanTile.x, pacmanTile.y);

        //The distance between Clyde's current tile and Pac-Man's current tile
        let distance = Phaser.Math.Distance.Between(tile.pixelX, tile.pixelY, this.sprite.x + 8, this.sprite.y + 8);
        
        if (distance > this.minDistance) {
            this.setTargetTile(pacmanTile);
        }
        else {
            this.setTargetTile(this.scatterTile);
            this.mode = "scatter";
        }
    }

    animate(direction) {
        if (direction == "left") {
            this.sprite.anims.play("clyde_left", true);
        }
        else if (direction == "right") {
            this.sprite.anims.play("clyde_right", true);
        }
        else if (direction == "up") {
            this.sprite.anims.play("clyde_up", true);
        }
        else if (direction == "down") {
            this.sprite.anims.play("clyde_down", true);
        }
    }

}