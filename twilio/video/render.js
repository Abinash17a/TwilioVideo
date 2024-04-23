import Store from '../store.js';
import MeetingTimer from "../meetingTime.js";
import UserActions from '../userActions.js';

const renderActions = (function () {

  function renderParticipant(participant) {
    console.log("Rendering local participant:", participant.identity);

    const localParticipantDiv = document.createElement("div");
    localParticipantDiv.setAttribute("id", participant.identity);
    localParticipantDiv.classList.add("participant-container", "position-relative");

    // Creating mic icon
    const micIcon=createMicIconForUer(participant);
    localParticipantDiv.appendChild(micIcon);

    // Creating text element for participant identity
    const identityText=createUsername(participant);
    localParticipantDiv.appendChild(identityText);

    // Add the background name div 
    const participantName = participant.identity; // Replace this with the participant's name
    const containerSpan = addBackgroundNameDiv(participant.identity);
    localParticipantDiv.appendChild(containerSpan);

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

    // Creating mic icon
    const micIcon=createMicIconForUer(participant);
    participantDiv.appendChild(micIcon);

    // Creating text element for participant identity
    const identityText=createUsername(participant);
    participantDiv.appendChild(identityText);

    const containerSpan = addBackgroundNameDiv(participant.identity);
    participantDiv.appendChild(containerSpan);

    //adding the div to the video Container
    document.getElementById("videoContainer").appendChild(participantDiv);
    UserActions.manageTracksForRemoteParticipant(participant);

    participant.on('trackSubscribed', track => {
      if (track.isEnabled) {
        participantDiv.appendChild(track.attach());
      } else if (track.kind === 'audio') {
        micIcon.classList.add('bi-mic-mute');
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
  function getInitials(name) {
    const words = name.split(' ');

    let initials = '';

    words.forEach(word => {
      initials += word.charAt(0).toUpperCase();
    });
    return initials;
  }
  function addBackgroundNameDiv(participantName) {
    const containerSpan = document.createElement('span');
    const rowSpan = document.createElement('span');
    rowSpan.classList.add('row', 'justify-content-center');
    const colSpan = document.createElement('span');
    colSpan.classList.add('col-md-4');
    const initialSpan = document.createElement('span');
    initialSpan.classList.add('initial-background', 'text-center', 'position-absolute', 'start-50', 'top-50');
    const initials = getInitials(participantName);
    initialSpan.textContent = initials;
    colSpan.appendChild(initialSpan);
    rowSpan.appendChild(colSpan);
    containerSpan.appendChild(rowSpan);
    return containerSpan;
  }
  function createUsername(participant){
    const Text = document.createElement("span");
    Text.textContent = participant.identity; 
    Text.classList.add("participant-identity", "float-left", "position-absolute"); 
    return Text;
  }
  function createMicIconForUer(participant){
    const micIcon = document.createElement("i");
    micIcon.setAttribute("id", "micIcon_" + participant.identity);
    micIcon.classList.add("bi", "float-right", "participant-mic-icon", "position-absolute", "bottom-0", "end-0");
    return micIcon;
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