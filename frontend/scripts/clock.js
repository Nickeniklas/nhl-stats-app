function getCurrentTime() {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0'); //2 digits
    const minutes = String(now.getMinutes()).padStart(2, '0'); 
    return `${hours}:${minutes}`;
}

//display time in "clock-container"
const clockContainer = document.querySelector('#clock-container');
clockContainer.innerHTML = "Data loaded: " + getCurrentTime() + (" (UTC)");