function extractSize(size, divider) {
    return Number.parseFloat(size.split('px')[0] / divider)
}

class AnalyserView {
    constructor(meterID) {
        this.meter = document.getElementById(meterID)
        this.freqByteData = new Uint8Array()
    
        if (!meterID) {
            throw new Error("Couldn't get meter view.")
        }

        this.calculateCanvasSize()
        this.rectGap = 20;
        this.gapNumber = 15;
        
        this.ctx = this.meter.getContext("2d")
        this.ctx.fillStyle = 'skyblue'
        this.ctx.fillRect(10, extractSize(this.meter.style.height, 3), 0, this.rectHeight);
    }

    calculateCanvasSize() {
        var w = `${window.innerWidth - 150}px`
        var h = `${window.innerHeight - 180}px`
        this.meter.style.setProperty('height', h)
        this.meter.style.setProperty('width', w)
    
        this.maxWidth = extractSize(this.meter.style.width, 1)
        this.maxHeight = extractSize(this.meter.style.height, 1)
        this.rectWidth = extractSize(this.meter.style.width, 11)
        this.rectHeight = extractSize(this.meter.style.height, 10)
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

    draw(db) {
        // 150dB is the loudness from which you'll go deaf if you're exposed to it for 5 minutes.
        var maxDb = 150
        var percent = (db / maxDb) * this.maxWidth
        this.ctx.clearRect(0, 0, this.maxWidth, this.maxHeight)
        this.ctx.fillStyle = 'skyblue'
        this.ctx.fillRect(10, extractSize(this.meter.style.height, 3), percent, this.rectHeight);

        var screenSegment = (this.maxWidth + this.rectGap * 2) / this.gapNumber
        var nextRect = screenSegment
        this.ctx.fillStyle = '#1a1a1a'
        this.ctx.fillRect(10, extractSize(this.meter.style.height, 3) - 15, this.rectGap, this.rectHeight + 20);

        for(let i = 0; i < this.gapNumber; i++) {
            this.ctx.fillRect(10 + nextRect, extractSize(this.meter.style.height, 3) - 15, this.rectGap, this.rectHeight + 20);
            nextRect += screenSegment
        }

        if(!controlsHidden) {
            this.ctx.fillStyle = 'red'
            this.ctx.font = "24px Arial";
            this.ctx.fillText(`dB: ${db}`, 30, 60)
        }
    }
}
