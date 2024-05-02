import Store from "./store.js";
import renderActions from "./video/render.js";
import MeetingTimer from "./meetingTime.js";

const UserActions = (function () {
    let isMicrophoneEnabled = true;

    function toggleMicrophone() {
        if (!Store.getRoom()) return window.alert("Please join a room first");
        const audioTracks = Store.getRoom().localParticipant.audioTracks;
        audioTracks.forEach(audioTrack => {
            if (isMicrophoneEnabled) {
                audioTrack.track.disable();
            } else {
                audioTrack.track.enable();
            }
        });
        isMicrophoneEnabled = !isMicrophoneEnabled;
        const micIcon = document.getElementById("micIcon"); // Select the icon element within the button
        if (isMicrophoneEnabled) {
            micIcon.className = "bi-mic text-white";
        } else {
            micIcon.className = "bi-mic-mute text-white";
        }

        return false; // Optional: Prevent default button behavior
    }


    async function startWebcam(videoTrack) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const newTrack = stream.getVideoTracks()[0];
            videoTrack.track.enable();
            await videoTrack.track.attach(newTrack);
        } catch (error) {
            console.error("Error accessing webcam:", error);
        }
    }

    async function reStartWebcam() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const newTrack = stream.getVideoTracks()[0];
            await Store.getRoom().localParticipant.publishTrack(newTrack);
        } catch (error) {
            console.error("Error accessing webcam:", error);
        }
    }

    async function stopWebcam(videoTrack) {
        videoTrack.track.disable();
        videoTrack.track.detach().forEach((element) => {
            element instanceof HTMLElement &&
                element?.remove()
        });
        Store.getRoom().localParticipant.unpublishTrack(videoTrack.track);
    }

    async function toggleWebcam() {
        if (!Store.getRoom()) return window.alert("Please join a room first");

        const videoTracks = await Store.getRoom().localParticipant.videoTracks;

        if (videoTracks.size) {
            videoTracks.forEach(async videoTrack => {
                const isWebcamEnabled = await renderActions.isWebcamEnabled(); // Ensure proper await
                if (isWebcamEnabled) {
                    await stopWebcam(videoTrack);
                    console.log("Camera off");
                    const webcamIcon = document.getElementById("camIcon"); // Use the correct ID
                    webcamIcon.classList.remove("bi-camera-video");
                    webcamIcon.classList.add("bi-camera-video-off");
                } else {
                    await startWebcam(videoTrack);
                    console.log("Camera on");
                    const webcamIcon = document.getElementById("camIcon");



                    webcamIcon.classList.remove("bi-camera-video-off"); // Assuming off state class
                    webcamIcon.classList.add("bi-camera-video");
                }
            });
        } else if (videoTracks.size === 0 && !await renderActions.isWebcamEnabled()) {
            await reStartWebcam();
            console.log("Restarted camera");
            const webcamIcon = document.getElementById("camIcon");
            webcamIcon.classList.remove("bi-camera-video-off"); // Assuming off state class
            webcamIcon.classList.add("bi-camera-video");
        }
    }

    async function startScreenSharing() {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = new Twilio.Video.LocalVideoTrack(stream.getVideoTracks()[0]);
            Store.setScreenTrack(screenTrack);
            Store.getRoom().localParticipant.publishTrack(screenTrack);
            const screenVideoElement = document.createElement("video");
            screenVideoElement.autoplay = true;
            screenVideoElement.muted = true;
            await screenTrack.attach(screenVideoElement);
            Store.setisScreenSharing(true);
        } catch (error) {
            console.error("Error starting screen sharing:", error);
        }
    }

    async function stopScreenSharing() {
        Store.getRoom().localParticipant.unpublishTrack(Store.getScreenTrack());
        Store.getScreenTrack().stop();
        Store.setScreenTrack(null);
        Store.setisScreenSharing(false);
    }

    async function toggleScreenSharing() {
        if (!Store.getRoom()) return window.alert("Please join a room first");
        const videoTracks = Store.getRoom().localParticipant.videoTracks;
        if (videoTracks.size) {
            videoTracks.forEach(videoTrack => {
                stopWebcam(videoTrack);
            });
        }
        if (Store.getisScreenSharing()) {
            await stopScreenSharing();
        } else {
            await startScreenSharing();
        }
    }
    async function leaveMeeting() {
        const room = Store.getRoom();
        if (!room) {
            console.warn("You are not currently in a room");
            return;
        }
        const localParticipant = room.localParticipant;
        localParticipant.tracks.forEach(trackPublication => {
            trackPublication.track.stop();
        });
        await room.disconnect();
        MeetingTimer.stopMeetingTimer();
    }

    async function onTrackEnabled(track, participant) {
        toggleMicIconVisibility(participant, 'unmuted');
    }

    function toggleMicIconVisibility(participant, action) {
        const micIcon = document.getElementById(`micIcon_${participant.identity}`);
        if (action === 'unmuted') {
            micIcon.classList.remove("bi-mic-mute-fill");
        } else {
            micIcon.classList.add("bi-mic-mute-fill");
        }
    }

    async function onTrackDisabled(track, participant) {
        toggleMicIconVisibility(participant, 'muted');
    }
    function attachTrackEnabledAndDisabledHandlers(track, participant) {
        track.on('enabled', () => onTrackEnabled(track, participant));
        track.on('disabled', () => onTrackDisabled(track, participant));
    }

        function handleMuteAndUnmuteEventsForRemoteParticipant(participant) {
            participant.tracks.forEach(publication => {
                if (!publication.isSubscribed)
                    return;
                if (!publication.track)
                    return;
                const track = publication.track;
                attachTrackEnabledAndDisabledHandlers(track, participant);
            });
        }

        function onTrackSubscribed(track, participant) {
            attachTrackEnabledAndDisabledHandlers(track, participant);
        }

        function onTrackUnsubscribed(track, participant) {
            track.detach().forEach(element => element.remove());
        }

        function manageTracksForRemoteParticipant(participant) {
            handleMuteAndUnmuteEventsForRemoteParticipant(participant);
            participant.on('trackSubscribed', (track) => onTrackSubscribed(track, participant));
            participant.on('trackUnsubscribed', (track) => onTrackUnsubscribed(track, participant));
        }

    function setUpEventHandler() {
        document.getElementById("toggleMicrophone").addEventListener("click", toggleMicrophone);
        document.getElementById("toggleWebcam").addEventListener("click", toggleWebcam);
        document.getElementById("toggleScreenShare").addEventListener("click", toggleScreenSharing); // Add event listener for toggling screen sharing
        document.getElementById("leaveMeetingButton").addEventListener("click", leaveMeeting);
    }

    return {
        setUpEventHandler: setUpEventHandler,
        manageTracksForRemoteParticipant: manageTracksForRemoteParticipant,
        // trackExistsAndIsAttachable:trackExistsAndIsAttachable
    }
})();

export default UserActions;
