export default class PacMan {
    constructor(scene, maze, positionX, positionY) {
        this.scene = scene;
        this.maze = maze;

        //Create the Arcade physics sprite for Pac-Man
        this.sprite = scene.physics.add
                                    .sprite(positionX, positionY, "pacman", "pacman_01.png")
                                    .setRotation(3.14)
                                    .setSize(16, 16);   //Sizes and positions the boundary of Pac-Man's body as a rectangle
                                                        //This is needed because otherwise, Pac-Man will be unable to move between tiles
                                                        //because the pixel size of his sprite exceeds the size of a tile 

        //Direction Pac-Man is moving
        this.movingDirection = "left";
                                                                       
        const anims = scene.anims;

        //Create Pac-Man's animations by using the pac_anims sprite sheet and json file 
        let pacmanFrames = anims.generateFrameNames("pacman", { start: 1, end: 3, zeroPad: 2, prefix:"pacman_", suffix:".png" });
        anims.create({ key: "chomp", frames: pacmanFrames, frameRate: 20, repeat: -1 });

        //Enable keyboard input using the arrow keys
        this.keys = scene.input.keyboard.createCursorKeys();

        this.pelletsEaten = 0;

        this.maxSpeed = 200;
        this.speed = .8 * this.maxSpeed;
        this.sprite.setVelocityX(-this.speed);
    }

    currentTile() {
        let currentTile;
        let pacman = this.sprite;

        //Uses the width and height of each tile in its search
        currentTile = this.maze.findTile(function (tile) {
        //If Pac-Man's center coords are within the current tile's area
        if (pacman.x >= tile.pixelX && pacman.x <= tile.pixelX + 16 && pacman.y >= tile.pixelY && pacman.y <= tile.pixelY + 16) {
                return tile;
            }
        });

        if (currentTile == null) { return null };

        //Return the occupied tile if the tile is not equal to null
        return {x: currentTile.x, y: currentTile.y};
    }

    update() {
        this.sprite.anims.play("chomp", true);

        //The if/else statements below occur when the player
        //uses the arrow keys to move Pac-Man 

        //If the right arrow key is pressed
        if (this.keys.right.isDown) {
            this.sprite.setVelocityX(this.speed);
            this.movingDirection = "right";

            if (this.sprite.body.velocity.y == 0) {
                this.sprite.setRotation(0);
            }
        }
        //If the left arrow key is pressed
        if (this.keys.left.isDown) {
            this.sprite.setVelocityX(-this.speed);
            this.movingDirection = "left";

            if (this.sprite.body.velocity.y == 0) {
                this.sprite.setRotation(3.14);
            }
        } 
        //If the up arrow key is pressed
        if (this.keys.up.isDown) {
            this.sprite.setVelocityY(-this.speed);
            this.movingDirection = "up";

            if(this.sprite.body.velocity.x == 0) {
                this.sprite.setRotation(4.71);
            }
        } 
        //If the down arrow key is pressed
        if (this.keys.down.isDown) {
            this.sprite.setVelocityY(this.speed);
            this.movingDirection = "down";

            if (this.sprite.body.velocity.x == 0) {
                this.sprite.setRotation(1.57);
            }
        }

    }

    
}