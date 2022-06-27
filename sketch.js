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
 7. fetch ability images from the multi-dimensional array

 8. tinker with the items.json page
 9. display icon images

 draw diagram with rudimentary layout

 enable passage.js to handle multiple sections: 'nextSection()' 🦔 Cody suggests new object.

 filter tags out of abilities
 color or format specific xml tags

*/

let font
let instructions

let passage
let correctSound /* audio cue for typing one char correctly */
let incorrectSound /* audio cue for typing one char incorrectly */

let initialChampionQueryJSON /* json file from scryfall: set=snc */
let championData /* the 'data' field of a JSON query from api.scryfall */
let cardImg
let currentHeroIndex
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
    console.log(championData)
    passage = new Passage("this is a test sentence.\n ")

    processHeroData()
}


function processHeroData() {
    for (const index in championData) {
        console.log(`${championData[index]['name']}`)
    }

    console.log(championData)
    console.log(`champion data → ${championData}`)
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
    // cardImg.resize(IMG_WIDTH, 0)
    tint(0, 0, 100)

    dc.shadowBlur = 24
    dc.shadowColor = milk

    const hPadding = passage.LEFT_MARGIN/2
    const vPadding = passage.TOP_MARGIN
    let jitter = 0 /*sin(frameCount / 30) * 15*/

    /* 626x457 */
    // image(cardImg, width-IMG_WIDTH-hPadding+jitter, vPadding/2 + 20)
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
        currentHeroIndex--
        updateCard()
    } else if (keyCode === 102) { /* numpad 6 */
        currentHeroIndex++
        updateCard()
    } else if (keyCode === 104) { /* numpad 8 */
        currentHeroIndex += 10
        updateCard()
    } else if (keyCode === 98) { /* numpad 2 */
        currentHeroIndex -= 10
        updateCard()
    } else if (keyCode === 101) { /* numpad 5 */
        currentHeroIndex = int(random(0, heroes.length))
        console.log(currentHeroIndex)
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
    currentHeroIndex = constrain(currentHeroIndex, 0, heroes.length-1)
    passage = new Passage(heroes[currentHeroIndex].typeText)
    cardImg = loadImage(heroes[currentHeroIndex].png_uri)
    console.log(heroes[currentHeroIndex].typeText)
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
        currentHeroIndex = int(random(0, heroes.length))
        console.log(currentHeroIndex)
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