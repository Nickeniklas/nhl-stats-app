async function fetchNow() {
    try {
        // backend api route ("/api/schedule/now")
        const response = await fetch('/api/schedule/now');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // fetch succeeded
        const data = await response.json();
        //console.log("Fetched data:", data);
        return data.gameWeek;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function processNow(nowData, year, month, day) {
    // Check if gameWeek is not empty
    if (nowData && nowData.length > 0) {
        const allGames = [];
        // Loop through gameWeek to get all games for the entire week
        nowData.forEach(day => {
            allGames.push(...day.games); // Add games from each day into the allGames array 
        });

        // Filter games for today based on the current date
        const processedData = allGames.filter(game => {
            const gameDateUTC = new Date(game.startTimeUTC); // Parse the game start time
            const gameDateEET = new Date(gameDateUTC.setHours(gameDateUTC.getHours() - 2)); // match UTC with EET
            //console.log("Game start time (UTC):", gameDateUTC.toISOString());
            //console.log("Game start time (EET):", gameDateEET);

            // Compare the game date with today's date (in UTC form)
            return gameDateUTC.getUTCFullYear() === year &&
                gameDateUTC.getUTCMonth() + 1 === month &&
                gameDateUTC.getUTCDate() === day;
        });
        //console.log("Games today:", processedData)
        return processedData
    } else {
        console.log("Couldn't process data")
        return []
    }
}

// draw content in html page
function displayNow(processedData, targetElementId) {
    // check if 
    if (processedData.length > 0) {
        targetElementId.innerHTML = "";
        processedData.forEach(game => {
            // Extract the relevant details for the game (e.g., teams, time, etc.)
            const gameDetails = `
                <div class="today-game-cards">
                    <h3 class=today-team-titles>
                        <img src="${game.awayTeam.logo}" alt="${game.awayTeam.commonName.default} logo" class="schedule-team-logo">
                        ${game.awayTeam.commonName.default} vs 
                        <img src="${game.homeTeam.logo}" alt="${game.homeTeam.commonName.default} logo" class="schedule-team-logo">
                        ${game.homeTeam.commonName.default}
                    </h3>
                    <p>Game Time: ${new Date(game.startTimeUTC).toLocaleString()}</p>
                    <p>Venue: ${game.venue.default}</p>
                </div>
            `;

            // Display the game details in the HTML
            targetElementId.innerHTML += gameDetails;
        });
    } else {
        targetElementId.innerHTML = "<p>No games scheduled for today.</p>";
    }        
}


// MAIN FUNCTION TO FETCH, PROCESS AND DISPLAY
async function now() {
    const nowData = await fetchNow();    
    
    // variables for todays date
    const today = new Date();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() + 1;
    const day = today.getUTCDate();
    const processedData = processNow(nowData, year, month, day);
    
    // target element id
    const nowTargetElementId = document.querySelector('#today-content');

    displayNow(processedData, nowTargetElementId);
}

// filtering options
//hide now
function hideNow() {
    // hardcoded target element id
    const nowTargetElementId = document.querySelector('#today-content');
    nowTargetElementId.innerHTML = "";
}

// execute scripts and initialize buttons
document.addEventListener('DOMContentLoaded', () => { // Use DOMContentLoaded
    now(); // Initial display (execute scripts)

    const filterDefaultBtn = document.querySelector('#filter-now-default');
    const filterHideBtn = document.querySelector('#filter-now-hide');

    if (filterDefaultBtn) {
        filterDefaultBtn.addEventListener('click', now);
    }
    if (filterHideBtn) {
        filterHideBtn.addEventListener('click', hideNow);
    }
});
