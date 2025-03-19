// variables for date
const date = new Date();
const year = date.getUTCFullYear();
const month = date.getUTCMonth() + 1;
const day = date.getUTCDate();
const hour = date.getUTCHours();

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

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// draw content in html page
async function showContent() {
    let nowData = await fetchNow();    
    const todayContent = document.querySelector('#today-content')
    
    // Check if gameWeek is not empty
    if (nowData.gameWeek && nowData.gameWeek.length > 0) {
        const allGames = [];
        // Loop through gameWeek to get all games for the entire week
        nowData.gameWeek.forEach(day => {
            allGames.push(...day.games); // Add games from each day into the allGames array 
        });
        //console.log(allGames[0].startTimeUTC)

        // Filter games for today based on the current date
        const todayGames = allGames.filter(game => {
            const gameDateUTC = new Date(game.startTimeUTC); // Parse the game start time
            const gameDateEET = new Date(gameDateUTC.setHours(gameDateUTC.getHours() - 2));

            //console.log("Game start time (UTC):", gameDateUTC.toISOString());
            //console.log("Game start time (EET):", gameDateEET);

            // Compare the game date with today's date (in UTC form)
            return gameDateUTC.getUTCFullYear() === year &&
                gameDateUTC.getUTCMonth() + 1 === month &&
                gameDateUTC.getUTCDate() === day;
        });
        //console.log("Games today:", todayGames)

        if (todayGames.length > 0) {
            todayContent.innerHTML = "";
            todayGames.forEach(game => {
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
                todayContent.innerHTML += gameDetails;
            });
        } else {
            todayContent.innerHTML = "<p>No games scheduled for today.</p>";
        }        
    } else {
        todayContent.innerHTML = '<p>No games scheduled for today.</p>';
    }
}
showContent()
