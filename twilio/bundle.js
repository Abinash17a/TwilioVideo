'use strict';

const Store = (function () {
// Private variables
const TwilioVideo = Twilio.Video;
const Device = Twilio.Device;

    // Global variables
    let token;
    let room;
    let localParticipant;
    let roomId;
    let identity;
    let isScreenSharing = false;
    let meetingStartTime;
    // Public methods to get and set variables
    function getAuthToken() {
        return token;
    }
    function setAuthToken(newToken) {
        token = newToken;
    }

    function getRoomId(){
        return roomId
    }
    function getIdentity(){
        return identity
    }
    function setFields(queryParams){
        roomId = queryParams.get('roomId');
        identity = queryParams.get('identity');
    }
    function getlocalParticipant(){
        return localParticipant;
    }
    function setlocalParticipant(localParticipant){
    }
    function getRoom() {
        return room;
    }
    function setRoom(roomname) {
        room=roomname;
    }
    function getisScreenSharing() {
        return isScreenSharing;
    }
    function setisScreenSharing(screenShare) {
        isScreenSharing=screenShare;
    }
     
    function getMeetingStartTime() {
        return meetingStartTime;
    }
    function setMeetingStartTime(time) {
        meetingStartTime=time;
    }

    // Public interface
    return {
        getAuthToken: getAuthToken,
        setAuthToken: setAuthToken,
        TwilioVideo: TwilioVideo,
        Device: Device,
        setFields:setFields,
        getRoomId:getRoomId,
        getIdentity:getIdentity,
        getlocalParticipant:getlocalParticipant,
        setlocalParticipant:setlocalParticipant,
        setRoom:setRoom,
        getRoom:getRoom,
        getisScreenSharing:getisScreenSharing,
        setisScreenSharing:setisScreenSharing,
        getMeetingStartTime:getMeetingStartTime,
        setMeetingStartTime:setMeetingStartTime
    };
})();

const Authmodule = (function () {
    const getAuthToken = async (meetingName) => {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://zingsalesforcetokenapi.azurewebsites.net/videotoken', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        try {
            if (Store.getAuthToken()) {
                return Store.getAuthToken()
            }
            const tokenPromise = new Promise((resolve, reject) => {
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        var data = xhr.responseText;
                        resolve(data);
                    } else {
                        reject('Error:', xhr.status);
                    }
                };
                xhr.onerror = function () {
                    reject('Request failed');
                };
                var requestBody = JSON.stringify({
                    "TWILIO_ACCOUNT_SID": "AC1ce8e56c9b9fcbbd4bbd06351c8a8531",
                    "TWILIO_API_KEY": "SKafe4b7de021987e0dd86cb7d3ce0a173",
                    "TWILIO_API_SECRET": "ljH6UTVR0y15gaNF13kIErZgb3x7YXHk",
                    "identity": Store.getIdentity(),
                    "roomId": Store.getRoomId()
                });
                xhr.send(requestBody);
            });
            let token;
            token = await tokenPromise;
            Store.setAuthToken(token);
            return token
        } catch (error) {
            console.error('Error fetching token:', error);
            throw error;
        }
    };
    return {
        getAuthToken: getAuthToken,
    }
})();

const MeetingTimer = (function () {

    function startMeetingTimer() {
        setInterval(updateMeetingTime, 1000);
    }

    function updateMeetingTime() {
        const endTime = new Date();
        const meetingTime = calculateMeetingTime(Store.getMeetingStartTime(), endTime);
        displayMeetingTime(meetingTime);
    }

    function calculateMeetingTime(startTime, endTime) {
        const durationInMillis = endTime - startTime;
        const durationInSeconds = Math.floor(durationInMillis / 1000);
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
        return { hours, minutes, seconds };
    }

    function displayMeetingTime(meetingTime) {
        // console.log("Meeting time",meetingTime);
        const meetingTimeElement = document.getElementById('meetingTime');
        if (meetingTimeElement) {
            meetingTimeElement.innerText = `${meetingTime.hours}:${meetingTime.minutes}:${meetingTime.seconds}`;
        }
    }

    return {
        startMeetingTimer: startMeetingTimer
    }
})();

