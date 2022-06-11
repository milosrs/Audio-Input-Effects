function calculateCanvasSize() {
    var canvas = document.getElementById("view1")
    var w = `${window.innerWidth}px`
    var h = `${window.innerHeight - 80}px`
    canvas.style.setProperty('height', h)
    canvas.style.setProperty('width', w)
}

calculateCanvasSize()

window.addEventListener('resize', function(ev) {
    calculateCanvasSize()
})
