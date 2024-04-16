import Store from '../store.js';

const renderActions=(function(){

    function renderParticipant (participant) {
        console.log("Rendering local participant:", participant.identity);

        const localParticipantDiv = document.createElement("div");
        localParticipantDiv.setAttribute("id", participant.identity);
        document.getElementById("myVideo").appendChild(localParticipantDiv);

        participant.tracks.forEach(trackPublication => {
            handleTrackPublication(trackPublication, participant);
        });

        participant.on("trackPublished", trackPublication => {
            handleTrackPublication(trackPublication, participant);
        });
    };

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

            console.log(`Rendering remote participant ${participant.identity}`);
        } catch (error) {
            console.error(`Error rendering remote participant ${participant.identity}:`, error);
        }
    };

    // Remove participant video when they leave
    function removeParticipantVideo  (participant)  {
        const participantDiv = document.getElementById(participant.identity);
        if (participantDiv) {
            participantDiv.remove();
            console.log(`Removed video for participant ${participant.identity}`);
        }
    };

// Handle track publication
function handleTrackPublication  (trackPublication, participant)  {
    const track = trackPublication.track;
    const participantDiv = document.getElementById("myVideo");
    // console.log(`Participant ${participant.identity} published a track`, participantDiv);
    if (track && participantDiv) {
        participantDiv.appendChild(track.attach());
    }
};

// Function to render all previous participants
function renderExistingParticipants () {
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

return {
    renderParticipant:renderParticipant,
    renderRemoteParticipant:renderRemoteParticipant,
    removeParticipantVideo:removeParticipantVideo,
    handleTrackPublication:handleTrackPublication,
    renderExistingParticipants:renderExistingParticipants,
    isWebcamEnabled:isWebcamEnabled
};

})();
export default renderActions;