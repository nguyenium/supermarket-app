function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
} 
    

async function oneLine(ms, message) {
    await sleep(ms)
    console.log(message)
}

async function threeLines() {
    const random1 = Math.random()*3000
    const random2 = Math.random()*3000
    const random3 = Math.random()*3000
    
    await oneLine(random2, "two")
    oneLine(random1, "one")
    oneLine(random3, "three")
}

threeLines()