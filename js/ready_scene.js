export default class ReadyScene extends Phaser.Scene {
    constructor(scene, pacman, blinky, pinky, inky, clyde) {
        super({ key: "ReadyScene", active: false });
        this.testTime;
        this.ticker = 0;
        this.scene = scene;
        this.pacman;
        this.blinky;
        this.pinky;
        this.inky;
        this.clyde;
    }

    init(data) {
        this.pacman = data.pacman;
        this.blinky = data.blinky;
        this.pinky = data.pinky;
        this.inky = data.inky;
        this.clyde = data.clyde;
    }

    preload() {
        this.load.audio("intro_music", "./assets/audio/pacman_intro.wav");
    }

    create() {
        if (this.pacman.sprite.visible == false) {
            this.pacman.sprite.setVisible(1);
        }

        this.testTime = this.time.addEvent({ delay: 1000, callback: this.getTime, callbackScope: this, loop: true });
        this.pacman.sprite.x = 240;
        this.pacman.sprite.y = 376;
        this.pacman.sprite.setRotation(3.14);
        this.blinky.sprite.x = 240;
        this.blinky.sprite.y = 184;
        this.pinky.reset();
        this.add.text(200, 272, "READY!", { fontFamily: 'emulogic, Verdana, "Times New Roman", Tahoma, serif', fontSize: "14px" }).setColor("#f6f91d");
        let audio = this.sound.add("intro_music");
        audio.setVolume(0.4);
        
        audio.play();
    }

    update(time, delta) {}

    getTime() {
        this.ticker += 1;

        if (this.ticker == 4) {
            this.ticker = 0;
            this.scene.resume("MazeScene");
            this.scene.stop();
        }
    }
}