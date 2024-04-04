

window.addEventListener('load', async function () {
            
            Start();
            // handleConnectedParticipant(connection.localParticipant);
            // connection.participants.forEach(handleConnectedParticipant);
            // connection.on("participantConnected", handleConnectedParticipant);

});


// action points
// 1)On load of the page we should join a room  done
// how to code-------------
// window on load should load and join  a room done
// get the value of room from join room done as it set to global variable
// 2) on join of the room we have event listener room.on for participant join pending
// then apply room.on event to render new particpant who joined
// 