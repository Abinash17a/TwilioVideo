import Authmodule from './auth.module.js';
import Store from './store.js';
import renderActions from './video/render.js';

const VideoActions = (function () {
  let room = null; // Declare room outside of functions

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

export default VideoActions;
