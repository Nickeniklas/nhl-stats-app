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
        //console.log("Fetched data:", data);

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        document.querySelector('#standings-content').innerHTML = "No standings available..."
    }
    
}

// function to process the fetched data
async function handleStandings() {
    let data = await fetchStandings();

    // Sort teams by points in descending order
    const sortedStandings = data.standings.sort((a, b) => b.points - a.points);

    const teamsData = []; //empty list for data
    sortedStandings.forEach(team => {
        //add data to list
        teamsData.push({
            'name' : team.teamCommonName.default,
            'wins' : team.wins,
            'losses' : team.losses,
            'gamesPlayed' : team.gamesPlayed,
            'totalPoints' : team.points,
            'logo' : team.teamLogo,
            'conference' : team.conferenceName,
            'division' : team.divisionName
        })
    });

    return teamsData
}

// function to draw/display standing in html
async function showStandings() {
    // draw content inside "#standings-content"
    const standingsContent = document.querySelector('#standings-content')
    
    // Empty content field and create a table
    standingsContent.innerHTML = `
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
            <tbody id="standings-body">
                <!-- Rows will be added here -->
            </tbody>
        </table>
    `;

    // Select the <tbody> element where rows will be appended
    const standingsBody = document.querySelector('#standings-body');

    // fetched and processed data
    teamsData = await handleStandings();
    //console.log(teamsData)
    
    // Append rows to the table
    teamsData.forEach(team => {
        standingsBody.innerHTML += `
            <tr>
                <td class="team-standings-logo"><img src="${team.logo}" alt="${team.name} logo" class="standings-team-logo">${team.name}</td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                <td>${team.gamesPlayed}</td>
                <td>${team.totalPoints}</td>
            </tr>
        `;
    });
}
showStandings()

// filtering options

//function to filter back to default
async function resetFilters() {
    const filterBtn = document.querySelector('#filter-default');


}
// function to filter by conference:
async function filterByConference() {
    const standingsContent = document.querySelector('#standings-content');

    // Empty content field and create two tables
    standingsContent.innerHTML = `
        <div id="eastern-conference">
            <h2>Eastern Conference</h2>
            <table class="conference-table standings-table">
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>W</th>
                        <th>L</th>
                        <th>GP</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody id="eastern-body">
                    <!-- Rows will be added here -->
                </tbody>
            </table>
        </div>
        <div id="western-conference">
            <h2>Western Conference</h2>
            <table class="conference-table standings-table">
                <thead>
                    <tr>
                        <th>Team</th>
                        <th>W</th>
                        <th>L</th>
                        <th>GP</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody id="western-body">
                    <!-- Rows will be added here -->
                </tbody>
            </table>
        </div>
    `;

    const easternBody = document.querySelector('#eastern-body');
    const westernBody = document.querySelector('#western-body');
    const teamsData = await handleStandings();

    // Separate teams by conference
    const easternTeams = teamsData.filter(team => team.conference === 'Eastern');
    const westernTeams = teamsData.filter(team => team.conference === 'Western');

    // Append rows to the Eastern Conference table
    easternTeams.forEach(team => {
        easternBody.innerHTML += `
            <tr>
            
                <td class="team-standings-logo"><img src="${team.logo}" alt="${team.name} logo" class="standings-team-logo">${team.name}</td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                <td>${team.gamesPlayed}</td>
                <td>${team.totalPoints}</td>
            </tr>
        `;
    });

    // Append rows to the Western Conference table
    westernTeams.forEach(team => {
        westernBody.innerHTML += `
            <tr>
                <td class="team-standings-logo"><img src="${team.logo}" alt="${team.name} logo" class="standings-team-logo">${team.name}</td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                <td>${team.gamesPlayed}</td>
                <td>${team.totalPoints}</td>
            </tr>
        `;
    });
}

// Event listeners for filtering
document.querySelector('#filter-default').addEventListener('click', showStandings);
document.querySelector('#filter-conference').addEventListener('click', filterByConference);

// Get team that are in the playoffs (if they started now) 
async function determinePlayoffTeams() {
    const teamsData = await handleStandings();

    // Separate teams by conference
    const easternTeams = teamsData.filter(team => team.conference === 'Eastern');
    const westernTeams = teamsData.filter(team => team.conference === 'Western');

    // Sort teams by points in descending order
    easternTeams.sort((a, b) => b.totalPoints - a.totalPoints);
    westernTeams.sort((a, b) => b.totalPoints - a.totalPoints);

    // Determine playoff teams for each conference
    const easternPlayoffTeams = getPlayoffTeams(easternTeams);
    const westernPlayoffTeams = getPlayoffTeams(westernTeams);

    // Combine playoff teams into a single list
    const playoffTeams = [...easternPlayoffTeams, ...westernPlayoffTeams];

    // Highlight playoff teams in the table
    const rows = document.querySelectorAll('#standings-body tr, #eastern-body tr, #western-body tr');
    rows.forEach(row => {
        const teamName = row.querySelector('td:nth-child(1)').textContent; // Get the team name from the second column
        if (playoffTeams.some(team => team.name === teamName)) {
            row.style.backgroundColor = '#108552'; // Apply background color
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

// button to show playoff teams
document.querySelector('#filter-playoffs').addEventListener('click', determinePlayoffTeams)