# Overview
![Python Badge](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue) ![Jupyter Badge](https://img.shields.io/badge/Jupyter-F37626.svg?&style=for-the-badge&logo=Jupyter&logoColor=white) ![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white) ![Plotly](https://img.shields.io/badge/Plotly-%233F4F75.svg?style=for-the-badge&logo=plotly&logoColor=white)

Live: https://sparkcity.github.io/campaign_dashboard/app.html

A dashboard webapp built to display overall statistics related to the ongoing Dungeons & Dragons campaign play in with my friends.



# Datasets

## pc_rolls

| Field      | Description |
| ----------- | ----------- |
| pc | Name of the Player Character |
| session | The session number |
| type | The type of role that was made: Attack, Save, Check|
| context | The context in which the roll was made: Combat, Exploration, Social |
| skill_check | If the roll was a skill check, the Skill it was for for: Acrobatics, Animal Handling, Arcana, Athletics, Deception, History, Insight, Intimidation, Investigation, Medicine, Nature, Perception, Performance, Persuasion, Religion, Sleight of Hand, Stealth, Survival. If not a skill check, then null |
| ability_save | If the roll was an ability save, the Ability it was for: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma. If not an ability save, then null |
| roll_base | The base roll on the dice without any bonuses |
| roll_total | The total of the roll: roll_base + modifiers and bonuses |

## pc_combat_stats

| Field      | Description |
| ----------- | ----------- |
| session | The session number |
| pc | The name of the Player Character |
| level | The level of character |
| dmg_taken | The amount of total damage taken during the combat encounter |
| dmg_healed | The amount of total healing done during the combat encounter |
| dmg_mitigated | The amount of total damage mitigated - through evasion, shield, reactions, features, etc - during the combat encounter |
| combat_id | The combat ID assigned to the encounter in the format of: Session Number - Combat Encounter (14-1 would be the first combat encounter of session 14)|
| atks_success | The amount of total successful attacks |
| atks_fail | The amount of total missed or failed attacks |
| spells_cast | The amount of spells cast through cantrips, leveled spells, or scrolls |