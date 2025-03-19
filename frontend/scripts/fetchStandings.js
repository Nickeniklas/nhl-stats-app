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
    //empty content field
    standingsContent.innerHTML = "<ol id='standings-list'></ol>"
    const standingsList = document.querySelector('#standings-list')


    // fetched and processed data
    teamsData = await handleStandings();
    console.log(teamsData)

    

    teamsData.forEach(team => {
        standingsList.innerHTML += `
        <li><img src="${team.logo}" alt="${team.name} logo" class="standings-team-logo">${team.name} | ${team.wins} - ${team.losses} | total games: ${team.gamesPlayed} | total points: ${team.totalPoints}</li>
        <hr>
        `
    });
}
showStandings()

