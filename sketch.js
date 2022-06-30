/**

 @author kiwi
 @date 2022.06.26

 this is a typingclub.com clone which uses champion and item data from the
 riot API.

 0. start with the template project
 1. console log a list of hero names from champion.json
 2. console log some info from a specific champion

 3. obtain a list of abilities from any hero
 4. obtain a list of lists of hero abilities
 5. make a typerc passage work with a champion.json 'blurb'
 6. fetch a few champion images
 7. fetch ability images from the multidimensional array

 8. tinker with the items.json page
 9. display icon images

 draw diagram with rudimentary layout

 enable passage.js to handle multiple sections: 'nextSection()' 🦔 Cody suggests new object.

 filter tags out of abilities
 color or format specific xml tags


 important documentation :p https://developer.riotgames.com/docs/lol

 official league of legends champion page
    https://www.leagueoflegends.com/en-us/champions/ahri/
    ability 📹 riot API doesn't seem to serve this info
 https://d28xe8vt774jo5.cloudfront.net/champion-abilities/0103/ability_0103_P1.webm

 league fandom wiki
    https://leagueoflegends.fandom.com/wiki/Ahri/LoL
    ability 📹
        https://static.wikia.nocookie.net/leagueoflegends/images/c/cd/Ahri_IVideo.webm

 skin splash screens
    The number at the end of the filename corresponds to the skin number.
    https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Ahri_2.jpg
    https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Nunu_0.jpg
    ↑ note that _0 is always the default splash image

         "skins": [
         {
              "id": "20000",
              "num": 0,
              "name": "default",
              "chromas": false
         },
         {
              "id": "20001",
              "num": 1,
              "name": "Sasquatch Nunu & Willump",
              "chromas": false
            },
        ...
        ]

 sprite small profile squares
    https://ddragon.leagueoflegends.com/cdn/12.12.1/img/sprite/champion2.png

 champion icons
    https://ddragon.leagueoflegends.com/cdn/12.12.1/img/champion/Nunu.png

 passive icons
    https://ddragon.leagueoflegends.com/cdn/12.12.1/img/passive/Ahri_SoulEater2.png

 ability icons
     https://ddragon.leagueoflegends.com/cdn/12.12.1/img/spell/AhriSeduce.png
*/

let font
let instructions

let passage
let correctSound /* audio cue for typing one char correctly */
let incorrectSound /* audio cue for typing one char incorrectly */

let initialChampionQueryJSON /* json file from scryfall: set=snc */
let championData /* the 'data' field of a JSON query from api.scryfall */

const baseURI = "https://ddragon.leagueoflegends.com/"
const imgURI = baseURI + "cdn/12.12.1/img/champion/"
const splashURI = baseURI + "cdn/img/champion/splash/"

let championImg
let championIndex
let heroes /* packed up JSON data */

const FONT_SIZE = 32

let dc
let milk /* used for champion portrait glow */
let lastRequestTime = 0

let debugCorner /* output debug text in the bottom left corner of the canvas */

function preload() {
    font = loadFont('data/consola.ttf')
    font = loadFont('data/lucida-console.ttf')

    let req = 'https://ddragon.leagueoflegends.com/cdn/12.12.1/data/en_US/' +
        'champion.json'
    initialChampionQueryJSON = loadJSON(req)
}


function setup() {
    let cnv = createCanvas(1280, 640)
    cnv.parent('#canvas')
    colorMode(HSB, 360, 100, 100, 100)

    debugCorner = new CanvasDebugCorner(5)
    milk = color(207, 7, 99)
    dc = drawingContext

    /* initialize instruction div */
    instructions = select('#ins')
    instructions.html(`<pre>
        numpad 1 → freeze sketch</pre>`)

    correctSound = loadSound('data/correct.wav')
    incorrectSound = loadSound('data/incorrect.wav')

    championData = initialChampionQueryJSON['data']
    passage = new Passage("this is a test sentence.\n ")

    processHeroData()
}


