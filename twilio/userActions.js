import Store from "./store.js";
import renderActions from "./video/render.js";


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
        console.log("mic button clicked");
        const micIcon = document.getElementById("micIcon"); // Select the icon element within the button
        if(micIcon){
            console.log("mic icon found");
        }
        if(isMicrophoneEnabled){
            console.log("mic class change");
            micIcon.className = "bi-mic text-white";
        }else{
            micIcon.className = "bi-mic-mute text-white";
        }
    
        return false; // Optional: Prevent default button behavior
      }
      

    async function startWebcam(videoTrack) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const newTrack = stream.getVideoTracks()[0];
            videoTrack.track.enable();
            videoTrack.track.attach(newTrack);
        } catch (error) {
            console.error("Error accessing webcam:", error);
        }
    }

    async function reStartWebcam() {
        try {
            //createSelfVideoElement()
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            const newTrack = stream.getVideoTracks()[0];
            Store.getRoom().localParticipant.publishTrack(newTrack);
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
      
        // Consider adding error handling with a try...catch block
      }
    function createSelfVideoElement() {
        if (document.getElementById("myVideo")) return;
        const videoContainer = document.getElementById("video-container");
        const selfVideoElement = document.createElement("div");
        selfVideoElement.id = "myVideo";
        selfVideoElement.autoplay = true;
        selfVideoElement.muted = true;
        selfVideoElement.classList.add("video-screen");
        videoContainer.prepend(selfVideoElement);
    }

    async function startScreenSharing() {
        try {
            //renderActions.removeAllRemoteParticipantVideo();
            //createSelfVideoElement();
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = new Twilio.Video.LocalVideoTrack(stream.getVideoTracks()[0]);
            Store.getRoom().localParticipant.publishTrack(screenTrack);
            const screenVideoElement = document.createElement("video");
            screenVideoElement.autoplay = true;
            screenVideoElement.muted = true;
            screenTrack.attach(screenVideoElement);
            Store.setisScreenSharing(true);
        } catch (error) {
            console.error("Error starting screen sharing:", error);
        }
    }

    async function stopScreenSharing() {
        Store.getRoom().localParticipant.videoTracks.forEach((trackPublication) => {
            if (trackPublication.track.kind === "video") {
                const screenTrack = trackPublication.track;
                screenTrack.disable();
                screenTrack.detach().forEach((element) => {
                    element instanceof HTMLElement &&
                    element.remove()}
                );
                screenTrack.unpublishTrack(trackPublication.track);
                screenTrack.stop();
            }
        });
       // renderActions.renderExistingParticipants();
        //renderActions.renderParticipant(Store.getRoom().localParticipant);
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

        // Disconnect local participant's tracks (microphone, webcam, screen share)
        const localParticipant = room.localParticipant;
        localParticipant.tracks.forEach(trackPublication => {
            trackPublication.track.stop();
        });

        // Disconnect from the room
        await room.disconnect();

        // Clean up UI (optional)
        // You can call functions from render.js to remove participant videos, 
        // clear the video container, etc.
    }

    function setUpEventHandler() {
        document.getElementById("toggleMicrophone").addEventListener("click", toggleMicrophone);
        document.getElementById("toggleWebcam").addEventListener("click", toggleWebcam);
        document.getElementById("toggleScreenShare").addEventListener("click", toggleScreenSharing); // Add event listener for toggling screen sharing
        document.getElementById("leaveMeetingButton").addEventListener("click", leaveMeeting);
    }

    return {
        setUpEventHandler: setUpEventHandler
    }
})();

export default UserActions;
