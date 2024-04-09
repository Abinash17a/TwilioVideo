import Authmodule from './auth.module.js';
import {Video} from './store.js';

const VideoActions = (function () {
    async function JoinRoom() {
        try {
            await Authmodule.getAuthToken();
            room = await Video.connect(token, {
                audio: true,
                name: "New Room 1",
                video: { width: 640 }
            });
            console.log(`Connected to Room: ${room.name}`);
            localParticipant = room.localParticipant;
            // renderParticipant(localParticipant);
            // renderPreviousParticipants();
            // room.on('participantConnected', participant => {
            //     renderRemoteParticipant(participant);
            // });
            // room.on('participantDisconnected', participant => {
            //     console.log(`Remote participant disconnected: ${participant.identity}`);
            //     removeParticipantVideo(participant);
            // });
        } catch (error) {
            console.error(`Unable to connect to Room: ${error.message}`);
        }
    }

    return {
        JoinRoom: JoinRoom
    };
})();
export default VideoActions;