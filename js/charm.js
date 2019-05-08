"use strict";

let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 }
        }
    }
};

let game = new Phaser.Game(config);

let pacman;

function preload() {
    this.load.image("tiles", "./assets/maze5.png");
    this.load.tilemapTiledJSON("map", "./assets/test_tile_map.json");
    this.load.image("pacman", "./assets/pacman_01.png");

}

let cursors;
let currentTile;
let map;
let tiles;
let mazeLayer;
let movingDirection = "right";

function create() {
    
    map = this.make.tilemap({ key: "map" });

    // Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
    // Phaser's cache (i.e. the name you used in preload)
    const tileset = map.addTilesetImage("maze5", "tiles");

    // Parameters: layer name (or index) from Tiled, tileset, x, y
    mazeLayer = map.createStaticLayer("Tile Layer 1", tileset, 0, 0);

  //mazeLayer.setCollisionFromCollisionGroup();
  
  //this.matter.world.convertTilemapLayer(mazeLayer);
  //this.matter.world.setBounds(map.widthInPixels, map.heightInPixels);

  //const collisionLayer = map.createStaticLayer("Collision", tileset, 0, 0);

  pacman = this.physics.add.image(40, 40, "pacman");

  pacman.x = 100;

  let tile1 = map.getTileAt(384,0);

  tiles = map.layers[0].data;

  //let testCollision = map.objects[0].objects[0];
  map.setCollision([30, 41]);
  pacman.x = 270;
  pacman.y = 23;
  console.log(map);

  console.log(tiles);
  currentTile = map.findByIndex(30); 
  

  //console.log(moveableTiles);
  //console.log(map.getTileAtWorldXY(64,64));

  //console.log(currentTile);

  //for (let columns = 0; columns < )

  //console.log(map);

  const debugGraphics = this.add.graphics().setAlpha(0.75);
 mazeLayer.renderDebug(debugGraphics, {
  tileColor: null, // Color of non-colliding tiles
  collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // Color of colliding tiles
  faceColor: new Phaser.Display.Color(40, 39, 37, 255) // Color of colliding face edges
}); 

cursors = this.input.keyboard.createCursorKeys();

//pacman.x = start.x + 10;
//pacman.y = start.y + 10;
    
}

function update(time, delta) {

  let maxDistance = 0;
  let maxTime = 0;
  //let pacTile = trackPacMan();
  let nextTile = getNextTile("left");



  

    // Stop any previous movement from the last frame
    if (checkNextTile(nextTile)) {
        pacman.body.setVelocityX(100);
    }
    else {
        pacman.body.setVelocityX(0);
    }
  
  // Horizontal movement
  if (cursors.left.isDown) {
      
    pacman.x -= 5;
  } else if (cursors.right.isDown) {
        pacman.x += 5;

        /* Check the next tile. If the next tile is moveable, set 
        velocity x to 100. If the next tile is not moveable, set 
        velocity x to 0.
        */


         nextTile = getNextTile("right");
        
        //If the next tile is moveable
        if(checkNextTile(nextTile)) {
            pacman.body.setVelocityX(100);
        }
        //If the next tile is not moveable
        else {
            pacman.body.setVelocityX(0);
            console.log("DUDDU");
        }

        
        
        /* pacman.body.setVelocityY(0);
        maxDistance = calculateMaxDistance(pacTile, "right");
        maxTime = calculateTime(maxDistance, 100);

        pacman.body.setVelocityX(100);

        stopPacman(maxTime);
        updatePacmanTile((maxDistance / 23) + 1, "right"); */
  }

  // Vertical movement
  if (cursors.up.isDown) {
    pacman.y -= 5;
    //pacman.body.setVelocityY(-100);
  } else if (cursors.down.isDown) {
      pacman.body.setVelocityX(0);
    pacman.y += 5;
    //pacman.body.setVelocityY(100);
  }

}


/* function getPacmanTile(layer) {
    if (layer == undefined) {
        console.log("UNDEFINED!!!!!!");
        throw new Error();
    }
    layer.forEachTile(function (tile) {
        console.log(layer);
        if (tile.properties.pacmanHere == true) {
            console.log("Pacman is at tile: " + tile.index);
            return tile;
        }
    });
} */


