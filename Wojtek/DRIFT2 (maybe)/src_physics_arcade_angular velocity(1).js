class Example extends Phaser.Scene {
    plane;
    planeSpeed = 150;

    preload() {
        this.load.image('clouds', 'assets/skies/clouds.png');
        this.load.image('plane', 'assets/sprites/ww2plane90.png');
    }

    create() {
        this.add.image(0, 0, 'clouds').setOrigin(0, 0);

        this.plane = this.physics.add.image(400, 300, 'plane')
            .setCircle(24, 0, 7.5)
            .setVelocity(0, 0); // Initial velocity is set to 0

        this.input.keyboard
            .on('keydown-LEFT', () => { this.plane.setAngularVelocity(-60); })
            .on('keydown-RIGHT', () => { this.plane.setAngularVelocity(60); })
            .on('keydown-UP', () => {this.plane.setAngularVelocity(0)
            });
    }

    update() {
        if(this.planeSpeed<=1000)
       { 
        this.planeSpeed+=2;
       }
        this.physics.velocityFromAngle(this.plane.angle, this.planeSpeed, this.plane.body.velocity);

        this.physics.world.wrap(this.plane, 32);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
    },
    scene: Example
};

const game = new Phaser.Game(config);
