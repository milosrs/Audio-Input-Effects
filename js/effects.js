window.AudioContext = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContext();
var audioInput = null,
    realAudioInput = null,
    effectInput = null,
    wetGain = null,
    dryGain = null,
    currentEffectNode = null,
    reverbBuffer = null,
    dtime = null,
    dregen = null,
    lfo = null,
    scldelay = null,
    scrdelay = null,
    scldepth = null,
    scrdepth = null,
    fldelay = null,
    flspeed = null,
    fldepth = null,
    flfb = null,
    sflldelay = null,
    sflrdelay = null,
    sflspeed = null,
    sflldepth = null,
    sflrdepth = null,
    sfllfb = null,
    sflrfb = null,
    rmod = null,
    mddelay = null,
    mddepth = null,
    mdspeed = null,
    lplfo = null,
    lplfodepth = null,
    lplfofilter = null,
    awFollower = null,
    awDepth = null,
    awFilter = null,
    ngFollower = null,
    ngGate = null,
    bitCrusher = null,
    btcrBits = 16,   // between 1 and 16
    btcrNormFreq = 1; // between 0.0 and 1.0

var rafID = null;
var analyser;
var analyserView1;

function convertToMono( input ) {
    var splitter = audioContext.createChannelSplitter(2);
    var merger = audioContext.createChannelMerger(2);

    input.connect( splitter );
    splitter.connect( merger, 0, 0 );
    splitter.connect( merger, 0, 1 );
    return merger;
}

window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;

function cancelAnalyserUpdates() {
    if (rafID)
        window.cancelAnimationFrame( rafID );
    rafID = null;
}

function updateAnalysers(time) {
    analyserView1.doFrequencyAnalysis( analyser );

    rafID = window.requestAnimationFrame( updateAnalysers );
}

var lpInputFilter=null;

// this is ONLY because we have massive feedback without filtering out
// the top end in live speaker scenarios.
function createLPInputFilter() {
    lpInputFilter = audioContext.createBiquadFilter();
    lpInputFilter.frequency.value = 2048;
    return lpInputFilter;
}


function toggleMono() {
    if (audioInput != realAudioInput) {
        audioInput.disconnect();
        realAudioInput.disconnect();
        audioInput = realAudioInput;
    } else {
        realAudioInput.disconnect();
        audioInput = convertToMono( realAudioInput );
    }

    createLPInputFilter();
    lpInputFilter.connect(dryGain);
    lpInputFilter.connect(analyser);
    lpInputFilter.connect(effectInput);
}

var useFeedbackReduction = true;

function gotStream(stream) {
    var input = audioContext.createMediaStreamSource(stream);
    audioInput = convertToMono( input );

    if (useFeedbackReduction) {
        audioInput.connect( createLPInputFilter() );
        audioInput = lpInputFilter;
    }

    dryGain = audioContext.createGain();
    wetGain = audioContext.createGain();
    effectInput = audioContext.createGain();
    audioInput.connect(dryGain);
    audioInput.connect(analyser);
    audioInput.connect(effectInput);
    crossfade(1.0);
    cancelAnalyserUpdates();
    updateAnalysers();
}

function changeInput(){
  if (!!window.stream) {
    window.stream.stop();
  }
  var audioSelect = document.getElementById("audioinput");
  var audioSource = audioSelect.value;
  var constraints = {
    audio: {
        echoCancellation: true,
        noiseSuppression: true,
        deviceId: audioSource,
    }
  }

  navigator.mediaDevices.getUserMedia(constraints)
  .then(gotStream)
  .catch(function(e) {
        alert('Error getting audio');
        console.log(e);
    });
}

function gotSources(deviceInfos) {
    var defaultInput = ''
    var audioSelect = document.getElementById("audioinput");
    for (var i = 0; i != deviceInfos.length; ++i) {
        var sourceInfo = deviceInfos[i];
        if (sourceInfo.kind === 'audioinput') {
            var option = document.createElement("option");
            option.value = sourceInfo.deviceId;
            option.text = sourceInfo.label || 'input ' + (audioSelect.length + 1);
            audioSelect.appendChild(option);
        }

        if (sourceInfo.label.indexOf('default') > -1) {
            defaultInput = sourceInfo.deviceId
        }
    }
    audioSelect.onchange = changeInput;
    return defaultInput
}

function initAudio() {
    var irRRequest = new XMLHttpRequest();
    irRRequest.addEventListener('error', function(err) {
        console.log("Error!: ", err)
    })
    irRRequest.overrideMimeType('text/plain; charset=x-user-defined')
    irRRequest.open("GET", "sounds/cardiod-rear-levelled.wav", true);
    irRRequest.responseType = "arraybuffer";
    irRRequest.onload = function() {
        audioContext.decodeAudioData( irRRequest.response,
            function(buffer) { reverbBuffer = buffer; } );
    }
    irRRequest.send();

    analyser = audioContext.createAnalyser();
    analyser.fftSize = 1024;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;

    analyserView1 = new AnalyserView("meter");

    navigator.mediaDevices.enumerateDevices()
    .then(function(deviceInfos) {
        var defaultDevice = gotSources(deviceInfos)
        var constraints = {
            audio: {
                echoCancellation: true,
                deviceId: defaultDevice,
                noiseSuppression: true,
            }
        }
        navigator.mediaDevices.getUserMedia(constraints)
        .then(gotStream)
        .catch(function(e) {
            alert('Error getting audio');
            console.log(e);
        });
    })
    .catch(function(err) {
        console.log("Error enumerating devices: ", err)
    })
}

initAudio()

function crossfade(value) {
  // equal-power crossfade
  var gain1 = Math.cos(value * 0.5*Math.PI);
  var gain2 = Math.cos((1.0-value) * 0.5*Math.PI);

  dryGain.gain.value = gain1;
  wetGain.gain.value = gain2;
}

var controlsHidden = false;

window.addEventListener('resize', function() {
    analyserView1.calculateCanvasSize()
})

window.addEventListener('keydown', function(e) {
    if(e.key === 'h') {
        controlsHidden = !controlsHidden;
        this.document.getElementsByClassName('controls')[0].style.visibility = `${controlsHidden ? 'hidden' : 'visible'}`
        console.log(this.document.getElementsByClassName('controls'))
    }
})