import Store from "./store.js";
import renderActions from "./video/render.js";

const UserActions = (function () {
    let isMicrophoneEnabled = true;
    let isWebcamEnabled = true;
    let isScreenSharingEnabled = false; // Assuming initially screen sharing is disabled

    function toggleMicrophone() {
        if (!Store.getRoom()) return window.alert("Please join a room first");
        const audioTracks = Store.getRoom().localParticipant.audioTracks;
        audioTracks.forEach(audioTrack => {
            if (isMicrophoneEnabled) {
                audioTrack.track.disable();
                console.log("Microphone is muted");
            } else {
                audioTrack.track.enable();
                console.log("Microphone is unmuted");
            }
        });
        isMicrophoneEnabled = !isMicrophoneEnabled; // Toggle the state
    }

    async function toggleWebcam() {
        if (!Store.getRoom()) return window.alert("Please join a room first");
        const videoTracks = Store.getRoom().localParticipant.videoTracks;
        videoTracks.forEach(async videoTrack => {
            if (isWebcamEnabled) {
                videoTrack.track.disable();
                console.log("Webcam is turned off");
            } else {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    const newTrack = stream.getVideoTracks()[0];
                    videoTrack.track.enable();
                    videoTrack.track.attach(newTrack);
                    console.log("Webcam is turned on");
                } catch (error) {
                    console.error("Error accessing webcam:", error);
                }
            }
        });
        isWebcamEnabled = !isWebcamEnabled; // Toggle the state
    }

    async function toggleScreenSharing() {
        if (!Store.getRoom()) return window.alert("Please join a room first");
        try {
            if (!isScreenSharingEnabled) {
                const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                const screenTrack = new Twilio.Video.LocalVideoTrack(stream.getVideoTracks()[0]);
                Store.getRoom().localParticipant.publishTrack(screenTrack);
                console.log("Screen sharing started");
                renderActions.handleScreenSharingTrack(screenTrack, document.getElementById("myVideo"));
            } else {
                const room = Store.getRoom();
                const screenTrack = room.localParticipant.videoTracks.find(track => track.track.name.includes('screen'));
                if (screenTrack) {
                    screenTrack.track.stop();
                    room.localParticipant.unpublishTrack(screenTrack.track);
                    console.log("Screen sharing stopped");
                    renderActions.removeParticipantVideo(room.localParticipant); // Remove screen sharing video from the UI
                }
            }
            isScreenSharingEnabled = !isScreenSharingEnabled; // Toggle the state
        } catch (error) {
            console.error("Error toggling screen sharing:", error);
        }
    }

    function eventHandler() {
        console.log("Setting up event handlers");
        document.getElementById("toggleMicrophone").addEventListener("click", toggleMicrophone);
        document.getElementById("toggleWebcam").addEventListener("click", toggleWebcam);
        document.getElementById("toggleScreenShare").addEventListener("click", toggleScreenSharing); // Add event listener for toggling screen sharing
    }

    return {
        eventHandler: eventHandler
    }
})();

export default UserActions;
