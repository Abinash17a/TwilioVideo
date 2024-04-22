import Store from '../store.js';
import MeetingTimer from "../meetingTime.js";
import UserActions from '../userActions.js';

const renderActions = (function () {

  function renderParticipant(participant) {
    console.log("Rendering local participant:", participant.identity);

    const localParticipantDiv = document.createElement("div");
    localParticipantDiv.setAttribute("id", participant.identity);
    localParticipantDiv.classList.add("participant-container", "position-relative");

    const micIcon = document.createElement("i");
    micIcon.setAttribute("id", "micIcon_" + participant.identity);
    micIcon.classList.add("bi",
      "float-right", "participant-mic-icon",
      "position-absolute", "bottom-0", "end-0"
    ); // Add classes for mic icon and positioning

    localParticipantDiv.appendChild(micIcon);

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
  function renderRemoteParticipant(participant) {
    console.log("Rendering remote participant:", participant.identity);
      const participantDiv = document.createElement("div");
      participantDiv.setAttribute("id", participant.identity);
      participantDiv.classList.add("participant-container", "position-relative"); // Add a class for styling
      const micIcon = document.createElement("i");
      micIcon.setAttribute("id", "micIcon_" + participant.identity);
      micIcon.classList.add("bi",
        "float-right", "participant-mic-icon", 'm-3',
        "position-absolute", "bottom-0", "end-0"
      );
      participantDiv.appendChild(micIcon);
      document.getElementById("videoContainer").appendChild(participantDiv);
      UserActions.manageTracksForRemoteParticipant(participant)
      participant.on('trackSubscribed', track => {
        if(track.isEnabled){
          participantDiv.appendChild(track.attach());
        }else if (track.kind === 'audio'){
          micIcon.classList.add('bi-mic-mute')
        }
      });
      participant.on('trackUnsubscribed', track => {
        track.detach().forEach(element => {
          element instanceof HTMLElement && element.remove();
        });
      });
      updateLayout();
  }

  // Remove participant video when they leave
  function removeParticipantVideo(participant) {
    const participantDiv = document.getElementById(participant.identity);
    if (participantDiv) {
      participantDiv.remove();
      console.log(`Removed video for participant ${participant.identity}`);
      updateLayout()
    }
  };

  function removeAllRemoteParticipantVideo() {
    Store.getRoom().participants.forEach(participant => {
      const participantDiv = document.getElementById(participant.identity);
      if (participantDiv) {
        participantDiv.remove();
        console.log(`Removed video for participant ${participant.identity}`);
        updateLayout()
      }
      participant.tracks.forEach(trackPublication => {
        if (trackPublication.track) {
          trackPublication.track.disable();
          trackPublication.track.detach().forEach(element => {
            element instanceof HTMLElement &&
              element.remove()
          });
          Store.getRoom().localParticipant.unpublishTrack(trackPublication.track);
        }
      })
    });
  };

  // Handle track publication
  function handleTrackPublication(trackPublication, participant) {
    const track = trackPublication.track;
    const participantDiv = document.getElementById(participant.identity);
    if (track && participantDiv) {
      participantDiv.appendChild(track.attach());
      updateLayout()
    }
  };

  // Function to render all previous participants
  function renderExistingParticipants() {
    console.log("renderPreviousParticipant is called");
    Store.getRoom().participants.forEach(existingParticipant => {
      console.log(`Rendering previous participant: ${existingParticipant.identity}`);
      renderRemoteParticipant(existingParticipant);
    });
  };


  function isWebcamEnabled() {
    if (Store.getRoom().localParticipant && Store.getRoom().localParticipant.videoTracks.size > 0) {
      return Array.from(Store.getRoom().localParticipant.videoTracks.values()).some((trackPublication) => {
        if (trackPublication.track.kind === 'video') {
          console.log(trackPublication.track.mediaStreamTrack.label,
            trackPublication.track.mediaStreamTrack.readyState
          )
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
    renderParticipant: renderParticipant,
    renderRemoteParticipant: renderRemoteParticipant,
    removeParticipantVideo: removeParticipantVideo,
    handleTrackPublication: handleTrackPublication,
    renderExistingParticipants: renderExistingParticipants,
    isWebcamEnabled: isWebcamEnabled,
    updateLayout: updateLayout,
    removeAllRemoteParticipantVideo: removeAllRemoteParticipantVideo
  };

})();
export default renderActions;