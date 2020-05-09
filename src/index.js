var getUserMedia = require('get-user-media-promise');
var MicrophoneStream = require('microphone-stream');

var micStream;

document.getElementById('my-start-button').onclick = function () {
  // note: for iOS Safari, the constructor must be called in response to a tap, or else the AudioContext will remain
  // suspended and will not provide any audio data.
  var micStream = new MicrophoneStream();

  // get Buffers (Essentially a Uint8Array DataView of the same Float32 values)
  micStream.on('data', function (chunk) {
    // Optionally convert the Buffer back into a Float32Array
    // (This actually just creates a new DataView - the underlying audio data is not copied or modified.)
    var raw = MicrophoneStream.toRaw(chunk);
    //...
    console.log(raw);
    // note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
  });

  // Stop when ready
  document.getElementById('my-stop-button').onclick = function () {
    micStream.stop();
    console.log('stop');
    console.log(micStream);
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
