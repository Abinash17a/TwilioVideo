const Store = (function () {
// Private variables
const TwilioVideo = Twilio.Video;
const Device = Twilio.Device;

    // Global variables
    let token;
    let room;
    let localParticipant;
    let connection;
    let roomId
    let identity
    let isScreenSharing = false;
    // Public methods to get and set variables
    function getAuthToken() {
        return token;
    }
    function setAuthToken(newToken) {
        token = newToken;
    }

    function getRoomId(){
        return roomId
    }
    function getIdentity(){
        return identity
    }
    function setFields(queryParams){
        roomId = queryParams.get('roomId');
        identity = queryParams.get('identity');
    }
    function getlocalParticipant(){
        return localParticipant;
    }
    function setlocalParticipant(localParticipant){
        localParticipant=localParticipant;
    }
    function getRoom() {
        return room;
    }
    function setRoom(roomname) {
        room=roomname;
    }
    function getisScreenSharing() {
        return isScreenSharing;
    }
    function setisScreenSharing(screenShare) {
        isScreenSharing=screenShare;
    }

    // Public interface
    return {
        getAuthToken: getAuthToken,
        setAuthToken: setAuthToken,
        TwilioVideo: TwilioVideo,
        Device: Device,
        setFields:setFields,
        getRoomId:getRoomId,
        getIdentity:getIdentity,
        getlocalParticipant:getlocalParticipant,
        setlocalParticipant:setlocalParticipant,
        setRoom:setRoom,
        getRoom:getRoom,
        getisScreenSharing:getisScreenSharing,
        setisScreenSharing:setisScreenSharing
    };
})();
export default Store;