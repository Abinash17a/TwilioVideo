
var videoStream;

function startWebcam() {
    console.log("start webcam");
    navigator.mediaDevices
        .getUserMedia({ video: true })
        .then(function (stream) {
            var video = document.getElementById("myVideo");
            videoStream = stream;
            video.srcObject = stream;
        })
        .catch(function (error) {
            console.error("Error accessing webcam:", error);
        });
}

function stopWebcam() {
    console.log("stop webcam");
    if (videoStream) {
        videoStream.getTracks().forEach(function (track) {
            track.stop();
        });
        videoStream = null;
    }
    var video = document.getElementById("myVideo");
    video.srcObject = null;
}
let mediaStream = null;

function startMicrophone() {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
            mediaStream = stream;
        })
        .catch(function (error) {
            console.error('Error accessing microphone: ' + error);
        });
}

function stopMicrophone() {
    if (mediaStream) {
        mediaStream.getTracks().forEach(function (track) {
            track.stop();
        });
    }
}

function toggleMicrophone() {
    // toggle the microphone via twilio-video.js
    room.localParticipant.audioTracks.forEach(publication => {
        publication.track.disable();
    });
}

function mute() {
    room.localParticipant.audioTracks.forEach(publication => {
        publication.track.disable();
    });
}

function togglemute() {
    if (connection) {
        connection.then(room => {
            room.localParticipant.audioTracks.forEach(function (track) {
                console.log("room", '-----------88', track.track.isEnabled)
                track.track.disable();
            });
        });
    }
    updateMuteButton();
}
