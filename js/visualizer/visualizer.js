var that = null;

class AnalyserView {
    constructor(meterID) {
        this.colorSpectrum = []
        this.supportedColors = []
        this.barErrors = {}
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

        this.numberOfColors = this.maxHeight
        this.initColorSpectrum()
        this.setInitialChangeListeners()
        
        that = this
    }

    calculateCanvasSize() {
        var canvasHolder = document.getElementById('meterHolder');
        this.meter.setAttribute('width', canvasHolder.offsetWidth)
        this.meter.setAttribute('height', canvasHolder.offsetHeight)
    
        this.maxWidth = canvasHolder.offsetWidth
        this.maxHeight = canvasHolder.offsetHeight
        this.maxRectNum = this.maxHeight / (this.rectHeight + this.rectGap)
        this.barsNum = Number.parseInt(this.maxWidth / (this.barWidth + this.barGap))

        console.log(this.maxWidth, this.maxHeight, this.maxRectNum, this.barsNum)
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

        that.colorGradient = new Rainbow(that.supportedColors, 0, that.numberOfColors)
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

        this.colorGradient = new Rainbow(this.supportedColors, 0, this.numberOfColors)
        this.setColorSpectrum(this)
    }

    setColorSpectrum(target) {
        target.colorSpectrum = [];

        for(let i = 0; i < target.numberOfColors; i++) {
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
                inputs[i].onchange = this.changeColorSpectrum
            }
        }
    }

    previewSpectrum() {
        var x = 0
        var y = 0
        this.ctx.clearRect(0, 5, this.maxWidth, 10)
        for(let i = 0; i < this.colorSpectrum.length; i++) {
            this.ctx.fillStyle = this.colorSpectrum[i]
            this.ctx.fillRect(x, y, 3, 3)

            x = 3 * i

            if (x > this.maxWidth) {
                x = 0;
                y = 10;
            }
        }
    }

    createGradient(x, y, step) {
        y = this.maxHeight - y

        var startColor = this.colorSpectrum[y] || this.colorSpectrum[this.colorSpectrum.length - 1]
        var midColor = this.colorSpectrum[y + step] || this.colorSpectrum[this.colorSpectrum.length - 1]
        var endColor = this.colorSpectrum[y + this.rectHeight] || this.colorSpectrum[this.colorSpectrum.length - 1]

        var gradient = this.ctx.createLinearGradient(x, y, x + this.barWidth, y + this.rectHeight)
        gradient.addColorStop(0, startColor)
        gradient.addColorStop(0.5, midColor)
        gradient.addColorStop(1, endColor)

        return gradient
    }

    createErrors(db, maxErr, i) {
        if(db < maxErr) {
            if (this.barErrors[i]) {
                clearInterval(this.barErrors[i].interval)
            }
            this.barErrors[i] = null;
            return
        }

        var createOscilationTime = function() {
            return Math.random() * 200 + 300
        }

        var createError = function(currentValue) {
            var isNegative = Math.random() < 0.5

            if(currentValue) {
                return currentValue + isNegative ? -Math.floor(Math.random() * 3) : Math.floor(Math.random() * 3);
            }

            return Math.floor(Math.random() * (isNegative ? -maxErr : maxErr))
        }

        if(!this.barErrors[i]) {
            var err = createError()
            this.barErrors[i] = {
                err,
            }

            var intervalId = setInterval(function() {
                that.barErrors[i].err = createError(that.barErrors[i].err)
            }, createOscilationTime())

            this.barErrors[i].interval = intervalId
        }
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
            this.createErrors(db, Math.floor(Math.random() * 10), i)
            var x = (this.barGap + this.barWidth) * i
            var colRectNum = this.barErrors[i] ? rectNum + this.barErrors[i].err : rectNum

            for (let j = 0; j < colRectNum; j++) {
                var y = this.maxHeight - (this.rectGap + this.rectHeight) * (j + 3)
                this.ctx.fillStyle = this.createGradient(x, y, 5)
                this.ctx.fillRect(x, y, this.barWidth, this.rectHeight)
            }
        }


        if(!controlsHidden) {
            this.ctx.fillStyle = 'red'
            this.ctx.font = "12px Arial";
            this.ctx.fillText(`dB: ${db}`, 30, 60)

            this.ctx.fillText(`Canvas Sizes: ${this.maxWidth} - ${this.maxHeight}`, 300, 60)
        }
    }
}
