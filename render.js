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
            video: {width: 640, height: 480 }
        });
        console.log(`Connected to Room: ${room.name}`);

        // Get local participant
        localParticipant = room.localParticipant;
        // Render local participant
        renderParticipant(localParticipant);
        //render previous participant
        renderPreviousParticipants();

        room.on('participantConnected', participant => {
            console.log(`Remote participant connected: ${participant.identity}`);
            renderRemoteParticipant(participant);
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
// const renderRemoteParticipant = (participant) => {
//     console.log("Rendering remote participant:", participant.identity);

//     try {
//         const participantDiv = document.createElement("div");
//         participantDiv.setAttribute("id", participant.identity);
//         document.getElementById("video-container").appendChild(participantDiv);

//         participant.on('trackSubscribed', track => {
//             participantDiv.appendChild(track.attach());
//         });

//         console.log(`Rendering remote participant ${participant.identity}`);
//     } catch (error) {
//         console.error(`Error rendering remote participant ${participant.identity}:`, error);
//     }
// };
const renderRemoteParticipant = (participant) => {
    console.log("Rendering remote participant:", participant.identity);

    try {
        const videoContainer = document.getElementById("videoContainer");
        const numParticipants = room.participants.size + 1; // Adding 1 for the local participant
        const gridSize = Math.ceil(Math.sqrt(numParticipants)); // Calculate grid size

        // Set grid template columns based on grid size
        videoContainer.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;

        const participantDiv = document.createElement("div");
        participantDiv.setAttribute("id", participant.identity);
        participantDiv.classList.add("video-screen"); // Add class for styling
        videoContainer.appendChild(participantDiv); // Append to videoContainer

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
// Function to render all previous participants
const renderPreviousParticipants = () => {
    console.log("renderPreviousParticipant is called");
    room.participants.forEach(existingParticipant => {
        console.log(`Rendering previous participant: ${existingParticipant.identity}`);
        renderRemoteParticipant(existingParticipant);
    });
};
// room.on('participantConnected', participant => {
//     console.log(`Remote participant connected: ${participant.identity}`);
//     renderRemoteParticipant(participant);
// });

room&&room.on('participantDisconnected', participant => {
    console.log(`Remote participant disconnected: ${participant.identity}`);
    removeParticipantVideo(participant);
});