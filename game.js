const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false
const camera = {
    x: 0,
    y: 0,
    smooth: 0.08
}
const sprites = {
    down: [],
    up: [],
    left: [],
    right: []
}
const enemyTypes = {

    normal:{
        speed:2,
        hp:2,
        size:40,
        sprite:0
    },

    fast:{
        speed:3.5,
        hp:2,
        size:35,
        sprite:1
    },

    tank:{
        speed:1,
        hp:6,
        size:50,
        sprite:2
    },

    boss:{
        speed:1,
        hp:20,
        size:50,
        sprite:2
    }

}


function loadSprite(src){
    const img = new Image()
    img.src = src
    return img
}

sprites.down.push(loadSprite("img/herobaixodireita.png"))
sprites.down.push(loadSprite("img/herobaixoesquerda.png"))

sprites.up.push(loadSprite("img/herocostas.png"))
sprites.up.push(loadSprite("img/herocostasdireita.png"))

sprites.left.push(loadSprite("img/heroesquerda.png"))
sprites.left.push(loadSprite("img/heroesquerda2.png"))

sprites.right.push(loadSprite("img/herodireita2.png"))
sprites.right.push(loadSprite("img/herodireita3.png"))

const enemySprites = []

const grassTiles = []

const grass1 = new Image()
grass1.src = "img/grass1.png"

const grass2 = new Image()
grass2.src = "img/grass2.png"

const grass3 = new Image()
grass3.src = "img/grass3.png"

const grass4 = new Image()
grass4.src = "img/grass4.png"

const grass5 = new Image()
grass5.src = "img/grass5.png"

grassTiles.push(grass1)
grassTiles.push(grass2)
grassTiles.push(grass3)
grassTiles.push(grass4)
grassTiles.push(grass5)

// POWER UP MAÇA
const appleImg = new Image()
appleImg.src = "img/apple.png"

let apples = []
let appleTimer = 0
let circleShotTimer = 0


function loadEnemy(src){
    const img = new Image()
    img.src = src
    return img
}

const treeImg = new Image()
treeImg.src = "img/tree.png"

let trees = []

function generateTrees(){

    let maxTrees = 200
    let minDistance = 150

    while(trees.length < maxTrees){

        let newTree = {

            x:(Math.random()-0.5)*6000,
            y:(Math.random()-0.5)*6000,
            size:120

        }

        let tooClose = false

        for(let tree of trees){

            let dx = newTree.x - tree.x
            let dy = newTree.y - tree.y

            let dist = Math.sqrt(dx*dx + dy*dy)

            if(dist < minDistance){

                tooClose = true
                break

            }

        }

        if(!tooClose){
            trees.push(newTree)
        }

    }

}

function drawTrees(){

    for(let tree of trees){

        ctx.drawImage(
            treeImg,
            tree.x - tree.size/2,
            tree.y - tree.size/2,
            tree.size,
            tree.size
        )

    }

}

enemySprites.push(loadEnemy("img/tank.png"))
enemySprites.push(loadEnemy("img/boss.png"))
enemySprites.push(loadEnemy("img/fast.png"))
enemySprites.push(loadEnemy("img/normal.png"))

let gameStarted = false
let gamePaused = false
let gameOver = false

const player = {
    x: canvas.width/2,
    y: canvas.height/2,
    size: 40,
    speed: 3,
    hp: 100,
    maxHp: 100,
    direction: "down",
    frame: 0,
    frameTimer: 0,
    frameDelay: 8,
    moving: false,
}

const maxStats = {

    hp:200,
    speed:6,
    fireRate:15

}

const keys = {}

window.addEventListener("keydown",(e)=>{
    keys[e.key] = true

    if(e.key === " "){
        gameStarted = true
    }
    if(e.key === "p"){
        gamePaused = !gamePaused
    }
    if(e.key === "r"){
        gameOver = false

    player.hp = player.maxHp
    player.x = canvas.width/2
    player.y = canvas.height/2

    enemies = []
    bullets = []
    particles = []

    xp = 0
    level = 1
    timeAlive = 0

    gamePaused = false
}

})

window.addEventListener("keyup",(e)=>{
    keys[e.key] = false
})

