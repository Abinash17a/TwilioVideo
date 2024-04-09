const Store = (function () {
// Private variables
const TwilioClient = Twilio.Video;
const Device = Twilio.Device;

    // Global variables
    let token;
    let room;
    let localParticipant;
    let connection;

    // Public methods to get and set variables
    function getAuthToken() {
        return token;
    }
    function setAuthToken(newToken) {
        token = newToken;
    }

    // Public interface
    return {
        getAuthToken: getAuthToken,
        setAuthToken: setAuthToken
    };
})();
export default Store;