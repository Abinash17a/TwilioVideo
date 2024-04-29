import Store from "./store.js";

const MeetingTimer = (function () {

    let intervalID;
    function startMeetingTimer() {
        intervalID=setInterval(updateMeetingTime, 1000);
    }
    function stopMeetingTimer() {
        clearInterval(intervalID);
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
    
        // Format numbers with leading zeros if needed
        const formattedHours = hours < 10 ? `0${hours}` : String(hours);
        const formattedMinutes = minutes < 10 ? `0${minutes}` : String(minutes);
        const formattedSeconds = seconds < 10 ? `0${seconds}` : String(seconds);
    
        return { hours: formattedHours, minutes: formattedMinutes, seconds: formattedSeconds };
    }

    function displayMeetingTime(meetingTime) {
        // console.log("Meeting time",meetingTime);
        const meetingTimeElement = document.getElementById('meetingTime');
        if (meetingTimeElement) {
            meetingTimeElement.innerText = `${meetingTime.hours}:${meetingTime.minutes}:${meetingTime.seconds}`;
        }
    }

    return {
        startMeetingTimer: startMeetingTimer,
        stopMeetingTimer: stopMeetingTimer
    }
})();

export default MeetingTimer;