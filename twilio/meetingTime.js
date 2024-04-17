import Store from "./store.js";

const MeetingTimer = (function () {

    function startMeetingTimer() {
        setInterval(updateMeetingTime, 1000);
    }

    function updateMeetingTime() {
        const endTime = new Date();
        const meetingTime = calculateMeetingTime(Store.getMeetingStartTime(), endTime);
        displayMeetingTime(meetingTime);
    }

    function calculateMeetingTime(startTime, endTime) {
        const durationInMillis = endTime - startTime;
        const durationInSeconds = Math.floor(durationInMillis / 1000);
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        const seconds = durationInSeconds % 60;
        return { hours, minutes, seconds };
    }

    function displayMeetingTime(meetingTime) {
        // console.log("Meeting time",meetingTime);
        const meetingTimeElement = document.getElementById('meetingTime');
        if (meetingTimeElement) {
            meetingTimeElement.innerText = `${meetingTime.hours}:${meetingTime.minutes}:${meetingTime.seconds}`;
        }
    }

    return {
        startMeetingTimer: startMeetingTimer
    }
})();

export default MeetingTimer;