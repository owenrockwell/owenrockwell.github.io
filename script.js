const rollForShoesPlayers = getData()
document.addEventListener("DOMContentLoaded", () => init(), {once: true})

function getData() {
    try {
        return JSON.parse(localStorage.getItem("rollForShoes"))
    }

    catch {
        return []
    }
}

function resetData() {
    rollForShoesPlayers.length = 0;
    updateData()
}

function isPlayerNameUnique(playerName) {
    return !rollForShoesPlayers.some(obj => obj['PlayerName'] === playerName)
}

function addPlayer(playerName) {
    if (playerName && isPlayerNameUnique(playerName)) {
        rollForShoesPlayers.push({PlayerName: playerName, XP: 0, Children: [{Skill: 'DoAnything', Level: 1, Children: []}]})
        updateData()
    }
}

function addXP(playerName) {
    rollForShoesPlayers.find(obj => obj['PlayerName'] === playerName).XP++
    updateData()
}

function removeXP(playerName) {
    const player = rollForShoesPlayers.find(obj => obj['PlayerName'] === playerName)
    player.XP > 0 && player.XP--
    updateData()
}

function addSkill(playerName, parentSkill, newSkillName) {
    const player = rollForShoesPlayers.find(obj => obj['PlayerName'] === playerName)
    const parentObject = findSkill(player.Children, parentSkill)

    parentObject.Children.push({[newSkillName]: {Level: (parentObject.Level + 1), Children: []}})


    updateData()

}

function findSkill(children, skillName) {
    let skill

    children.forEach(child => {
        if (child.Skill === skillName)
            skill = child
        else if (child.Children.length)
            findSkill(child.Children, skillName)
    })

    return skill
 }

 function renderChildren(child, playerName, playerHTML) {
    playerHTML += `<li>${child.Skill}</li>`
    playerHTML += `<button onclick="addSkill('${playerName}', 'DoAnything', 'DoBetter')">Skill</button>`
    if (child?.Children.length) {
        child.Children.forEach(grandchild => {
            renderChildren(grandchild.Children, playerName, playerHTML)
        })
    }

    return playerHTML;
 }


function renderData() {
    const playerDataElement = document.querySelector("data")

    if (!rollForShoesPlayers.length)
        playerDataElement.innerHTML = "No Player Data" 
    else
        {
            playerHTML = ""
            rollForShoesPlayers.forEach(player => {
                playerHTML += `
                <article>
                    <div class="article-header">
                    <h2>${player.PlayerName}</h2>
                    <h3>${player.XP} XP <button onclick="addXP('${player.PlayerName}')">+</button> <button onclick="removeXP('${player.PlayerName}')">-</button><h3>
                `
                    
                    player.Children.forEach(child => {
                        playerHTML = renderChildren(child, player.PlayerName, playerHTML)
                    });

                    
                playerHTML += '</article>'
                
            });


            playerDataElement.innerHTML = playerHTML;

        }
}

function updateData() {
    const playerData = JSON.stringify(rollForShoesPlayers)
    localStorage.setItem("rollForShoes", playerData)
    renderData();
}

function init() {
    updateData()   
}
