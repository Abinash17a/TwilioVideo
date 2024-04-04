const Video = Twilio.Video;
const Device = Twilio.Device;
var token;
let room;
const connect = Twilio.Video;
let localParticipant;
var connection;

async function Start() {
    try {
        await getToken();
        console.log("Token in start", token);
        room = await Video.connect(token, { name: "Room2" });
        console.log(`Successfully joined a Room: ${room}`);



        //logging the local participant 
        localParticipant = room.localParticipant;
        console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);
        // const 
        //render local participant 
        handleConnectedlocalParticipant(localParticipant);
        // Add event handler for participant Connected except the local new participant or already joined ones
        handleandRenderParticipant();

    } catch (error) {
        console.error(`Unable to connect to Room: ${error.message}`);
    }
}

handleConnectedlocalParticipant = (localParticipant) => {
    // create a div for this participant's tracks
    // const localparticipantDiv = document.createElement("div");
    // localparticipantDiv.setAttribute("id", localparticipant.identity);
    // document.getElementById("myVideo").appendChild(localparticipantDiv);
    // localparticipant.tracks.forEach((trackPublication) => {
    //     handleTrackPublication(trackPublication, localparticipant);
    // });
    // participant.on("trackPublished", handleTrackPublication);
    // const localParticipant = room.localParticipant;
    // console.log(`Connected to the Room as LocalParticipant "${localParticipant.identity}"`);
    console.log("handleConnectedLocalparticipant function is called");
    room.on('localparticipantConnected', localParticipant => {
        console.log(`localParticipant "${localParticipant.identity}" connected`);
      
        localParticipant.tracks.forEach(publication => {
          if (publication.isSubscribed) {
            const track = publication.track;
            document.getElementById('myVideo').appendChild(track.attach());
          }
        });
      
        localParticipant.on('trackSubscribed', track => {
          document.getElementById('myVideo').appendChild(track.attach());
        });
      });
      console.log("handleConnectedLocalparticipant function is executed as well ");
};

const handleTrackPublication = (trackPublication, participant) => {
    function displayTrack(track) {
        const participantDiv = document.getElementById(participant.identity);
        participantDiv.append(track.attach());
    }
    if (trackPublication.track) {
        displayTrack(trackPublication.track);
    }
    trackPublication.on("subscribed", displayTrack);
};

const handleandRenderParticipant=()=>{
    room.on('participantConnected', participant => {
        console.log(`A remote Participant connected: ${participant}`);
        // Call function to handle connected participant
        // Attach the Participant's Media to a <div> element.
        participant.tracks.forEach(publication => {
            if (publication.isSubscribed) {
                const track = publication.track;
                document.getElementById('remote-media-div').appendChild(track.attach());
            }
        });

        participant.on('trackSubscribed', track => {
            document.getElementById('remote-media-div').appendChild(track.attach());
        });
    });

}



//for participant disconnected
// room.on('participantDisconnected', participant => {
//         console.log(`Participant disconnected: ${participant.identity}`);
//     });