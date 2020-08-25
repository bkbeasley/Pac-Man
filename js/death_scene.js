

export default class DeathScene extends Phaser.Scene {
    constructor() {
        super({ key: "DeathScene", active: false });
        this.testTime;
        this.ticker = 0;
        this.pacman;
        this.blinky;
        this.pinky;
        this.inky;
        this.clyde;
        this.anim;
        this.sprite;
        this.playerRecentlyDied;
    }

    preload() {
        this.load.atlas("pacman_death", "./assets/sprites/pacman/death_anims.png", "./assets/sprites/pacman/death_anims.json");
        this.load.audio("pacman_death_audio", "./assets/audio/pacman_death.wav");
    }

    init(data) {
        this.pacman = data.pacman;
        this.blinky = data.blinky;
        this.pinky = data.pinky;
        this.inky = data.inky;
        this.clyde = data.clyde;
    }

    create() {
        /* this.pacman.sprite.setVisible(0);
        this.blinky.sprite.setVisible(0);
        this.pinky.sprite.setVisible(0);
        this.inky.sprite.setVisible(0);
        this.clyde.sprite.setVisible(0); */
        let deathFrames = this.anims.generateFrameNames("pacman_death", { start: 1, end: 9, zeroPad: 2, prefix:"death_", suffix:".png" });
        this.anims.create({ key: "play_death", frames: deathFrames, frameRate: 5, repeat: 0 });

        this.sprite = this.physics.add.sprite(this.pacman.sprite.x, this.pacman.sprite.y, "pacman_death", "death_01.png");
        //this.sprite = this.physics.add.sprite(60, 50, "pacman_death", "death_01.png");
        //this.sprite.setVisible(0);

        this.pacman.sprite.setVisible(0);
        this.blinky.sprite.setVisible(0);
        
        this.sprite.anims.play("play_death", true);
        this.testTime = this.time.addEvent({ delay: 1000, callback: this.getTime, callbackScope: this, loop: true });
        let music = this.sound.add("pacman_death_audio");
        music.play();
    
    }

    update(time, delta) {}

    getTime() {
        this.ticker += 1;

        if (this.ticker == 2) {
            this.ticker = 0;
            //this.scene.resume("MazeScene");
            this.scene.launch("ReadyScene", { pacman: this.pacman, blinky: this.blinky, pinky: this.pinky, inky: this.inky, clyde: this.clyde });
            this.scene.stop();
        }
    }
}