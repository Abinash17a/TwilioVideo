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
            renderremoteParticipant(participant);
        });

    } catch (error) {
        console.error(`Unable to connect to Room: ${error.message}`);
    }
}
//for local participant
const renderParticipant = (participant) => {
    console.log("Rendering local participant:", participant.identity);

    const localparticipantDiv = document.createElement("div");
    localparticipantDiv.setAttribute("id", participant.identity);
    document.getElementById("myVideo").appendChild(localparticipantDiv);

    participant.tracks.forEach(trackPublication => {
        handleTrackPublication(trackPublication, participant);
    });

    participant.on("trackPublished", trackPublication => {
        handleTrackPublication(trackPublication, participant);
    });
};


//for remote participant
const renderremoteParticipant = (participant) => {
    console.log("Rendering participant:", participant.identity);

    const participantDiv = document.createElement("div");
    participantDiv.setAttribute("id", participant.identity);
    document.getElementById("videoContainer").appendChild(participantDiv);

    participant.tracks.forEach(trackPublication => {
        handleTrackPublication(trackPublication, participant);
    });

    participant.on("trackPublished", trackPublication => {
        handleTrackPublication(trackPublication, participant);
    });
};

const handleTrackPublication = (trackPublication, participant) => {
    const track = trackPublication.track;
    const participantDiv = document.getElementById(participant.identity);
    if (track) {
        participantDiv.appendChild(track.attach());
    }
};