function movePlayer(){

    let moving = false

    if(keys["w"]){
        player.y -= player.speed
        player.direction = "up"
        moving = true
    }

    if(keys["s"]){
        player.y += player.speed
        player.direction = "down"
        moving = true
    }

    if(keys["a"]){
        player.x -= player.speed
        player.direction = "left"
        moving = true
    }

    if(keys["d"]){
        player.x += player.speed
        player.direction = "right"
        moving = true
    }

    if(moving){

        player.frameTimer++

        if(player.frameTimer > 10){
            player.frame++
            player.frameTimer = 0

            if(player.frame >= sprites[player.direction].length){
                player.frame = 0
            }
        }

    }else{
        player.frame = 0
    }

}

function treeCollision(){

    for(let tree of trees){

        let dx = player.x - tree.x
        let dy = player.y - tree.y

        let dist = Math.sqrt(dx*dx + dy*dy)

        let minDist = (tree.size/3) + (player.size/3)

        if(dist < minDist){

            let angle = Math.atan2(dy,dx)

            player.x = tree.x + Math.cos(angle)*minDist
            player.y = tree.y + Math.sin(angle)*minDist

        }

    }

}

function drawPlayer(){

    let img = sprites[player.direction][player.frame]

    ctx.drawImage(
        img,
        player.x - player.size/2,
        player.y - player.size/2,
        player.size,
        player.size
    )

}

function drawMap(){

    let tileSize = 65

    let startX = Math.floor(camera.x / tileSize) * tileSize
    let startY = Math.floor(camera.y / tileSize) * tileSize

    for(let x = startX - tileSize; x < camera.x + canvas.width + tileSize; x += tileSize){

        for(let y = startY - tileSize; y < camera.y + canvas.height + tileSize; y += tileSize){

            ctx.drawImage(
                grass1,
                x,
                y,
                tileSize+1,
                tileSize+1
            )

        }

    }

}

let enemies = []

function updateEnemies(){

    for(let enemy of enemies){

        let dx = player.x - enemy.x
        let dy = player.y - enemy.y

        let dist = Math.sqrt(dx*dx + dy*dy)

        if(dist > 0){

            let angle = Math.atan2(dy,dx)
            enemy.x += Math.cos(angle) * enemy.speed
            enemy.y += Math.sin(angle) * enemy.speed
        }

    // animação do inimigo
    enemy.frameTimer++

        if(enemy.frameTimer > enemy.frameDelay){

            enemy.frame++
            enemy.frameTimer = 0

        if(enemy.frame >= 2){
            enemy.frame = 0
    }

}

    }

    // evitar empilhar
    for(let i=0;i<enemies.length;i++){

        for(let j=i+1;j<enemies.length;j++){

            let a = enemies[i]
            let b = enemies[j]

            let dx = a.x - b.x
            let dy = a.y - b.y

            let dist = Math.sqrt(dx*dx + dy*dy)

            let minDist = (a.size + b.size)/2

            if(dist < minDist){

                let angle = Math.atan2(dy,dx)
                let push = (minDist - dist)/2

                a.x += Math.cos(angle)*push
                a.y += Math.sin(angle)*push

                b.x -= Math.cos(angle)*push
                b.y -= Math.sin(angle)*push

            }

        }

    }

}

function drawEnemies(){

    for(let enemy of enemies){

        if(enemy.damageFlash > 0){

            ctx.fillStyle="red"

            ctx.fillRect(
                enemy.x-enemy.size/2,
                enemy.y-enemy.size/2,
                enemy.size,
                enemy.size
            )

            enemy.damageFlash--

        }else{

            ctx.drawImage(
                enemySprites[enemy.sprite],
                enemy.x - enemy.size/2,
                enemy.y - enemy.size/2,
                enemy.size,
                enemy.size
            )

        }

    }

}

function checkCollision(){
    


    for(let enemy of enemies){

        let dx = player.x - enemy.x
        let dy = player.y - enemy.y

        let dist = Math.sqrt(dx*dx + dy*dy)

        if(dist < player.size){

            player.hp -= 1
            shake = 15

        }

    }

}

let bullets = []

