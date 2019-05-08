function checkCollision(p1, p2) {

    if (p2.contains(p1.x + 14.8, p1.y) || p2.contains(p1.x - 14.8, p1.y) || p2.contains(p1.x, p1.y + 14.8) || p2.contains(p1.x, p1.y - 14.8)) {
        pacman.vx = 0;
        pacman.vy = 0;
    }

}


let largeTopRectangleTexture = TextureCache["large_rect_top.png"];

largeTopRectangle1 = new Sprite(largeTopRectangleTexture);
largeTopRectangle1.position.set(170,52);

largeTopRectangle2 = new Sprite(largeTopRectangleTexture);
largeTopRectangle2.position.set(370,52);

app.stage.addChild(largeTopRectangle1);
app.stage.addChild(largeTopRectangle2);

//Create a rectangle around the sprite to detect collisions
rectangleLargeTop1 = largeTopRectangle1.getBounds();
rectangleLargeTop2 = largeTopRectangle2.getBounds();