// This function returns the tile Pacman's center is currently occupying
function trackPacMan() {
    let testTile = mazeLayer.findTile(function(tile) {
        if(pacman.x >= tile.pixelX && pacman.x <= tile.pixelX + 23 && pacman.y >= tile.pixelY && pacman.y <= tile.pixelY + 23) {
            return tile;
        }

    });
    if (testTile == null) { return null};
    
    return {x: testTile.x, y: testTile.y};
}

//This function returns the next tile based on Pacman's velocity vector
function getNextTile(direction) {
    let nextTileXY;
    let nextTile;

    if (direction == "right") {
        nextTileXY = trackPacMan();
        nextTileXY.x += 1;
        nextTile = mazeLayer.getTileAt(nextTileXY.x, nextTileXY.y);
    }
    else if (direction == "left") {
        nextTileXY = trackPacMan();
        nextTileXY.x -= 1;
        nextTile = getTileAt(nextTileXY.x, nextTileXY.y);
    }
    else if (direcion == "up") {
        nextTileXY = trackPacMan();
        nextTileXY.y -= 1;
        nextTile = getTileAt(nextTileXY.x, nextTileXY.y);
    }
    else if (direction == "down") {
        nextTileXY = trackPacMan();
        nextTileXY.y += 1;
        nextTile = getTileAt(nextTileXY.x, nextTileXY.y);
    }

    return nextTile;

}

function checkNextTile(nextTile) {
    if (nextTile.properties.moveable == true) {
        return true;
    }
    else {
        return false;
    }
}

function stopPacman(time) {
    setTimeout(() => { 
        pacman.body.setVelocityX(0);
    }, time * 1000);
}

function calculateMaxDistance(tile, direction) {
    let count = 0;
    let nextTile;
    let tileWidth = 23;
    let tileHeight = 23;
    let oldTile;
    let newTile;

    mazeLayer.forEachTile(function (tile) {
        if (tile.properties.pacmanHere == true) {
            currentTile2 = tile;
        }
    });

    if (currentTile2.properties.moveable == true && direction == "right") {
        nextTile = map.findByIndex(currentTile2.index + 1);
        while (nextTile.properties.moveable == true) {
            currentTile2 = nextTile;
            count++;
            nextTile = map.findByIndex(currentTile2.index + 1);
        }
    }
    
    return count * tileWidth;
}

function calculateTime(distance, velocity) {
    let time = 0;

    if (distance == 0) {
        return time;
    }
    else {
        time = distance / velocity;
        return time;
    }
}

function moveCurrentTile(x, y) {
    let test = map.getTileAtWorldXY(currentTile.x + 64, currentTile.y + 64);
    console.log(test);
}







function drawCollisionShapes (graphics)
{
    graphics.clear();

    // Loop over each tile and visualize its collision shape (if it has one)
    layer.forEachTile(function (tile)
    {
        var tileWorldX = tile.getLeft();
        var tileWorldY = tile.getTop();
        var collisionGroup = tile.getCollisionGroup();

        // console.log(collisionGroup);

        if (!collisionGroup || collisionGroup.objects.length === 0) { return; }

        // The group will have an array of objects - these are the individual collision shapes
        var objects = collisionGroup.objects;

        for (var i = 0; i < objects.length; i++)
        {
            var object = objects[i];
            var objectX = tileWorldX + object.x;
            var objectY = tileWorldY + object.y;

            // When objects are parsed by Phaser, they will be guaranteed to have one of the
            // following properties if they are a rectangle/ellipse/polygon/polyline.
            if (object.rectangle)
            {
                graphics.strokeRect(objectX, objectY, object.width, object.height);
            }
            else if (object.ellipse)
            {
                // Ellipses in Tiled have a top-left origin, while ellipses in Phaser have a center
                // origin
                graphics.strokeEllipse(
                    objectX + object.width / 2, objectY + object.height / 2,
                    object.width, object.height
                );
            }
            else if (object.polygon || object.polyline)
            {
                var originalPoints = object.polygon ? object.polygon : object.polyline;
                var points = [];
                for (var j = 0; j < originalPoints.length; j++)
                {
                    var point = originalPoints[j];
                    points.push({
                        x: objectX + point.x,
                        y: objectY + point.y
                    });
                }
                graphics.strokePoints(points);
            }
        }
    });
}


