var schemeKey = 'favoriteScheme'
var pickedColors = 'pickedColors'

function onPlay(e) {
    mustUseGesture = false
    document.getElementById("play").remove()
    document.getElementById("app").hidden = false

    var apphtml = new XMLHttpRequest()
    apphtml.open("GET", "app.html")
    apphtml.onreadystatechange = function(data) {
        if(!document.getElementById('meter')) {
            document.getElementsByTagName('body')[0].insertAdjacentHTML('beforeend', data.target.response)
        }

        if(apphtml.readyState === XMLHttpRequest.DONE) {
            setTimeout(function() {
                initAudio()
            }, 400)
        }
    }
    apphtml.send()
}

function addColorToSpecturm() {
    var spectrum = document.getElementById('spectrum');
    var colorInput = document.createElement('input')
    colorInput.type = 'color';
    colorInput.id = `color${spectrum.children.length + 1}`
    
    colorInput.onchange = analyserView.changeColorSpectrum

    spectrum.append(colorInput)
    analyserView.initColorSpectrum()
}

function saveColorScheme() {
    window.localStorage.setItem(schemeKey, JSON.stringify(analyserView.colorSpectrum))
    // window.localStorage.setItem(pickedColors, JSON.stringify(analyserView.))
    console.log("Scheme saved: ", JSON.parse(window.localStorage.getItem(schemeKey)))
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