function shoot(){

    if(enemies.length === 0) return

    let closest = enemies[0]
    let dist = Infinity

    for(let enemy of enemies){

        let dx = enemy.x-player.x
        let dy = enemy.y-player.y

        let d = Math.sqrt(dx*dx + dy*dy)

        if(d < dist){

            dist = d
            closest = enemy

        }

    }

    let dx = closest.x-player.x
    let dy = closest.y-player.y

    let length = Math.sqrt(dx*dx+dy*dy)

    bullets.push({

        x:player.x,
        y:player.y,
        vx:dx/length*6,
        vy:dy/length*6,
        size:6

    })

}

function shootCircle(){

    for(let i=0;i<12;i++){

        let angle = (Math.PI*2/12)*i

        bullets.push({

            x:player.x,
            y:player.y,
            vx:Math.cos(angle)*5,
            vy:Math.sin(angle)*5,
            size:6

        })

    }

}

function updateBullets(){

    for(let b of bullets){

        b.x += b.vx
        b.y += b.vy

    }

}

function drawBullets(){

    ctx.fillStyle="yellow"

    for(let b of bullets){

        ctx.fillRect(b.x,b.y,b.size,b.size)

    }

}

let particles=[]

function createExplosion(x,y){

    for(let i=0;i<10;i++){

        particles.push({

            x:x,
            y:y,
            vx:(Math.random()-0.5)*4,
            vy:(Math.random()-0.5)*4,
            life:30

        })

    }

}

function updateParticles(){

    for(let p of particles){

        p.x += p.vx
        p.y += p.vy
        p.life--

    }

    particles = particles.filter(p=>p.life>0)

}

function drawParticles(){

    ctx.fillStyle="orange"

    for(let p of particles){

        ctx.fillRect(p.x,p.y,4,4)

    }

}

function drawApples(){

    for(let apple of apples){

        ctx.beginPath()
        ctx.arc(apple.x, apple.y, 18, 0, Math.PI*2)
        ctx.fillStyle = "rgba(255,0,0,0.2)"
        ctx.fill()

        ctx.drawImage(
            appleImg,
            apple.x - apple.size/2,
            apple.y - apple.size/2,
            apple.size,
            apple.size
        )

    }

}

function checkApplePickup(){

    for(let i = apples.length-1; i >= 0; i--){

        let apple = apples[i]

        let dx = player.x - apple.x
        let dy = player.y - apple.y

        let dist = Math.sqrt(dx*dx + dy*dy)

        if(dist < player.size){

            circleShotTimer = 300 // 5 segundos
            apples.splice(i,1)

        }

    }

}

function bulletEnemyCollision(){

    for(let i=bullets.length-1;i>=0;i--){

        for(let j=enemies.length-1;j>=0;j--){

            let b=bullets[i]
            let e=enemies[j]

            let dx=b.x-e.x
            let dy=b.y-e.y

            let d=Math.sqrt(dx*dx+dy*dy)

            if(d<e.size){

                e.hp--
                e.damageFlash = 5

                bullets.splice(i,1)

                if(e.hp<=0){

                    // chance de dropar maça
if(Math.random() < 0.12){
    spawnApple(e.x,e.y)
}

                    createExplosion(e.x,e.y)
                    enemies.splice(j,1)
                    xp+=10
                    shake = 10

                }

                break
            }

        }

    }

}

function drawMenu(){

    ctx.fillStyle="black"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    ctx.fillStyle="white"
    ctx.font="50px Arial"
    ctx.fillText("SURVIVAL GAME",220,200)

    ctx.font="25px Arial"
    ctx.fillText("Press SPACE to start",270,260)

    ctx.font="18px Arial"
    ctx.fillText("WASD to move",320,320)
    ctx.fillText("P to pause",330,350)

}

function drawUI(){

    ctx.fillStyle="white"
    ctx.font="20px Arial"

    ctx.fillText("XP: "+xp,20,30)
    ctx.fillText("Level: "+level,20,60)
    ctx.fillText("Time: "+Math.floor(timeAlive),20,90)

    ctx.fillStyle="red"
    ctx.fillRect(20,110,200,20)

    ctx.fillStyle="lime"
    ctx.fillRect(20,110,player.hp*2,20)

}

function checkLevelUp(){

    if(xp >= level*50){

        xp = 0
        level++

        openUpgradeMenu()   // ← ABRE MENU DE UPGRADE

    }

}

