const Video = Twilio.Video;
const Device = Twilio.Device;
var token;
let room;
let localParticipant;
var connection;

async function Start() {
    try {
        await getToken();
        console.log(token);
        room = await Video.connect(token, {
            audio: true,
            name: "New Room 1",
            video: { width: 640 }
        });

        console.log(`Connected to Room: ${room.name}`);

        // Get local participant
        localParticipant = room.localParticipant;

        // Render local participant
        renderParticipant(localParticipant);

        room.on('participantConnected', participant => {
            console.log(`Remote participant connected: ${participant.identity}`);
            renderRemoteParticipant(participant);
        
            // Subscribe to tracks for all participants in the room
            room.participants.forEach(existingParticipant => {
                existingParticipant.tracks.forEach(publication => {
                    if (publication.isSubscribed) {
                        renderTrack(publication.track, existingParticipant);
                    }
                });
            });
        });

        room.on('participantDisconnected', participant => {
            console.log(`Remote participant disconnected: ${participant.identity}`);
            removeParticipantVideo(participant);
        });

    } catch (error) {
        console.error(`Unable to connect to Room: ${error.message}`);
    }
}

// Render local participant
const renderParticipant = (participant) => {
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
const renderRemoteParticipant = (participant) => {
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
const removeParticipantVideo = (participant) => {
    const participantDiv = document.getElementById(participant.identity);
    if (participantDiv) {
        participantDiv.remove();
        console.log(`Removed video for participant ${participant.identity}`);
    }
};

// Handle track publication
const handleTrackPublication = (trackPublication, participant) => {
    const track = trackPublication.track;
    const participantDiv = document.getElementById(participant.identity);
    if (track && participantDiv) {
        participantDiv.appendChild(track.attach());
    }
};
