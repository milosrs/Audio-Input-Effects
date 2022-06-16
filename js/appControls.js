function addColorToSpecturm() {
    var spectrum = document.getElementById('spectrum');
    var colorInput = document.createElement('input')
    colorInput.type = 'color';
    colorInput.id = `color${spectrum.children.length + 1}`
    
    colorInput.onchange = analyserView.changeColorSpectrum

    spectrum.append(colorInput)
    analyserView.initColorSpectrum()
}

// Window event handlers
var controlsHidden = false;

window.addEventListener('resize', function() {
    analyserView.calculateCanvasSize()
})

window.addEventListener('keydown', function(e) {
    if(e.key === 'c') {
        controlsHidden = !controlsHidden;
        this.document.getElementsByClassName('controls')[0].style.visibility = `${controlsHidden ? 'hidden' : 'visible'}`
    }

    if(!controlsHidden) {
        analyserView.previewSpectrum()
    }
})
