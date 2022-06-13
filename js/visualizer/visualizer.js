function extractSize(size, divider) {
    return Number.parseFloat(size.split('px')[0] / divider)
}

class AnalyserView {
    constructor(meterID) {
        this.colorSpectrum = []
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
        this.calculateCanvasSize()
        
        this.ctx = this.meter.getContext("2d")
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

    initColorSpectrum() {
        var spectrumElements = document.getElementById('spectrum');
        var inputs = spectrumElements.childNodes

        for(let i = 0; i < inputs.length; i++) {
            this.colorSpectrum.push(inputs[i].value)
        }

        console.log(this.colorSpectrum)
    }

    changeColorSpectrum(colorPickerId, value) {
        var index = Number.parseInt(colorPickerId.split('color')[0]) - 1

        if(index > this.colorSpectrum.length - 1) {
            this.colorSpectrum.push(value)
        } else {
            this.colorSpectrum[index] = value
        }

        console.log(this.colorSpectrum)
    }

    draw(db) {
        this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight)
        this.ctx.fillStyle = 'skyblue'
        var rectPercent = db / 120
        var rectNum = Number.parseInt(this.maxRectNum * rectPercent)
        for(let i = 0; i < this.barsNum; i++) {
            var x = (this.barGap + this.barWidth) * i

            for (let j = 0; j < rectNum; j++) {
                var y = this.maxHeight - (this.rectGap + this.rectHeight) * (j + 3)    
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
