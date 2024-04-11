import Store from './store.js';

const Authmodule = (function () {
    const getAuthToken = async (meetingName) => {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://zingsalesforcetokenapi.azurewebsites.net/videotoken', true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        try {
            if (Store.getAuthToken()) {
                return Store.getAuthToken()
            }
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
                    "identity": Store.getIdentity(),
                    "roomId": Store.getRoomId()
                });
                xhr.send(requestBody);
            });
            let token
            token = await tokenPromise;
            Store.setAuthToken(token)
            return token
        } catch (error) {
            console.error('Error fetching token:', error);
            throw error;
        }
    }
    return {
        getAuthToken: getAuthToken,
    }
})();

export default Authmodule;
