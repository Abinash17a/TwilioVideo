const Authmodule = (function () {
    const getJWT = async (meetingName) => {
        // Extract room ID and identity from URL
        const queryParams = new URLSearchParams(window.location.search);
        const roomId = queryParams.get('roomId');
        const identity = queryParams.get('identity');
    
        // Create XMLHttpRequest to fetch token
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://zingsalesforcetokenapi.azurewebsites.net/videotoken', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
    
        try {
            // Make a request to get the token
            const tokenPromise = new Promise((resolve, reject) => {
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        var data = xhr.responseText;
                        resolve(data);
                    } else {
                        reject('Error:', xhr.status);
                    }
                };
    
                xhr.onerror = function () {
                    reject('Request failed');
                };
                var requestBody = JSON.stringify({
                    "TWILIO_ACCOUNT_SID": "AC1ce8e56c9b9fcbbd4bbd06351c8a8531",
                    "TWILIO_API_KEY": "SKafe4b7de021987e0dd86cb7d3ce0a173",
                    "TWILIO_API_SECRET": "ljH6UTVR0y15gaNF13kIErZgb3x7YXHk",
                    "identity": identity,
                    "roomId": roomId
                });
                xhr.send(requestBody);
            });
            token = await tokenPromise;
            const connection = await Twilio.Video.connect(token);
            return connection;
        } catch (error) {
            console.error('Error fetching token:', error);
            throw error;
        }
    }
    return {
        getJWT: getJWT,
    }
})();

export default Authmodule;