function processHeroData() {
    /** build hero data object: name, blurb  */
    for (const index in championData) {
        console.log(`${championData[index]['name']}`)
    }

    console.log(initialChampionQueryJSON)
    console.log(`championData.length → ${championData.length}`) /* ❓ undef */

    const championCount = Object.keys(championData).length
    console.log(`championData.keys len → ${championCount}`)
    console.log(`championData.keys → ${Object.keys(championData)}`)

    /* test randomized hero indices */
    const randomHeroIndex = int(random(0, championCount))
    // console.log(randomHeroIndex)
    const champion = championData[randomHeroIndex]
    // console.log(`${champion['name']}, ${champion['title']}`)
    // console.log(`championData[randomHeroIndex] → ${champion}`)

    const randomChampion = Object.keys(championData)[randomHeroIndex]
    console.log(randomChampion)
    console.log(`Object.keys(championData)[randomHeroIndex] → ${randomChampion}`)

    /** load a champion and display their blurb */
    const c = championData[randomChampion]
    const passageText = `${c['name']} ${c['title']}\n${c['blurb']}`
    passage = new Passage(passageText + '\n ')

    /** grab image using loadImage → global currentChampionImg
     *  in draw: render it if (currentChampionImg) ← seems unnecessary */
    const splash = splashURI + c['name'] + '_0.jpg'

    championImg = loadImage(splash)

    /** once we select a champion name, we can query for the champion's
     *  individual json! we can then grab the value of the 'lore' key from
     *  that page
     */
    /* load a champion and display their abilities */
}


/** create the data structure for storing hero abilities */
function gotHeroData(data) {

}


function resetDcShadow() {
    dc.shadowBlur = 0
    dc.shadowOffsetY = 0
    dc.shadowOffsetX = 0
}


function draw() {
    background(passage.cBackground)

    passage.render()
    // passage.displayRowMarkers(5)

    const IMG_WIDTH = 340
    championImg.resize(IMG_WIDTH, 0)
    tint(0, 0, 100)

    dc.shadowBlur = 24
    dc.shadowColor = milk

    const hPadding = passage.LEFT_MARGIN/2
    const vPadding = passage.TOP_MARGIN
    let jitter = 0 /*sin(frameCount / 30) * 15*/

    image(championImg, width-IMG_WIDTH-hPadding+jitter, vPadding/2 + 20)
    resetDcShadow()

    /* debugCorner needs to be last so its z-index is highest */
    // debugCorner.setText(`frameCount: ${frameCount}`, 4)
    // debugCorner.setText(`set id: ${currentCardIndex} of ${cards.length}`, 3)
    // debugCorner.show()
}


function sortCardsByID(a, b) {
    if (a.collector_number === b.collector_number) {
        return 0;
    } else {
        return (a.collector_number < b.collector_number) ? -1 : 1;
    }
}


function getChampionData() {
    let results = []

    for (let key of championListData) {

    }
}


/** (name, id, art_crop uri, png uri, typeText with \n) */
function getCardData() {
    let results = []

    /* regex for detecting creatures and common/uncommon rarity */
    const creature = new RegExp('[Cc]reature|Vehicle')
    const rarity = new RegExp('(common|uncommon|rare|mythic)')
    // const rarity = new RegExp('(rare|mythic)')
    let count = 0
    let typeText = ''

    for (let key of championData) {
        let imgURIs /* this handles double faced cards */
        if (key['image_uris']) {
            imgURIs = key['image_uris']
        } else {
            imgURIs = key['card_faces'][0]
        }

        /* if mana value is 0, skip displaying the space */
        let manaCost = key['mana_cost']
        if (manaCost !== '')
            manaCost = ' ' + manaCost

        typeText = `${key.name}${manaCost}\n${key['type_line']}\n${key['oracle_text']}\n`

        /* sometimes p/t don't exist. check type */
        if (creature.test(key['type_line']))
            typeText += `${key['power']}/${key['toughness']}\n`
            /* we need whitespace at end for passage end detection to work */

        if (key['flavor_text'])
            typeText += `\n${key['flavor_text']}\n`
        else typeText += '\n'

        typeText += ' ' /* extra space makes user able to hit 'enter' at end*/

        /* only display commons and uncommons in our color filter */
        if (rarity.test(key['rarity'])) {
            results.push({
                'typeText': typeText,
                'name': key.name,
                'collector_number': int(key['collector_number']),
                'art_crop_uri': imgURIs['art_crop'], /*626x457 ½ MB*/
                'normal_uri': imgURIs['normal'],
                'large_uri': imgURIs['large'],
                'png_uri': imgURIs['png'] /* 745x1040 */

                /* normal 488x680 64KB, large 672x936 100KB png 745x1040 1MB*/
            })
            count++

            // if (key.colors.some(e => e === 'W')) {
            //     results.push(typeText)
            //     count++
            // }
        }
    }

     // let unused = `${key['image_uris']['art_crop']}`
    return results
}