function checkGameOver(){

    if(player.hp <= 0){

        gameOver = true

        ctx.fillStyle="black"
        ctx.fillRect(200,150,400,200)

        ctx.fillStyle="white"
        ctx.font="40px Arial"
        ctx.fillText("GAME OVER",300,230)

        ctx.font="20px Arial"
        ctx.fillText("Press R to restart",300,270)

    }

}

function checkGamePaused(){

    ctx.fillStyle="rgba(0,0,0,0.7)"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    ctx.fillStyle="white"
    ctx.font="40px Arial"
    ctx.fillText("PAUSED",canvas.width/2-90,canvas.height/2)

    ctx.font="20px Arial"
    ctx.fillText("Press P to CONTINUE",canvas.width/2-90,canvas.height/2+40)

    ctx.font="20px Arial"
    ctx.fillText("Press R to RESTART",canvas.width/2-90,canvas.height/2+80)
}

const upgrades = [

{
name: "Mais Vida",
effect: () => {

    if(player.maxHp < maxStats.hp){

        player.maxHp += 20

        if(player.maxHp > maxStats.hp){
            player.maxHp = maxStats.hp
        }

        player.hp = player.maxHp
    }

}
},

{
name: "Tiro mais rápido",
effect: () => {

    if(shootDelay > maxStats.fireRate){

        shootDelay -= 5

        if(shootDelay < maxStats.fireRate){
            shootDelay = maxStats.fireRate
        }

    }

}
},

{
name: "Velocidade",
effect: () => {

    if(player.speed < maxStats.speed){
        player.speed += 0.5
    }

}
}

]

function openUpgradeMenu(){

    upgradeMenu = true
    upgradeOptions = []

    while(upgradeOptions.length < 3){

        let random = upgrades[Math.floor(Math.random()*upgrades.length)]

        if(!upgradeOptions.includes(random)){
            upgradeOptions.push(random)
        }

    }

}

function drawUpgradeMenu(){

    ctx.fillStyle = "black"
    ctx.fillRect(200,150,400,300)

    ctx.fillStyle = "white"
    ctx.font = "20px Arial"

    ctx.fillText("ESCOLHA UM UPGRADE",300,190)

    for(let i=0;i<upgradeOptions.length;i++){

        let upgrade = upgradeOptions[i]

        ctx.fillText(
            (i+1) + " - " + upgrade.name,
            300,
            230 + i*40
        )

    }

}

window.addEventListener("keydown",(e)=>{

    if(!upgradeMenu) return

    if(e.key === "1"){
        upgradeOptions[0].effect()
        upgradeMenu = false
    }

    if(e.key === "2"){
        upgradeOptions[1].effect()
        upgradeMenu = false
    }

    if(e.key === "3"){
        upgradeOptions[2].effect()
        upgradeMenu = false
    }

})

function spawnEnemy(type){

    let x
    let y
    let minDistance = 250

    let side = Math.floor(Math.random()*4)

let margin = 200

if(side === 0){ // esquerda
    x = player.x - canvas.width/2 - margin
    y = player.y + (Math.random()*canvas.height - canvas.height/2)
}

if(side === 1){ // direita
    x = player.x + canvas.width/2 + margin
    y = player.y + (Math.random()*canvas.height - canvas.height/2)
}

if(side === 2){ // cima
    x = player.x + (Math.random()*canvas.width - canvas.width/2)
    y = player.y - canvas.height/2 - margin
}

if(side === 3){ // baixo
    x = player.x + (Math.random()*canvas.width - canvas.width/2)
    y = player.y + canvas.height/2 + margin
}

    let data = enemyTypes[type]
    let difficultyScale = 1 + (timeAlive / 120)

    let enemy = {
    x:x,
    y:y,
    size:data.size,
    speed:data.speed * Math.min(difficultyScale,2),
    hp:Math.floor(data.hp * difficultyScale),
    sprite:data.sprite,
    damageFlash: 0,

    frame:0,
    frameTimer:0,
    frameDelay:12,

    flanker: Math.random() < 0.2
}

    enemies.push(enemy)

}

