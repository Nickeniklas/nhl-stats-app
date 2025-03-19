console.log("fetchStandings.js innit")


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
        console.log("Fetched data:", data);

        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        document.querySelector('#standings-content').innerHTML = "No standings available..."
    }
    
}

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
            'logo' : team.teamLogo
        })
    });

    return teamsData
}

async function showStandings() {
    // draw content inside "#standings-content"
    const standingsContent = document.querySelector('#standings-content')
    
    // Empty content field and create a table
    standingsContent.innerHTML = `
        <table id="standings-table">
            <thead>
                <tr>
                    <th></th>
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
    console.log(teamsData)
    
    // Append rows to the table
    teamsData.forEach(team => {
        standingsBody.innerHTML += `
            <tr>
                <td><img src="${team.logo}" alt="${team.name} logo" class="standings-team-logo"></td>
                <td>${team.name}</td>
                <td>${team.wins}</td>
                <td>${team.losses}</td>
                <td>${team.gamesPlayed}</td>
                <td>${team.totalPoints}</td>
            </tr>
        `;
    });
}
showStandings()

