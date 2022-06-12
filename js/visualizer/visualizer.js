class AnalyserView {
    constructor(meterID) {
        this.meter = document.getElementById(meterID)
        this.freqByteData = new Uint8Array()
    
        if (!meterID) {
            throw new Error("Couldn't get meter view.")
        }
    }
}
AnalyserView.prototype.doFrequencyAnalysis = function( analyser ) {
    analyser.smoothingTimeConstant = 0.1;
    analyser.getByteFrequencyData(this.freqByteData);
    var maxValue = 0
    for (let i = 0; i < this.freqByteData.length; i++) {
        if (this.freqByteData[i] > maxValue) {
            maxValue = this.freqByteData[i]
        }
    }
    var percent = maxValue / 255
    var referentValue = analyser.minDecibels + ((analyser.maxDecibels - analyser.minDecibels) * percent);
    var dB = 20 * Math.log(Math.abs(maxValue / Math.abs(referentValue)));

    console.log(this.freqByteData)
    
    this.draw();
}


AnalyserView.prototype.draw = function() {
    
}