function spawnApple(x,y){

    let safe = true

    for(let tree of trees){

        let dx = x - tree.x
        let dy = y - tree.y

        let dist = Math.sqrt(dx*dx + dy*dy)

        if(dist < tree.size){

            safe = false
            break

        }

    }

    if(safe){
        apples.push({
            x:x,
            y:y,
            size:25
        })
    }

}

function applyCameraShake(){

    if(shake > 0){

        let dx = (Math.random() - 0.5) * shake
        let dy = (Math.random() - 0.5) * shake

        ctx.setTransform(1,0,0,1,dx,dy)

        shake *= 0.9

    }else{

        ctx.setTransform(1,0,0,1,0,0)

    }

}

function drawPlayerHP(){

    let barWidth = player.size
    let hpRatio = player.hp / player.maxHp

    let barX = player.x - player.size/2
    let barY = player.y - player.size/2 - 10

    ctx.fillStyle = "black"
    ctx.fillRect(barX, barY, barWidth, 5)

    ctx.fillStyle = "lime"
    ctx.fillRect(barX, barY, barWidth * hpRatio, 5)

}


let shootTimer=0
let spawnTimer=0
let xp=0
let level=1
let shootDelay=40
let timeAlive=0
let upgradeMenu = false
let upgradeOptions = []
let upgradeTimer = 0
let bossTimer = 0
let shake = 0
let frameX = 0
let frameTimer = 0

generateTrees()

function gameLoop(){

    ctx.clearRect(0,0,canvas.width,canvas.height)

    if(!gameStarted){
        drawMenu()
        requestAnimationFrame(gameLoop)
        return
    }

    movePlayer()
    treeCollision()

    if(gamePaused){
        checkGamePaused()
        requestAnimationFrame(gameLoop)
    return
}

    if(gameOver){
        checkGameOver()
        requestAnimationFrame(gameLoop)
    return
}

    if(upgradeMenu){
    drawUpgradeMenu()
    requestAnimationFrame(gameLoop)
    return
}

    // CAMERA SEGUE PLAYER
    let targetX = player.x - canvas.width / 2
    let targetY = player.y - canvas.height / 2

    camera.x += (targetX - camera.x) * camera.smooth
    camera.y += (targetY - camera.y) * camera.smooth

    ctx.save()

    // aplica camera
    ctx.translate(-camera.x, -camera.y)

    drawMap()
    drawTrees()

    updateEnemies()
    updateBullets()
    updateParticles()

    checkCollision()
    checkApplePickup()
    bulletEnemyCollision()
    checkLevelUp()
    checkGameOver()    

    // DESENHO DO MUNDO
    drawPlayer()
    drawEnemies()
    drawBullets()
    drawParticles()
    drawApples()
    drawPlayerHP()

    ctx.restore()

    // UI fora da camera
    drawUI()

    if(upgradeMenu){
    drawUpgradeMenu()
}

    shootTimer++

if(shootTimer >= shootDelay){

    if(circleShotTimer > 0){
        shootCircle()
        circleShotTimer--
    }
    else if(level >= 5){
        shootCircle()
    }
    else{
        shoot()
    }

    shootTimer = 0
}

// SPAWN ALEATORIO DE MAÇA
appleTimer++

if(appleTimer > 900){ // a cada 15 segundos

    spawnApple(
        player.x + (Math.random()*800 - 400),
        player.y + (Math.random()*600 - 300)
    )

    appleTimer = 0
}

    spawnTimer++
    let difficulty = 120 - Math.floor(timeAlive*2)

    if(difficulty < 40){
    difficulty = 40
    }

    if(spawnTimer > difficulty){

        let r = Math.random()

        let amount = 1

if(timeAlive > 30) amount = 2
if(timeAlive > 60) amount = 3
if(timeAlive > 120) amount = 5

for(let i=0;i<amount;i++){

    let r = Math.random()

    if(r < 0.6) spawnEnemy("normal")
    else if(r < 0.85) spawnEnemy("fast")
    else spawnEnemy("tank")

}

        spawnTimer = 0
    }

    timeAlive += 1/60

    bossTimer++

if(bossTimer > 1800){ // 30 segundos

    spawnEnemy("boss")

    bossTimer = 0

}

    requestAnimationFrame(gameLoop)
}

spawnEnemy("normal")
spawnEnemy("fast")
spawnEnemy("tank")

gameLoop()