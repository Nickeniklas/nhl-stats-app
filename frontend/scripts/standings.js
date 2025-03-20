// function for making api request to fetch standings 
async function fetchStandings() {
    try {
        // backend api route ("/api/standings/now")
        const response = await fetch('/api/standings/now')
        if (!response.ok) {
            document.querySelector('#standings-content').innerHTML = "No standings available..."
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // fetch succeeded
        const data = await response.json();
        //console.log("Fetched data:", data.standings);

        return data.standings;
    } catch (error) {
        console.error("Error fetching data:", error);
        document.querySelector('#standings-content').innerHTML = "No standings available..."
        return []; //to avoid errors
    }
    
}

// function to process the fetched data
function processStandings(standingsData) {
    if (!standingsData || standingsData.length === 0) {
        return []; // Handle empty or invalid input
    }
    return standingsData
        .sort((a, b) => b.points - a.points)
        .map(team => ({
            name: team.teamCommonName.default,
            wins: team.wins,
            losses: team.losses,
            gamesPlayed: team.gamesPlayed,
            totalPoints: team.points,
            logo: team.teamLogo,
            conference: team.conferenceName,
            division: team.divisionName
        }));
}
// function for drawing standins in the html UI
function displayStandings(primaryTeamData, primaryElementId, secondaryTeamData = null, secondaryElementId = null) {   
    const standingsContent = document.querySelector('#standings-content');
    if (!standingsContent) {
        console.error(`Element with id "${primaryElementId}" not found.`);
        return; // Important: Exit if target element doesn't exist
    }
    if (!primaryTeamData || primaryTeamData.length === 0) {
        standingsContent.innerHTML = "<p class='no-data-message'>No data to display.</p>";
        return;
    }

    // Start building the table
    let tableHTML = `
        <table class="standings-table">
            <thead>
                <tr>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>GP</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody id="${primaryElementId}">
                <!-- Primary data comes here -->
            </tbody>
    `;

    // If a secondary element ID is provided, add a second <tbody>
    if (secondaryTeamData && secondaryElementId) {
        tableHTML += `
        <table class="standings-table">
            <thead>
                <tr>
                    <th>Team</th>
                    <th>W</th>
                    <th>L</th>
                    <th>GP</th>
                    <th>Points</th>
                </tr>
            </thead>
            <tbody id="${secondaryElementId}">
                <!-- Secondary data comes here -->
            </tbody>
        `;
    }

    tableHTML += `</table>`; // Close the table

    // Set the table HTML
    standingsContent.innerHTML = tableHTML;

    // Populate the primary table body
    const primaryBody = document.querySelector(`#${primaryElementId}`);
    primaryTeamData.forEach(team => {
        primaryBody.innerHTML += `
            <tr>
                <td>
                    <img src="${team.logo}" alt="${team.name} logo" class="standings-team-logo">
                    ${team.name}
                </td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                <td>${team.gamesPlayed}</td>
                <td>${team.totalPoints}</td>
            </tr>
        `;
    });

    // If a secondary table body is provided, populate it with the same data (or modify as needed)
    if (secondaryElementId) {
        const secondaryBody = document.querySelector(`#${secondaryElementId}`);
        secondaryTeamData.forEach(team => {
            secondaryBody.innerHTML += `
                <tr>
                    <td>
                        <img src="${team.logo}" alt="${team.name} logo" class="standings-team-logo">
                        ${team.name}
                    </td>
                    <td>${team.wins}</td>
                    <td>${team.losses}</td>
                    <td>${team.gamesPlayed}</td>
                    <td>${team.totalPoints}</td>
                </tr>
            `;
        });
    }
}

// MAIN FUNCTION TO FETCH, PROCESS AND DISPLAY
async function standings() {
    const standingsData = await fetchStandings();
    const processedData = processStandings(standingsData);
    displayStandings(processedData, 'standings-body')

}//executed at the very end of script

// filtering options
// function to filter by conference:
async function filterByConference() {
    //get data
    const standingsData = await fetchStandings();
    const processedData = processStandings(standingsData);

    // Separate teams by conference
    const easternTeams = processedData.filter(team => team.conference === 'Eastern');
    const westernTeams = processedData.filter(team => team.conference === 'Western');

    //target element for table 
    const standingsContent = document.querySelector('#standings-content');
    if (!standingsContent) return;

    // call display function per conference
    displayStandings(westernTeams, 'western-body', easternTeams, 'eastern-body');
}

// Get team that are in the playoffs (if they started now) 
async function determinePlayoffTeams() {
    //get data
    const standings = await fetchStandings();
    const processedData = processStandings(standings);

    // Separate teams by conference
    const easternTeams = processedData.filter(team => team.conference === 'Eastern');
    const westernTeams = processedData.filter(team => team.conference === 'Western');

    // Sort teams by points in descending order
    easternTeams.sort((a, b) => b.totalPoints - a.totalPoints);
    westernTeams.sort((a, b) => b.totalPoints - a.totalPoints);

    // Determine playoff teams for each conference
    const easternPlayoffTeams = getPlayoffTeams(easternTeams);
    const westernPlayoffTeams = getPlayoffTeams(westernTeams);

    // Combine playoff teams into a single list
    const playoffTeams = [...easternPlayoffTeams, ...westernPlayoffTeams];

    // Highlight playoff teams in the table
    const tableBodies = document.querySelectorAll('#standings-body, #eastern-body, #western-body'); //Select ALL table bodies
    console.log("Selected table bodies:", tableBodies);
    tableBodies.forEach(tableBody => {
        if(tableBody){ // make sure the table body exists.
            const rows = tableBody.querySelectorAll('tr'); // Get rows within each table
            rows.forEach(row => {
                const teamName = row.querySelector('td:nth-child(1)').textContent.trim(); // Get the team name from the second column
                if (playoffTeams.some(team => team.name === teamName)) {
                    row.style.backgroundColor = '#108552'; // Apply background color
                }
            });
        }
    });

    console.log("Eastern Conference Playoff Teams:", easternPlayoffTeams);
    console.log("Western Conference Playoff Teams:", westernPlayoffTeams);



    return { easternPlayoffTeams, westernPlayoffTeams };
}

// Helper function to determine playoff teams for a conference
function getPlayoffTeams(conferenceTeams) {
    // Group teams by division
    const divisions = {};
    conferenceTeams.forEach(team => {
        if (!divisions[team.division]) {
            divisions[team.division] = []; // Initialize an empty array for the division
        }
        divisions[team.division].push(team); // Add the team to the appropriate division
    });

    // Sort each division's teams by points
    Object.keys(divisions).forEach(division => { // iterate the divisons objects keys
        divisions[division].sort((a, b) => b.totalPoints - a.totalPoints);
    });

    // Get top 3 teams from each division
    const topDivisionTeams = [];
    Object.values(divisions).forEach(divisionTeams => { // iterate the divisons objects values
        topDivisionTeams.push(...divisionTeams.slice(0, 3));
    });

    // Sort remaining teams by points to determine wildcard spots
    const remainingTeams = conferenceTeams.filter(
        team => !topDivisionTeams.includes(team)
    );
    remainingTeams.sort((a, b) => b.totalPoints - a.totalPoints);

    // Combine top division teams and wildcard teams
    const wildcardTeams = remainingTeams.slice(0, 2);
    return [...topDivisionTeams, ...wildcardTeams];
}

// 9. Event Listeners
document.addEventListener('DOMContentLoaded', () => { // Use DOMContentLoaded
    standings(); // Initial display

    const filterDefaultBtn = document.querySelector('#filter-standings-default');
    const filterConferenceBtn = document.querySelector('#filter-standings-conference');
    const filterPlayoffsBtn = document.querySelector('#filter-standings-playoffs');

    if (filterDefaultBtn) {
        filterDefaultBtn.addEventListener('click', standings);
    }
    if (filterConferenceBtn) {
        filterConferenceBtn.addEventListener('click', filterByConference);
    }
    if (filterPlayoffsBtn) {
        filterPlayoffsBtn.addEventListener('click', determinePlayoffTeams);
    }
});