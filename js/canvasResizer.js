function calculateCanvasSize() {
    var canvas = document.getElementById("view1")
    var w = `${window.innerWidth - 50}px`
    var h = `${window.innerHeight - 100}px`
    canvas.style.setProperty('height', h)
    canvas.style.setProperty('width', w)
}

calculateCanvasSize()

window.addEventListener('resize', function(ev) {
    calculateCanvasSize()
})

