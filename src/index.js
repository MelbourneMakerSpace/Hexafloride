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
    
    (async () => {
      const audio = await recorder.stop();
      audio.play();
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

