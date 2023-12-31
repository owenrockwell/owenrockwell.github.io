let rollForShoesPlayers = getData()
document.addEventListener("DOMContentLoaded", () => init(), {once: true})

function getData() {
    try {
        return JSON.parse(localStorage.getItem("rollForShoes")) ?? []
    }
    catch {
        return []
    }
}

function resetData() {
    if (confirm("Do you want to reset your player data?") == true) {
        rollForShoesPlayers.length = 0
        updateData()
    }
}

function deletePlayer(playerName) {
    if (confirm(`Do you want to delete ${playerName}?`) == true) {
        rollForShoesPlayers = rollForShoesPlayers.filter((player) => player['PlayerName'] !== playerName); 
        updateData()
    }
}

function exportData() {
    const blob = new Blob([JSON.stringify(getData())], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
  
    const a = document.createElement('a')
    a.href = url
    a.download = 'roll-for-shoes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

function importData() {
    const importButton = document.getElementById("import")
    importButton.value = ""
    importButton.addEventListener("change", () => {
        const file = importButton.files[0]
        if (importButton.value && file) {
            const reader = new FileReader()
            reader.readAsText(file)
            reader.onload = function (data) {
                try {
                    dataArray = JSON.parse(data.target.result)
                }
                catch {
                    window.alert("There was an error importing your data.")
                }

                if (Array.isArray(dataArray)) {
                    rollForShoesPlayers = dataArray
                    updateData()
                }
                else
                    window.alert("There was an error importing your data.")
            }
        }
    }, {once: true})
    importButton.click()
}

function getPlayer(playerName) {
    return rollForShoesPlayers.find(player => player['PlayerName'] === playerName)
}

function isPlayerNameUnique(playerName) {
    return !rollForShoesPlayers.some(player => player['PlayerName'] === playerName)
}

function addPlayer(playerName) {
    const name =  playerName.trim()
    if (name.trim() && isPlayerNameUnique(name)) {
        rollForShoesPlayers.push({PlayerName: name, XP: 0, Children: [{Skill: 'Do Anything', Level: 1, Children: []}]})
        updateData()
    }
}

function addXP(playerName) {
    getPlayer(playerName).XP++
    updateData()
}

function removeXP(playerName) {
    const player = getPlayer(playerName)
    player.XP > 0 && player.XP--
    updateData()
}

function addSkill(playerName, parentSkillName, newSkillName) {
    const player = getPlayer(playerName)
    const parentObject = getSkill(player.Children, parentSkillName)

    if (!newSkillName)
        newSkillName = document.getElementById(`${playerName}-add-${parentSkillName}`).value.trim()

    if (newSkillName &&  !getSkill(player.Children, newSkillName)) {
        parentObject.Children.push({Skill: newSkillName, Level: (parentObject.Level + 1), Children: []})
        updateData()
    }
}

function getSkill(children, skillName) {
  let skill = null

  children.forEach(child => {
    if (child.Skill === skillName) {
      skill = child
    } else if (child.Children.length) {
    
      const nestedSkill = getSkill(child.Children, skillName)

      if (nestedSkill) {
        skill = nestedSkill
      }
    }
  })

  return skill
}

function roll(playerName, skillName, skillLevel){
    const diceRolls = []
    for (let i = 0; i < skillLevel; i++) {
        diceRolls.push(Math.floor(Math.random() * 6) + 1)
    }
    const diceRollsSum =   diceRolls.reduce((a, b) => a + b, 0)
    
    let text = `${playerName} used <em>${skillName}</em>, and rolled <em>${diceRollsSum}</em>`

    if (diceRollsSum === skillLevel * 6)
        text += `. CRITICAL SUCCESS! <a href="#${playerName}-add-${skillName}">Add a new skill</a>.`
    else if (skillLevel > 1)
        text += ` <span class="dicerolls"> (${diceRolls})</span>.`.replaceAll(",", " + ").replaceAll("6", "<em>6</em>")
    else
        text += '.'
        
    const diceElement = document.getElementById("dice")
    diceElement.innerHTML = text
    diceElement.focus()

}

function renderSkills(playerName, playerChildren, playerHTML) {

    if (playerChildren?.length) {
        playerHTML += '<ul>'
        
        playerChildren.forEach(child => {
            playerHTML += `
                <li class="control-row">
                    <div class="control-row-title">
                        <button onclick="roll('${playerName}','${child.Skill}', ${child.Level})">${child.Level}</button>
                        ${child.Skill}</div>
                    <div class="controls">
                        <input id="${playerName}-add-${child.Skill}" type="text" placeholder="Add a skill to ${child.Skill}"/>
                        <button onclick="addSkill('${playerName}', '${child.Skill}')">Add Skill</button>
                    </div>
                </li>
            `
            playerHTML = renderSkills(playerName, child.Children, playerHTML)
        })
        
        playerHTML += '</ul>'
    }

  return playerHTML
}

function renderData() {
    const playerDataElement = document.querySelector("data")

    if (!rollForShoesPlayers?.length)
        playerDataElement.innerHTML = "No Player Data" 
    else
        {
            playerHTML = ""
            rollForShoesPlayers.forEach(player => {
                playerHTML += `
                <article>
                    <div class="article-header">
                        <h2>${player.PlayerName}</h2>    
                        <div class="control-row">
                            <div class="xp">${player.XP}&nbsp;XP</div>
                            <div class="controls">
                                <button class="delete" onclick="deletePlayer('${player.PlayerName}')">Delete ${player.PlayerName}</button>
                                <button onclick="addXP('${player.PlayerName}')">+ XP</button>
                                <button onclick="removeXP('${player.PlayerName}')">- XP</button>
                            </div>
                        </div>
                    </div>
                `
                    
                playerHTML = renderSkills(player.PlayerName, player.Children, playerHTML)
                    
                playerHTML += '</article>'
                
            })

            playerDataElement.innerHTML = playerHTML
        }
}

function updateData() {
    const playerData = JSON.stringify(rollForShoesPlayers)
    localStorage.setItem("rollForShoes", playerData)
    renderData()
    addEnterEvent()
}

function addEnterEvent() {
    const inputs = document.querySelectorAll('input[type="text"]')

    inputs.forEach(input => {
        input.addEventListener("keyup", (press) => {
            if (press.key === "Enter") 
                input.parentElement.querySelector("button")?.click()
        })
    });

}

function init() {
    updateData()
}
