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
                loadColors()
                initAudio()
            }, 400)
        }
    }
    apphtml.send()
}

function loadColors() {
    var savedScheme = JSON.parse(window.localStorage.getItem(schemeKey))

    if(savedScheme) {
        for(let i = 0; i < savedScheme.length; i++) {
            var colorEl = document.getElementById(`color${i + 1}`)
            if(colorEl) {
                colorEl.setAttribute('value', savedScheme[i])
                colorEl.value = savedScheme[i]
            } else {
                addColorToSpecturm(savedScheme[i])
            }
        }
    }
}

function addColorToSpecturm(color) {
    var spectrum = document.getElementById('spectrum');
    var colorInput = document.createElement('input')
    colorInput.type = 'color';
    colorInput.id = `color${spectrum.children.length + 1}`

    if(color) {
        colorInput.setAttribute('value', color)
        colorInput.value = color
    }

    if(analyserView) {
        analyserView.initColorSpectrum()
        colorInput.onchange = analyserView.changeColorSpectrum
    }

    spectrum.append(colorInput)
}

function saveColorScheme() {
    var spectrum = document.getElementById('spectrum');
    var colors = []

    console.log(spectrum.children)
    for(let i = 0; i < spectrum.childElementCount; i++) {
        colors.push(spectrum.children[i].value)
    }

    window.localStorage.setItem(schemeKey, JSON.stringify(colors))
    console.log("Scheme saved: ", JSON.parse(window.localStorage.getItem(schemeKey)))
}

function resetScheme() {
    var els = [
        "#ff0000",
        "#008000",
        "#0000ff"
    ]

    window.localStorage.removeItem(schemeKey)
    var spectrum = document.getElementById('spectrum');
    for(let i = 0; i < spectrum.childElementCount; i++) {
        spectrum.removeChild(spectrum.firstElementChild)
    }

    spectrum.removeChild(spectrum.lastElementChild)

    location.reload();
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
