var getUserMedia = require('get-user-media-promise');
var MicrophoneStream = require('microphone-stream');

document.getElementById('my-start-button').onclick = function () {
  // note: for iOS Safari, the constructor must be called in response to a tap, or else the AudioContext will remain
  // suspended and will not provide any audio data.
  var micStream = new MicrophoneStream();

  getUserMedia({ video: false, audio: true })
    .then(function (stream) {
      micStream.setStream(stream);
    })
    .catch(function (error) {
      console.log(error);
    });

  // get Buffers (Essentially a Uint8Array DataView of the same Float32 values)
  micStream.on('data', function (chunk) {
    // Optionally convert the Buffer back into a Float32Array
    // (This actually just creates a new DataView - the underlying audio data is not copied or modified.)
    var raw = MicrophoneStream.toRaw(chunk);
    //...

    // note: if you set options.objectMode=true, the `data` event will output AudioBuffers instead of Buffers
  });

  // or pipe it to another stream
  micStream.pipe(/*...*/);

  // It also emits a format event with various details (frequency, channels, etc)
  micStream.on('format', function (format) {
    console.log(format);
  });

  // Stop when ready
  document.getElementById('my-stop-button').onclick = function () {
    micStream.stop();
  };
};
