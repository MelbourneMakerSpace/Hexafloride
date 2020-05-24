var getUserMedia = require('get-user-media-promise');
var MicrophoneStream = require('microphone-stream');

var micStream;
var audioElement;
var recorder;

const recordAudio = () =>
  new Promise(async resolve => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.addEventListener("dataavailable", event => {
      audioChunks.push(event.data);
    });

    const start = () => mediaRecorder.start();

    const stop = () =>
      new Promise(resolve => {
        mediaRecorder.addEventListener("stop", () => {
          const audioBlob = new Blob(audioChunks);
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          const play = () => audio.play();
          resolve({ audioBlob, audioUrl, play });
        });

        mediaRecorder.stop();
      });

    resolve({ start, stop });
  });

const sleep = time => new Promise(resolve => setTimeout(resolve, time));

// (async () => {
//   const recorder = await recordAudio();
//   recorder.start();
//   await sleep(3000);
//   const audio = await recorder.stop();
//   audio.play();
// })();

function convertBlobToBuffer(superBlob)
{
  let fileReader = new FileReader();
  let arrayBuffer;

  fileReader.onloadend = () => {
      arrayBuffer = fileReader.result;
  }

  fileReader.readAsArrayBuffer(superBlob);
  return fileReader;
}

function convertBlobToAudioBuffer(myBlob) {

  const audioContext = new AudioContext();
  const fileReader = new FileReader();

  fileReader.onloadend = () => {

    let myArrayBuffer = fileReader.result;

    audioContext.decodeAudioData(myArrayBuffer, (audioBuffer) => {

      // Do something with audioBuffer
      console.log("audioBuffer:");
      console.log(audioBuffer);

      var source = audioContext.createBufferSource()
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      // set the value of the pitch here.
      // value of pitch change in positive or negative cents. 
      //100 cents per semitone. 12 semitones per octave.
      //On mars, your voice would be 7 semitones lower.
      source.detune.value = -700;
      source.start(0);

    });
  };

  //Load blob
  fileReader.readAsArrayBuffer(myBlob);
}

//example code from stack overflow
function playSound(name,param) {
  param = param || {}
  var s = SOUNDS[name]
  var source = audioContext.createBufferSource()
  source.buffer = s
  if (param.loop) {
      source.loop = true
  }
  source.connect(audioContext.destination);
  // set the value of the pitch here
  source.detune.value = 0;// value of pitch
  source.start(0);
}

//hacked up function to change the pitch of our
// recorded voice audio context.
function playMarsVoice(audioBlob) {
  console.log("playMarsVoice start.");
  var audioContext = new AudioContext();
  var source = audioContext.createBufferSource();
  source.buffer = convertBlobToAudioBuffer(audioBlob);
  console.log("buffer from conversion:");
  console.log(source.buffer);
  source.connect(audioContext.destination);
  // set the value of the pitch here
  source.detune.value = 1.0;
  console.log('starting source:');
  console.log(source);
  source.start(0);
  console.log("playMarsVoice end.");
}

document.getElementById('my-start-button').onclick = function () {
  // note: for iOS Safari, the constructor must be called in response to a tap, or else the AudioContext will remain
  // suspended and will not provide any audio data.
  var micStream = new MicrophoneStream();
  const audioChunks = [];
  (async () => {
    recorder = await recordAudio();
    recorder.start();
  })();

  // get Buffers (Essentially a Uint8Array DataView of the same Float32 values)
  micStream.on('data', function (chunk) {
    // Optionally convert the Buffer back into a Float32Array
    // (This actually just creates a new DataView - the underlying audio data is not copied or modified.)
    var raw = MicrophoneStream.toRaw(chunk);
    //...
    //console.log(raw);
    audioChunks.push(chunk);
    // note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
  });


  // Stop when ready
  document.getElementById('my-stop-button').onclick = function () {
    micStream.stop();
    console.log('stop');

    //old way to just playback without changes.
    // (async () => {
    //   const audio = await recorder.stop();
    //   audio.play();
    // })();
    
    //make changes then play it back.
    (async () => {
      const audio = await recorder.stop();
      console.log("recorder audio: ");
      console.log(audio);
      playMarsVoice(audio.audioBlob);
      //audio.play();
    })();
    
  };

  getUserMedia({ video: false, audio: true })
    .then(function (stream) {
      micStream.setStream(stream);
      console.log('streaming...');
    })
    .catch(function (error) {
      console.log(error);
    });
};

