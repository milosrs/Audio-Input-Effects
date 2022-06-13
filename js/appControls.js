function addColorToSpecturm() {
    var spectrum = document.getElementById('spectrum');
    var colorInput = document.createElement('input')
    colorInput.type = 'color';
    colorInput.id = `color${colorInput.children.length}`
    
    colorInput.onchange = function(e) {
        analyserView.changeColorSpectrum(colorInput.id, e.target.value)
    }

    spectrum.append(colorInput)
}

// Window event handlers
var controlsHidden = false;

window.addEventListener('resize', function() {
    analyserView.calculateCanvasSize()
})

window.addEventListener('keydown', function(e) {
    if(e.key === 'h') {
        controlsHidden = !controlsHidden;
        this.document.getElementsByClassName('controls')[0].style.visibility = `${controlsHidden ? 'hidden' : 'visible'}`
        console.log(this.document.getElementsByClassName('controls'))
    }
})
