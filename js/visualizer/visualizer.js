function extractSize(size, divider) {
    return Number.parseFloat(size.split('px')[0] / divider)
}

var that = null;

class AnalyserView {
    constructor(meterID) {
        this.colorSpectrum = []
        this.supportedColors = []
        this.meter = document.getElementById(meterID)
        this.freqByteData = new Uint8Array()
    
        if (!meterID) {
            throw new Error("Couldn't get meter view.")
        }

        this.barGap = 10;
        this.barWidth = 40;
        this.rectGap = 5;
        this.rectHeight = 10;
        // 110dB is the loudness from which you'll go deaf if you're exposed to it for 30 minutes. Measured at Seahawks football game.
        this.maxDb = 110
        this.ctx = this.meter.getContext("2d")

        this.calculateCanvasSize()
        this.initColorSpectrum()
        this.setInitialChangeListeners()
        
        that = this
    }

    calculateCanvasSize() {
        var w = `${window.innerWidth - 50}px`
        var h = `${window.innerHeight - 180}px`
        this.meter.style.setProperty('height', h)
        this.meter.style.setProperty('width', w)
    
        this.maxWidth = extractSize(this.meter.style.width, 1)
        this.maxHeight = extractSize(this.meter.style.height, 1)
        this.maxRectNum = this.maxHeight / (this.rectHeight + this.rectGap)
        this.barsNum = Number.parseInt(this.maxWidth / (this.barWidth + this.barGap))
    }

    doFrequencyAnalysis(analyser) {
        this.freqByteData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(this.freqByteData);

        var freqSum = this.freqByteData.reduce(function (prev, current) {
            return prev += Math.pow(current, 2)
        }, 0)
        var rms = Math.sqrt(freqSum / analyser.frequencyBinCount)
        this.draw(rms);
    }

    changeColorSpectrum(e) {
        var index = Number.parseInt(e.target.id.split('color')[1]) - 1
        if(index > that.colorSpectrum.length - 1) {
            that.supportedColors.push(e.target.value)
        } else {
            that.supportedColors[index] = e.target.value
        }

        that.colorGradient = new Rainbow(that.supportedColors, 0, that.maxHeight)
        that.setColorSpectrum(that)
    }

    initColorSpectrum() {
        var spectrumElements = document.getElementById('spectrum');
        var inputs = spectrumElements.children

        for(let i = 0; i < inputs.length; i++) {
            if(inputs[i].getAttribute('type') === 'color') {
                this.supportedColors.push(inputs[i].value)
            }
        }

        this.colorGradient = new Rainbow(this.supportedColors, 0, this.maxHeight)
        this.setColorSpectrum(this)
    }

    setColorSpectrum(target) {
        target.colorSpectrum = [];

        for(let i = 0; i < target.maxHeight; i++) {
            var color = `#${target.colorGradient.colourAt(i)}`
            if(target.colorSpectrum.indexOf(color) == -1 && color != undefined) {
                target.colorSpectrum.push(color)
            }
        }

        if(!controlsHidden) {
            target.previewSpectrum()
        }
    }

    setInitialChangeListeners() {
        var spectrumElements = document.getElementById('spectrum');
        var inputs = spectrumElements.children

        for(let i = 0; i < inputs.length; i++) {
            if(inputs[i].getAttribute('type') === 'color') {
                console.log(inputs[i])
                inputs[i].onchange = this.changeColorSpectrum
            }
        }
    }

    previewSpectrum() {
        this.ctx.clearRect(0, 5, this.maxWidth, 10)
        for(let i = 0; i < this.colorSpectrum.length; i++) {
            this.ctx.fillStyle = this.colorSpectrum[i]
            this.ctx.fillRect(3*i, 0, 3, 3)
        }
    }

    createGradient(x, y, step) {
        y = this.maxHeight - y

        var startColor = this.colorSpectrum[y]
        var midColor = this.colorSpectrum[y + step]
        var endColor = this.colorSpectrum[y + this.rectHeight]

        var gradient = this.ctx.createLinearGradient(x, y, x + this.barWidth, y + this.rectHeight)
        gradient.addColorStop(0, startColor)
        gradient.addColorStop(0.5, midColor)
        gradient.addColorStop(1, endColor)

        return gradient
    }
    
    draw(db) {
        if(!controlsHidden) {
            this.ctx.clearRect(0, 20, this.maxWidth, this.maxHeight)
        } else {
            this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight)
        }
        var rectPercent = db / 120
        var rectNum = Number.parseInt(this.maxRectNum * rectPercent)
        for(let i = 0; i < this.barsNum; i++) {
            var x = (this.barGap + this.barWidth) * i

            for (let j = 0; j < rectNum; j++) {
                var y = this.maxHeight - (this.rectGap + this.rectHeight) * (j + 3)
                this.ctx.fillStyle = this.createGradient(x, y, 5)
                this.ctx.fillRect(x, y, this.barWidth, this.rectHeight)
            }
        }

        if(!controlsHidden) {
            this.ctx.fillStyle = 'red'
            this.ctx.font = "12px Arial";
            this.ctx.fillText(`dB: ${db}`, 30, 60)
        }
    }
}
