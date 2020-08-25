export default class Level {
    constructor(level, fruit, bonusPoints, pacmanSpeed, ghostSpeed, 
                tunnelSpeed, elroyOneDotsLeft, elroyOneSpeed, elroyTwoDotsLeft,
                elroyTwoSpeed, pacmanFrightSpeed, ghostFrightSpeed, scatterPeriods,
                chasePeriods, frightTime, fruitDotsLeft, inkyPelletAmount, clydePelletAmount) {
        this.level = level,
        this.hasStarted = false,
        this.pelletsLeft = 244,
        this.fruit = fruit,
        this.bonusPoints = bonusPoints,
        this.pacmanSpeed = pacmanSpeed,
        this.ghostSpeed = ghostSpeed,
        this.tunnelSpeed = tunnelSpeed,
        this.elroyOneDotsLeft = elroyOneDotsLeft,
        this.elroyOneSpeed = elroyOneSpeed,
        this.elroyTwoDotsLeft = elroyTwoDotsLeft,
        this.elroyTwoSpeed = elroyTwoSpeed,
        this.pacmanFrightSpeed = pacmanFrightSpeed,
        this.ghostFrightSpeed = ghostFrightSpeed,
        this.scatterPeriods = scatterPeriods,
        this.chasePeriods = chasePeriods,
        this.frightTime = frightTime,
        this.fruitDotsLeft = fruitDotsLeft,
        this.fruitDisplayed = false,
        this.fruitTimeout = false,
        this.fruitEaten = false,
        this.inkyPelletAmount = inkyPelletAmount,
        this.clydePelletAmount = clydePelletAmount;
    }


}