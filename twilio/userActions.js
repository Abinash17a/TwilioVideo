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
        if (!renderActions.isScreenSharingActive()) {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = new Twilio.Video.LocalVideoTrack(stream.getVideoTracks()[0]);
            Store.getRoom().localParticipant.publishTrack(screenTrack);
            const selfVideoDiv = document.getElementById("myVideo");
            const selfVideoParent = selfVideoDiv.parentElement;
            const screenVideoElement = document.createElement("video");
            screenVideoElement.autoplay = true;
            screenVideoElement.muted = true;
            screenVideoElement.classList.add("twilio-screen-video"); // Add a class for styling if needed
            // Attach the screen sharing track to the new video element
            screenTrack.attach(screenVideoElement);
            // Replace the self video div with the screen sharing video element
            selfVideoParent.replaceChild(screenVideoElement, selfVideoDiv);
            // Optionally, detach the old self video track if it's still attached
            if (Store.getRoom().localParticipant.videoTracks.size > 1) {
                Store.getRoom().localParticipant.videoTracks.forEach((trackPublication) => {
                    if (trackPublication.track !== screenTrack) {
                        const oldTrack = trackPublication.track;
                        oldTrack.detach().forEach((element) => element.remove());
                        oldTrack.stop();
                    }
                });
            }
        }
            else {
            if (Store.getRoom().localParticipant.videoTracks.size > 0) {
                Store.getRoom().localParticipant.videoTracks.forEach((trackPublication) => {
                    if (trackPublication.track.kind === "video") {
                        trackPublication.track.stop();
                        trackPublication.track.detach().forEach((element) => element.remove());
                    }
                });
            }
        }
    }

    function setUpEventHandler() {
        document.getElementById("toggleMicrophone").addEventListener("click", toggleMicrophone);
        document.getElementById("toggleWebcam").addEventListener("click", toggleWebcam);
        document.getElementById("toggleScreenShare").addEventListener("click", toggleScreenSharing); // Add event listener for toggling screen sharing
    }

    return {
        setUpEventHandler: setUpEventHandler
    }
})();

export default UserActions;
