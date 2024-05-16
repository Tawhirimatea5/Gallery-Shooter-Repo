class SpaceInvaders extends Phaser.Scene {
    constructor(player, enemies1, enemies2, cursors, spacebar, playerLasers, moveEnemyTimed, firingTimer = 200, score = 0, gameOver = false, scoreText, stateText, enemyLasers, done = false, soundFiles = []) {
        super("spaceInvaders");
        this.player = player;
        this.enemies1 = enemies1;
        this.enemies2 = enemies2;
        this.cursors = cursors;
        this.spacebar = spacebar;
        this.playerLasers = playerLasers;
        this.moveEnemyTimed = moveEnemyTimed;
        this.firingTimer = firingTimer;
        this.score = score;
        this.gameOver = gameOver;
        this.scoreText = scoreText;
        this.stateText = stateText;
        this.enemyLasers = enemyLasers;
        this.done = done;
        this.soundFiles = soundFiles;
    }

preload ()
{
    this.load.setPath("./assets/");
    this.load.image('player', './shipss/player_ship.png');
    this.load.image('enemy1', './shipss/normal_ship.png');
    this.load.image('enemy2', './shipss/big_ship.png');
    this.load.image('enemyLaser', './shipss/enemy_laser.png');
    this.load.image('playerLaser', './shipss/player_laser.png');
    this.load.audio('deathShip', './scifiaudio/enemy_death.ogg');
    this.load.audio('hitShip', './impact_sounds/ship_hit.ogg');
    this.load.audio('laserBlast', './impact_sounds/laser_blast.ogg');
    this.load.image('space', './background/bg_02_h.png');
}

create ()
{
    this.add.image(666, 375, 'space');
    this.moveEnemyTimed = new Phaser.Time.TimerEvent({ delay: 1000, callback: this.delayTime, args: [], callbackScope: this, loop: false});
    this.player = this.physics.add.sprite(650, 700, 'player');
    this.player.setCollideWorldBounds(true);
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enemies1 = this.physics.add.group({
         key: 'enemy1',
         repeat: 8,
         setXY: { x: 250, y: 180, stepX: 100},
     }); 
     this.enemies2 = this.physics.add.group({
        key: 'enemy2',
        repeat: 3,
        setXY: {x: 533, y:100, stepX: 200},
     });

     class LaserEnemy extends Phaser.GameObjects.Image
        {
            constructor (scene)
            {
                super(scene, 0, 0, 'enemyLaser');
                this.speed = Phaser.Math.GetSpeed(150, 1);
            }

            fire(x, y) {
                this.setPosition(x, y);
                this.setActive(true);
                this.setVisible(true);
            }

            update (time, delta) {
                this.y += this.speed * delta;
                if (this.y > 750) {
                    this.setActive(false);
                    this.setVisible(false);
                }
            }
        }

    class LaserPlayer extends Phaser.GameObjects.Image
        {
            constructor (scene)
            {   
                super(scene, 0, 0, 'playerLaser');
                this.speed = Phaser.Math.GetSpeed(300, 1);
            }

            fire(x, y) {
                this.setPosition(x, y);
                this.setActive(true);
                this.setVisible(true);
            }

            update (time, delta) {
                this.y += -(this.speed * delta);
                if (this.y < 0) {
                    this.setActive(false);
                    this.setVisible(false);
                }
            }
        }
    this.playerLasers = this.physics.add.group({
        classType: LaserPlayer,
        maxSize: 30,
        runChildUpdate: true,
    });

    this.enemyLasers = this.physics.add.group({
        classType: LaserEnemy,
        maxSize: 30,
        runChildUpdate: true,
    })
    this.enemies1.children.iterate((enemy) => {
        enemy.setVelocityX(120);
        enemy.setScale(0.3);
        enemy.setCollideWorldBounds(true, 1, 1, true);
    });

    this.enemies2.children.iterate((enemy) => {
        enemy.setVelocityX(-80);
        enemy.setScale(0.4);
        enemy.setCollideWorldBounds(true, 1, 1, true);
        enemy.health = 5;
    });

    this.stateText = this.add.text(666, 375, ' ', {fontSize: '32px', fill: '#FFF'});
    this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
    this.spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.physics.add.overlap(this.player, this.enemyLasers, this.playerDeath, null, this);
    console.log(this.player);
}

update ()
{
    if (this.gameOver)
    {
        return;
    }
    else if (this.time.now > this.firingTimer)
        {
            if (this.done === true) {
                this.firingTimer = this.time.now;
            }
            this.enemyFires(this.enemyLasers, this.player);
        }
    else if (Phaser.Input.Keyboard.JustDown(this.spacebar)) {
        const laser = this.playerLasers.get().setScale(0.3);
        this.physics.add.overlap(laser, this.enemies1, this.enemy1Death, null, this);
        this.physics.add.overlap(laser, this.enemies2, this.enemy2Death, null, this);
        if (laser) {
            laser.fire(this.player.x, this.player.y-10);
        }
    }
    if (this.cursors.left.isDown)
    {
        this.player.setVelocityX(-160);
    }
    else if (this.cursors.right.isDown)
    {
        this.player.setVelocityX(160);
    }
    else
    {
        this.player.setVelocityX(0);
    }
    this.enemies1.children.iterate((enemy1) => {
        if (enemy1.body.right > this.physics.world.bounds.width-2) {
            enemy1.setVelocityX(0);
            enemy1.setVelocityY(100);
            enemy1.setX(enemy1.x-5);
            this.moveEnemyTimed.args = [enemy1];
            this.moveEnemyTimed.callback = this.delayTime;
            this.time.addEvent(this.moveEnemyTimed);
        }
        else if (enemy1.body.left === 0) {
            return;
        }
        else if (enemy1.body.left < this.physics.world.bounds.x+3) 
        {
            enemy1.setVelocityX(0);
            enemy1.setVelocityY(100);
            enemy1.setX(enemy1.x+3);
            this.moveEnemyTimed.args = [enemy1];
            this.moveEnemyTimed.callback = this.delayTime;
            this.time.addEvent(this.moveEnemyTimed);
        };
    });
    this.enemies2.children.iterate((enemy2) => {
        if (enemy2.body.right > this.physics.world.bounds.width-3) {
            enemy2.setVelocityX(0);
            enemy2.setVelocityY(80);
            enemy2.setX(enemy2.x-3);
            this.moveEnemyTimed.args = [enemy2];
            this.moveEnemyTimed.callback = this.delayTime;
            this.time.addEvent(this.moveEnemyTimed);
        }
        else if (enemy2.body.left === 0) {
            return;
        }
        else if (enemy2.body.left < this.physics.world.bounds.x+3) 
        {
            enemy2.setVelocityX(0);
            enemy2.setVelocityY(80);
            enemy2.setX(enemy2.x+3);
            this.moveEnemyTimed.args = [enemy2];
            this.moveEnemyTimed.callback = this.delayTime;
            this.time.addEvent(this.moveEnemyTimed);
        };
    });
}

enemyFires(enLasers, player) {
        var en1 = this.enemies1.getChildren();
        var en2 = this.enemies2.getChildren();
        var livingEnemies = en1.concat(en2);
        var i = 0;
        var x;
        livingEnemies.forEach((enem) => {
            if (enem.active === false) {
                livingEnemies.splice(i, 1);
            };
            i += 1;
        });
        const laser = enLasers.get().setScale(0.3);
        if (laser && livingEnemies.length > 0) {
            var rand = Phaser.Math.Between(0, livingEnemies.length-1);
            var shooter = livingEnemies[rand];
            laser.fire(shooter.x, shooter.y+10);
            this.firingTimer += 500;
        }
}
delayTime(args) {
    var enemy = args;
    if (enemy.texture.key === "enemy2") {
    if (enemy.x > 300) {
        enemy.setVelocityY(0);
        enemy.setVelocityX(-80);
    } else {
        enemy.setVelocityY(0);
        enemy.setVelocityX(80);    
    }
    } else {
        if (enemy.x > 300) {
            enemy.setVelocityY(0);
            enemy.setVelocityX(-120);
        } else {
            enemy.setVelocityY(0);
            enemy.setVelocityX(120);    
        }
    }
}

playerDeath(playerr, laser) {
    laser.setActive(false);
    laser.setVisible(false);
    laser.destroy();
    this.player.disableBody(true, true);

    this.enemies1.children.iterate((enemy1) => {
        enemy1.disableBody(true, true);
    })
    this.enemies2.children.iterate((enemy2) => {
        enemy2.disableBody(true, true);
    })
    this.enemyLasers.children.iterate((laserD) => {
        laserD.setY(1000);
    })
    this.stateText.setText("Your score is: " + this.score + "\n Click here to restart").setInteractive();
    this.score = 0;
    this.scoreText.setText("Score: " + this.score);
    this.gameOver = true;
    this.stateText.on('pointerdown', this.restart.bind(this));   
}

enemy1Death(laser, enemy) {
    enemy.disableBody(true, true);
    laser.setY(-100);
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
    if (this.enemies1.countActive(true) === 0)
    {
        var start = 250;
        this.enemies1.children.iterate(function (child) {

            child.enableBody(true, start, 180, true, true);
            start += 100;
            child.setVelocityX(120);;

        });
    }
}

enemy2Death(laser, enemy) {
    laser.setActive(false);
    laser.setY(-100);
    enemy.health -= 1;
    if (enemy.health > 0) {
        return;
    }
    enemy.disableBody(true, true);
    this.score += 30;
    this.scoreText.setText('Score: ' + this.score);
    if (this.enemies2.countActive(true) === 0)
    {
        var start = 533;
        this.enemies2.children.iterate(function (child) {
            child.enableBody(true, start, 100, true, true);
            start += 200;
            child.setVelocityX(-80);
        })
    }
}

restart() {
    this.gameOver = false;
    this.done = true;
    this.player.enableBody(true, 650, 700, true, true);
    this.stateText.setText(' ');
    var start = 250;
        this.enemies1.children.iterate(function (child) {

            child.enableBody(true, start, 180, true, true);
            start += 100
            child.setVelocityX(120);
            child.setCollideWorldBounds(true, 1, 1, true);

        });
    start = 533;
    this.enemies2.children.iterate(function (child) {
            child.enableBody(true, start, 100, true, true);
            start += 200;
            child.setVelocityX(-80);
            child.setCollideWorldBounds(true, 1, 1, true);
    })
}
}
