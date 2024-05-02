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

    // Add the background name div 
    const participantName = participant.identity; // Replace this with the participant's name

    document.getElementById("videoContainer").appendChild(localParticipantDiv);

    const containerSpan = addBackgroundNameDiv(participant);
    localParticipantDiv.appendChild(containerSpan);
    const identityText=createUsername(participant);
    
    localParticipantDiv.appendChild(identityText);
    participant.tracks.forEach(trackPublication => {
      handleTrackPublication(trackPublication, participant);
    });

    participant.on("trackPublished", trackPublication => {
      handleTrackPublication(trackPublication, participant);
    });

    MeetingTimer.startMeetingTimer();
  }

  // Render remote participant
  async function renderRemoteParticipant(participant) {

    console.log("Rendering remote participant:", participant.identity);
    const participantDiv = document.createElement("div");
    participantDiv.setAttribute("id", participant.identity);
    participantDiv.classList.add("participant-container", "position-relative"); // Add a class for styling

    // Creating mic icon
    const micIcon=createMicIconForUer(participant);
    participantDiv.appendChild(micIcon);
    // Creating text element for participant identity

    //adding the div to the video Container
    document.getElementById("videoContainer").appendChild(participantDiv);
    UserActions.manageTracksForRemoteParticipant(participant);

    const identityText=createUsername(participant);
    participantDiv.appendChild(identityText);
    
    const containerSpan = addBackgroundNameDiv(participant);
    participantDiv.appendChild(containerSpan);
    participant.on('trackSubscribed', async (track) => {
      const trackElement = await track.attach();
      await updateLayout();
      trackElement.setAttribute('id', "participant_" +participant.identity);
      trackElement.addEventListener('click', () => {
        zoomTrack(participant.identity);
      });
      if(track.isEnabled){
        participantDiv.appendChild(trackElement);
      }else if (track.kind === 'audio'){
        micIcon.classList.add('bi-mic-mute')
      }
    });

    participant.on('trackUnsubscribed', async track => {
      track.detach().forEach(element => {
        if(element.classList.contains('participantZoomed')) zoomTrack(participant.identity);
        element instanceof HTMLElement && element.remove();
      });
    });

   await updateLayout();
  }

  // Remove participant video when they leave
  async function removeParticipantVideo(participant) {
    const participantDiv = document.getElementById(participant.identity);
    if (participantDiv) {
      participantDiv.remove();
      console.log(`Removed video for participant ${participant.identity}`);
     await updateLayout()
    }
  };

  async function removeAllRemoteParticipantVideo() {
    Store.getRoom().participants.forEach(async participant => {
      const participantDiv = document.getElementById(participant.identity);
      if (participantDiv) {
        participantDiv.remove();
        console.log(`Removed video for participant ${participant.identity}`);
       // await updateLayout()
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
  async function handleTrackPublication(trackPublication, participant) {
    const track = trackPublication.track;
    const participantDiv = document.getElementById(participant.identity);
    if (track && participantDiv) {
      const trackElement = await track.attach();
      participantDiv.appendChild(trackElement);
     await updateLayout()
    }
  };

  // Function to render all previous participants
  async function renderExistingParticipants() {
    console.log("renderPreviousParticipant is called");
    Store.getRoom().participants.forEach(async existingParticipant => {
      console.log(`Rendering previous participant: ${existingParticipant.identity}`);
      await renderRemoteParticipant(existingParticipant);
    });
  };


  function isWebcamEnabled() {
    if (Store.getRoom().localParticipant && Store.getRoom().localParticipant.videoTracks.size > 0) {
      return Array.from(Store.getRoom().localParticipant.videoTracks.values()).some((trackPublication) => {
        if (trackPublication.track.kind === 'video') {
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
  function addBackgroundNameDiv(participant) {
    const containerDiv = document.createElement('div');
    const initialSpan = document.createElement('span');
    initialSpan.setAttribute('id', 'initialSpan_' + participant.identity);
    initialSpan.classList.add('initial-background', 'position-absolute');
    const initials = getInitials(participant.identity);
    containerDiv.classList.add("center-div");
    initialSpan.textContent = initials;
    containerDiv.appendChild(initialSpan);
    return containerDiv;
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
    micIcon.classList.add("bi", 
    "float-right", 
    "participant-mic-icon", 
    "text-white",
    "position-absolute",
     "bottom-0",
      "end-0", 
      "m-4",
      "h4"
    );
    return micIcon;
  }

  async function updateLayout(numParticipants = 0) {
    const videoGrid = document.getElementById('videoContainer');
    if (!numParticipants) numParticipants = videoGrid.children.length;
    const marginPerElement = 10;
    const availableWidth = (videoGrid.clientWidth - (numParticipants - 1) * marginPerElement) - 20;
    const availableHeight = videoGrid.clientHeight-20;
    let numColumns = Math.ceil(Math.sqrt(numParticipants));
    let numRows = Math.ceil(numParticipants / numColumns);
    let numofLastRowElements = numParticipants % numColumns;
    let lastRowIndex = numRows - 1; 
    let numColumnsForLastRow = Math.ceil(Math.sqrt(numofLastRowElements));
    let individualWidth;
    let individualHeight = (availableHeight / numRows) + 'px'; 
    for (let i = 0; i < videoGrid.children.length; i++) {
      const participantDiv = videoGrid.children[i];
      const initialSpan = document.getElementById('initialSpan_' + participantDiv.id);
        initialSpan.style.marginTop =  (videoGrid.offsetHeight/(videoGrid.children.length>2?5:2))+"px";
        initialSpan.style.marginLeft =  47+"%";
      // Check if last row
      if (i >= lastRowIndex * numColumns && numofLastRowElements) {
        const lastRowWidth = availableWidth + (numColumnsForLastRow - 1) * marginPerElement +30;
        individualWidth = `${(lastRowWidth / numColumnsForLastRow)-10}px`;
        participantDiv.classList.add('participant-container-last-row-odd')
        videoGrid.style.setProperty('--last-row-odd-width', individualWidth);
        videoGrid.style.setProperty('--last-row-odd-height', individualHeight);
        participantDiv.classList.remove('participant-container')
      } else {
        //not last row
        individualWidth = `${availableWidth / numColumns}px`;
        participantDiv.classList.remove('participant-container-last-row-odd')
        participantDiv.classList.add('participant-container')
        videoGrid.style.setProperty('--row-element-width', individualWidth);
        videoGrid.style.setProperty('--row-element-height', individualHeight);
      }
    }
  }
  
  
  
  async function zoomTrack(id) {
    console.log('zoomTrack', id)
    const container = document.getElementById('videoContainer');
    const participantDiv = document.getElementById(id);
    if (!participantDiv.classList.contains('participantZoomed')) {
      participantDiv.classList.toggle('participantZoomed');
      updateLayout(1)
      container.childNodes.forEach(participant => {
        if (participant !== participantDiv) {
          participant.classList.add('d-none')
        }
      });
    }else{
      participantDiv.classList.remove('participantZoomed');
      container.childNodes.forEach(participant => {
        if (participantDiv !== participant) participant.classList.remove('d-none')
      })
    }
  };

  return {
    renderParticipant: renderParticipant,
    renderRemoteParticipant: renderRemoteParticipant,
    removeParticipantVideo: removeParticipantVideo,
    handleTrackPublication: handleTrackPublication,
    renderExistingParticipants: renderExistingParticipants,
    isWebcamEnabled: isWebcamEnabled,
    updateLayout: updateLayout,
    removeAllRemoteParticipantVideo: removeAllRemoteParticipantVideo,
    zoomTrack: zoomTrack
  };

})();
export default renderActions;