const renderActions=(function(){

    function renderParticipant (participant) {
        console.log("Rendering local participant:", participant.identity);

        const localParticipantDiv = document.createElement("div");
        localParticipantDiv.setAttribute("id", participant.identity);
        document.getElementById("videoContainer").appendChild(localParticipantDiv);

        participant.tracks.forEach(trackPublication => {
            handleTrackPublication(trackPublication, participant);
        });

        participant.on("trackPublished", trackPublication => {
            handleTrackPublication(trackPublication, participant);
        });
        MeetingTimer.startMeetingTimer();
    }
    // Render remote participant
    function renderRemoteParticipant  (participant)  {
        console.log("Rendering remote participant:", participant.identity);

        try {
            const participantDiv = document.createElement("div");
            participantDiv.setAttribute("id", participant.identity);
            document.getElementById("videoContainer").appendChild(participantDiv);
            participant.on('trackSubscribed', track => {
                participantDiv.appendChild(track.attach());
            });
            participant.on('trackUnsubscribed', track => {
                track.detach().forEach(element => {
                    element instanceof HTMLElement &&
                    element.remove();
                });
            });
            updateLayout();
            console.log(`Rendering remote participant ${participant.identity}`);
        } catch (error) {
            console.error(`Error rendering remote participant ${participant.identity}:`, error);
        }
    }
    // Remove participant video when they leave
    function removeParticipantVideo  (participant)  {
        const participantDiv = document.getElementById(participant.identity);
        if (participantDiv) {
            participantDiv.remove();
            console.log(`Removed video for participant ${participant.identity}`);
            updateLayout();
        }
    }
    function removeAllRemoteParticipantVideo  ()  {
        Store.getRoom().participants.forEach(participant => {
        const participantDiv = document.getElementById(participant.identity);
        if (participantDiv) {
            participantDiv.remove();
            console.log(`Removed video for participant ${participant.identity}`);
            updateLayout();
        }
        participant.tracks.forEach(trackPublication => {
            if (trackPublication.track) {
                trackPublication.track.disable();
                trackPublication.track.detach().forEach(element => {
                    element instanceof HTMLElement &&
                    element.remove();
                });
                Store.getRoom().localParticipant.unpublishTrack(trackPublication.track);
            }
        });
        });
    }
// Handle track publication
function handleTrackPublication  (trackPublication, participant)  {
    const track = trackPublication.track;
    const participantDiv = document.getElementById(participant.identity);
    if (track && participantDiv) {
        participantDiv.appendChild(track.attach());
        updateLayout();
    }
}
// Function to render all previous participants
function renderExistingParticipants () {
    console.log("renderPreviousParticipant is called");
    Store.getRoom().participants.forEach(existingParticipant => {
        console.log(`Rendering previous participant: ${existingParticipant.identity}`);
        renderRemoteParticipant(existingParticipant);
    });
}

function isWebcamEnabled() {
    if (Store.getRoom().localParticipant && Store.getRoom().localParticipant.videoTracks.size > 0) {
        return Array.from(Store.getRoom().localParticipant.videoTracks.values()).some((trackPublication) => {
            if (trackPublication.track.kind === 'video') {
                console.log(trackPublication.track.mediaStreamTrack.label,
                trackPublication.track.mediaStreamTrack.readyState
            );
                if (
                    trackPublication.track.mediaStreamTrack.label.includes('Camera')
                    && 
                    trackPublication.track.mediaStreamTrack.readyState !== 'ended'
                ) {
                    return true;
                }
            }
            return false;
        });
    }
    return false;
}

function updateLayout() {
    const videoGrid = document.getElementById('videoContainer');
    const numParticipants = videoGrid.children.length;
    // Calculate optimal number of columns and rows based on available space
    let numColumns = Math.ceil(Math.sqrt(numParticipants));
    let numRows = Math.ceil(numParticipants / numColumns);
    // Set CSS custom properties for dynamic video element sizing
    videoGrid.style.setProperty('--num-columns', numColumns);
    videoGrid.style.setProperty('--num-rows', numRows);
  }

return {
    renderParticipant:renderParticipant,
    renderRemoteParticipant:renderRemoteParticipant,
    removeParticipantVideo:removeParticipantVideo,
    handleTrackPublication:handleTrackPublication,
    renderExistingParticipants:renderExistingParticipants,
    isWebcamEnabled:isWebcamEnabled,
    updateLayout:updateLayout,
    removeAllRemoteParticipantVideo:removeAllRemoteParticipantVideo
};

})();

const VideoActions = (function () {

  async function JoinRoom() {
    try {
      console.log("JoinRoom is called", Store.getRoomId());
      const token = await Authmodule.getAuthToken();
      Store.setRoom(await Store.TwilioVideo.connect(
        token, {
          audio: true,
          name: Store.getRoomId(),
          video: { width: 640 }
        }
      ));
      console.log(`Connected to Room: ${Store.getRoom().name}`);
      // Store.setlocalParticipant();
      Store.setMeetingStartTime(new Date());
      try {
        renderActions.renderParticipant(Store.getRoom().localParticipant);
      } catch (error) {
        console.error("Error rendering local participant:", error);
      }

      try {
        renderActions.renderExistingParticipants();
      } catch (error) {
        console.error("Error rendering previous participants:", error);
      }

      Store.getRoom().on('participantConnected', participant => {
          console.log(`Remote participant connected: ${participant.identity}`);
          renderActions.renderRemoteParticipant(participant);
      });

      Store.getRoom().on('participantDisconnected', participant => {
          console.log(`Remote participant disconnected: ${participant.identity}`);
          renderActions.removeParticipantVideo(participant);
      });


    } catch (error) {   
      console.error(`Unable to connect to Room: ${error.message}`);
    }
  }

  async function init() {
    try {
      Store.setFields(new URLSearchParams(window.location.search));
      // Send alert if parameters are empty
      if (!Store.getRoomId() || !Store.getIdentity()) {
        window.alert("Please provide roomId and identity in the URL");
      } else {
        JoinRoom();
      }
    } catch (error) {
      console.error(`Error getting token: ${error}`);
    }
  }

  return {
    JoinRoom,
    init
  };
})();

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
        }else {
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
                element?.remove();
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
                    element.remove();}
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

UserActions.setUpEventHandler();
VideoActions.init();