function keyPressed() {
    // don't do anything if we detect SHIFT ALT CONTROL keycodes
    if (keyCode === SHIFT ||
        keyCode === ALT ||
        keyCode === CONTROL ||
        keyCode === 20) { // this is capslock
        return
    }

    /* stop sketch on numpad1 */
    if (keyCode === 97) { /* numpad 1 */
        noLoop()
        instructions.html(`<pre>
            sketch stopped</pre>`)
    } else if (keyCode === 100) { /* numpad 4 */
        championIndex--
        updateCard()
    } else if (keyCode === 102) { /* numpad 6 */
        championIndex++
        updateCard()
    } else if (keyCode === 104) { /* numpad 8 */
        championIndex += 10
        updateCard()
    } else if (keyCode === 98) { /* numpad 2 */
        championIndex -= 10
        updateCard()
    } else if (keyCode === 101) { /* numpad 5 */
        championIndex = int(random(0, heroes.length))
        console.log(championIndex)
        updateCard()
    } else {
        /* temporary hack for handling enter key */
        if (keyCode === ENTER) {
            processTypedKey('\n')
            return
        }

        /* handle emdash by allowing dash to replace it */
        if (key === '-') {
            processTypedKey('—')
            return
        }

        if (key === '*') {
            processTypedKey('•')
            return
        }

        processTypedKey(key)
    }
}


/** selects a new card based on the currentCardIndex; displays its image and
 associated typing passage */
function updateCard() {
    championIndex = constrain(championIndex, 0, heroes.length-1)
    passage = new Passage(heroes[championIndex].typeText)
    championImg = loadImage(heroes[championIndex].png_uri)
    console.log(heroes[championIndex].typeText)
}


/**
 * process a keypress!
 *
 * if the key user just pressed === passage.getCurrentChar:
 *  → play correct sound, rewind it, passage.setCorrect()
 *  → otherwise, play and rewind the incorrect sound → passage.setIncorrect()
 * @param k
 */
function processTypedKey(k) {
    if (passage.finished()) {
        championIndex = int(random(0, heroes.length))
        console.log(championIndex)
        // updateCard()
    }
    else if (passage.getCurrentChar() === k) {
        passage.setCorrect()
        correctSound.play()
    } else {
        passage.setIncorrect()
        incorrectSound.play()
    }
}


/** 🧹 shows debugging info using text() 🧹 */
class CanvasDebugCorner {
    constructor(lines) {
        this.size = lines
        this.debugMsgList = [] /* initialize all elements to empty string */
        for (let i in lines)
            this.debugMsgList[i] = ''
    }

    setText(text, index) {
        if (index >= this.size) {
            this.debugMsgList[0] = `${index} ← index>${this.size} not supported`
        } else this.debugMsgList[index] = text
    }

    show() {
        textFont(font, 14)
        strokeWeight(1)

        const LEFT_MARGIN = 10
        const DEBUG_Y_OFFSET = height - 10 /* floor of debug corner */
        const LINE_SPACING = 2
        const LINE_HEIGHT = textAscent() + textDescent() + LINE_SPACING
        fill(0, 0, 100, 100) /* white */
        strokeWeight(0)

        for (let index in this.debugMsgList) {
            const msg = this.debugMsgList[index]
            text(msg, LEFT_MARGIN, DEBUG_Y_OFFSET - LINE_HEIGHT * index)
        }
    }
}