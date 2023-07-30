const saveButton = document.getElementById("save")
const orderButton = document.getElementById("order")
const con2 = document.getElementById("con2")
const Splits = document.getElementById("Splits")
const blockArray = []

class Line {
    x
    length
    constructor(x, length){
        this.x = x 
        this.length = length
    }    
}
class Space {
    static maxLength = 1000 //px
    freeSpaces = []
    _con2
    constructor(con2){
        this.freeSpaces.push(new Line(0, Space.maxLength))
        this._con2 = con2 
    }
    addSplit(len){
        if (this.freeSpaces.length === 0 )  throw new Error(`Not enought free space`)    
        const freeSpace = this.freeSpaces.reduce((sum, line) => { return sum + line.length}, 0)       
        if(freeSpace < len) throw new Error(`Not enought free space for length = ${len}`)
        const cordsForSplit = []
        this._getFitCoord(cordsForSplit, len)
        if(cordsForSplit.length === 0) {  
            this._getLargerCoord(cordsForSplit, len)
            if(cordsForSplit.length === 0) {
                this._getAllOtherFreeCoord(cordsForSplit, len)
            }
        }
        this._removeUsedSpace()       
        return cordsForSplit
    }
    _getFitCoord(cordsForSplit, len){
        if(!this._con2.checked) return    
        this.freeSpaces.every((freeLine)=>{
            if(freeLine.length === len){
                cordsForSplit.push({x: freeLine.x, length: freeLine.length})
                freeLine.length -= len
                return false
            }           
            return true
        })       
    }
    _getLargerCoord(cordsForSplit, len){
        if(!this._con2.checked) return    
        this.freeSpaces.every((freeLine)=>{           
            if(freeLine.length > len) {
                cordsForSplit.push({x: freeLine.x, length: len})
                freeLine.length -= len
                freeLine.x += len
                return false
            }
            return true
        })
    }
    _getAllOtherFreeCoord(cordsForSplit, len){
        this.freeSpaces.every((freeLine) => {            
            if(freeLine.length >= len){
                cordsForSplit.push({x: freeLine.x, length: len})
                freeLine.length -= len
                freeLine.x += len
                return false
            }else{// <
                cordsForSplit.push({x: freeLine.x, length: freeLine.length})
                len -= freeLine.length 
                freeLine.length = 0
                return true
            }            
        })
    }
    _removeUsedSpace(){
        const newFreeSpaces = []
        this.freeSpaces.forEach((line)=>{
            if(line.length !== 0){
                newFreeSpaces.push(line)
            }
        })        
        this.freeSpaces = newFreeSpaces        
    }
    removeSplit(x, len){
        this.freeSpaces.push(new Line(x, len))        
        this.freeSpaces.sort((lineA, lineB) => {
            return lineA.x - lineB.x
        })
        this._mergeFreeSpace()
    }
    _mergeFreeSpace(){      
        const reducedLinse = []
        this.freeSpaces.forEach((curLine)=> {
            let lastLine = reducedLinse[reducedLinse.length-1]
                  
            if(lastLine?.x + lastLine?.length === curLine.x){
                lastLine.length += curLine.length
            }else{
                reducedLinse.push(curLine)
            }
        })
        this.freeSpaces = reducedLinse       
    }
    orderFreeSpace(){
        const freeSpace = this.freeSpaces.reduce((sum, line) => { return sum + line.length}, 0)
        this.freeSpaces = [new Line(Space.maxLength-freeSpace,freeSpace)]
    }

}
const freeSpace = new Space(con2)

saveButton.onclick = (e) => {  
    const length = getLength()
    if(length < 0 ) return 
    const newSplit = createSplit(length)
    Splits.appendChild(newSplit)    
}
const getLength = () => {
    const blockLengthInput = document.getElementById("blockLength")
    const length = blockLengthInput.value
    blockLengthInput.value = ''
    const numLength = Number(length)
    if(isNaN(numLength) || (numLength === 0)) return -1
    return numLength

}
const createSplit = (length) => {
    const newBlock = document.createElement('div')

    const coords = freeSpace.addSplit(length*10)    
    coords.forEach((coord)=>{
        const newChild = document.createElement('div')
        newChild.style.width = `${coord.length}px`
        newChild.style.left = coord.x +'px'
        newChild.style.backgroundColor = 'white'
        newChild.innerText = coord.length/10
        newBlock.splitLength = length*10
        newBlock.appendChild(newChild) 
    })
   
    blockArray.push(newBlock)
    newBlock.onclick = ()=>{
        blockArray.forEach((block)=> {
            block.childNodes.forEach((child)=>
            child.style.backgroundColor = 'white' 
            )})
        newBlock.childNodes.forEach((child)=> child.style.backgroundColor = 'pink')
    }
    newBlock.ondblclick = () =>{
        const index = blockArray.indexOf(newBlock);
        if (index > -1) {
            blockArray.splice(index, 1);
            console.log(newBlock.childNodes)
            newBlock.childNodes.forEach((child)=>{               
                freeSpace.removeSplit(pxToNum(child.style.left), pxToNum(child.style.width))
            }            
            )
            newBlock.remove()
        }         
    }
    return newBlock
}
const pxToNum = (val) => {
    return Number(val.slice(0, -2))
}
//Упорядочивание
orderButton.onclick = () => {
    console.log('ordered')
    let xOffset = 0
    blockArray.sort((a, b) => a.splitLength - b.splitLength)
    blockArray.forEach((block) => {        
        removeAllChildNodes(block)
        const newChild = document.createElement('div')
        newChild.style.left = xOffset + 'px'
        newChild.style.width = block.splitLength + 'px'
        newChild.innerText = block.splitLength/10
        newChild.style.backgroundColor = 'white'
        block.appendChild(newChild) 
        xOffset += block.splitLength
    })
    freeSpace.orderFreeSpace()      
}
function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}