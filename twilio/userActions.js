import Store from "./store.js";

const UserActions = (function () {
    function toogleMicrophone() {
        if (!Store.getRoom()) return window.alert("Please join a room first");
        const audioTracks = Store.getRoom().localParticipant.audioTracks;
        audioTracks.forEach(audioTrack => {
            if (audioTrack.track.isEnabled) {
                audioTrack.track.disable();
                console.log("Microphone is muted");
            } else {
                audioTrack.track.enable();
                console.log("Microphone is unmuted");
            }
        });
    }
    function toogleWebcam() {
        console.log("Starting webcam...");
    }
    function eventHandler() {
        console.log("first event handler")
        document.getElementById("toggleMicrophone").addEventListener("click", toogleMicrophone);
        document.getElementById("toggleWebcam").addEventListener("click", toogleWebcam);
    }
    return {
        eventHandler: eventHandler
    }
}());

export default UserActions;