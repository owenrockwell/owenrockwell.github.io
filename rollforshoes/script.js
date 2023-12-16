const rollForShoesPlayers = getData()
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

function isPlayerNameUnique(playerName) {
    return !rollForShoesPlayers.some(obj => obj['PlayerName'] === playerName)
}

function addPlayer(playerName) {
    const name =  playerName.trim()
    if (name.trim() && isPlayerNameUnique(name)) {
        rollForShoesPlayers.push({PlayerName: name, XP: 0, Children: [{Skill: 'Do Anything', Level: 1, Children: []}]})
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

function addSkill(playerName, parentSkillName, newSkillName) {
    const player = rollForShoesPlayers.find(obj => obj['PlayerName'] === playerName)
    const parentObject = findSkill(player.Children, parentSkillName)

    if (!newSkillName)
        newSkillName = document.getElementById(`${playerName}-add-${parentSkillName}`).value.trim()

    if (newSkillName &&  !findSkill(player.Children, newSkillName)) {
        parentObject.Children.push({Skill: newSkillName, Level: (parentObject.Level + 1), Children: []})
        updateData()
    }
}

function findSkill(children, skillName) {
  let skill = null

  children.forEach(child => {
    if (child.Skill === skillName) {
      skill = child
    } else if (child.Children.length) {
    
      const nestedSkill = findSkill(child.Children, skillName)

      if (nestedSkill) {
        skill = nestedSkill
      }
    }
  })

  return skill
}

function roll(playerName, skillName, skillLevel){
    const diceElement = document.getElementById("dice")
    const rollMax = skillLevel * 6
    const roll = Math.floor(Math.random() * rollMax) + 1
    let text = `${playerName} used <em>${skillName}</em>, and rolled a <b><em>${roll}</em></b>.`

    if (roll === rollMax)
        text += ` CRITICAL SUCCESS! <a href="#${playerName}-add-${skillName}">Add a new skill</a>.`

    diceElement.innerHTML = text
    diceElement.focus()
}

function renderSkills(playerName, playerChildren, playerHTML) {

    if (playerChildren?.length) {
        playerHTML += '<ul>'
        
        playerChildren.forEach(child => {
            playerHTML += `<li class="control-row">
                <div class="control-row-title">
                    <button onclick="roll('${playerName}','${child.Skill}', ${child.Level})">${child.Level}</button>
                    ${child.Skill}</div>
                <div class="controls">
                    <input id="${playerName}-add-${child.Skill}" type="text" placeholder="Add a skill to ${child.Skill}"/>
                    <button onclick="addSkill('${playerName}', '${child.Skill}')">Add Skill</button>
                </div>
            </li>`
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
                        <h3 class="control-row"><em>${player.XP} XP</em>
                            <div class="controls">
                                <button onclick="addXP('${player.PlayerName}')">+ XP</button>
                                <button onclick="removeXP('${player.PlayerName}')">- XP</button>
                            </div>
                        </h3>
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
}

function init() {
    updateData()   
}
