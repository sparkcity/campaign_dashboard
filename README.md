# Overview

![Python Badge](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue) ![Jupyter Badge](https://img.shields.io/badge/Jupyter-F37626.svg?&style=for-the-badge&logo=Jupyter&logoColor=white) ![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white) ![Plotly](https://img.shields.io/badge/Plotly-%233F4F75.svg?style=for-the-badge&logo=plotly&logoColor=white)

Static Github Pages Deployment: https://sparkcity.github.io/campaign_dashboard/app.html
Full Heroku Deployment: https://campaign-dashboard-5fce31c398a9.herokuapp.com/

A dashboard webapp built to display data visualizations related to the ongoing Dungeons & Dragons campaign I play in with my friends.

![Screenshot](https://raw.githubusercontent.com/sparkcity/campaign_dashboard/main/img/dashboard_ss.png)

# Datasets

## starbound_pcs.csv

| Field | Description                                                                       |
| ----- | --------------------------------------------------------------------------------- |
| pc    | The name of the Player Character                                                  |
| lvl   | The level of character                                                            |
| race  | The race of the character: Human, Tiefling, Changeling, Triton, Elf, Aasimar, etc |
| str   | The character's total Strength score                                              |
| dex   | The character's total Dexterity score                                             |
| con   | The character's total Constitution score                                          |
| int   | The character's total Intelligence score                                          |
| wis   | The character's total Wisdom score                                                |
| cha   | The character's total Charisma score                                              |

## starbound_attr.csv

| Field           | Description                                       |
| --------------- | ------------------------------------------------- |
| pc              | The name of the Player Character                  |
| lvl             | The level of character                            |
| acrobatics      | The character's total Acrobatics skill bonus      |
| animal_handling | The character's total Animal Handling skill bonus |
| arcana          | The character's total Arcana skill bonus          |
| athletics       | The character's total Athletics skill bonus       |
| deception       | The character's total Deception skill bonus       |
| history         | The character's total History skill bonus         |
| insight         | The character's total Insight skill bonus         |
| intimidation    | The character's total Intimidation skill bonus    |
| investigation   | The character's total Investigation skill bonus   |
| medicine        | The character's total Medicine skill bonus        |
| nature          | The character's total Nature skill bonus          |
| perception      | The character's total Perception skill bonus      |
| performance     | The character's total Performance skill bonus     |
| persuasion      | The character's total Persuasion skill bonus      |
| religion        | The character's total Religion skill bonus        |
| sleight_of_hand | The character's total Sleight of Hand skill bonus |
| stealth         | The character's total Stealth skill bonus         |
| survival        | The character's total Survival skill bonus        |

## starbound_pc_rolls.csv

| Field        | Description                                                                                                                                                                                                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pc           | Name of the Player Character                                                                                                                                                                                                                                                                            |
| session      | The session number                                                                                                                                                                                                                                                                                      |
| type         | The type of role that was made: Attack, Save, Check                                                                                                                                                                                                                                                     |
| context      | The context in which the roll was made: Combat, Exploration, Social                                                                                                                                                                                                                                     |
| skill_check  | If the roll was a skill check, the Skill it was for for: Acrobatics, Animal Handling, Arcana, Athletics, Deception, History, Insight, Intimidation, Investigation, Medicine, Nature, Perception, Performance, Persuasion, Religion, Sleight of Hand, Stealth, Survival. If not a skill check, then null |
| ability_save | If the roll was an ability save, the Ability it was for: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma. If not an ability save, then null                                                                                                                                           |
| roll_base    | The base roll on the dice without any bonuses                                                                                                                                                                                                                                                           |
| roll_total   | The total of the roll: roll_base + modifiers and bonuses                                                                                                                                                                                                                                                |

## starbound_pc_combat_stats.csv

| Field         | Description                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| session       | The session number                                                                                                                                   |
| pc            | The name of the Player Character                                                                                                                     |
| level         | The level of character                                                                                                                               |
| dmg_taken     | The amount of total damage taken during the combat encounter                                                                                         |
| dmg_healed    | The amount of total healing done during the combat encounter                                                                                         |
| dmg_mitigated | The amount of total damage mitigated - through evasion, shield, reactions, features, etc - during the combat encounter                               |
| combat_id     | The combat ID assigned to the encounter in the format of: Session Number - Combat Encounter (14-1 would be the first combat encounter of session 14) |
| atks_success  | The amount of total successful attacks                                                                                                               |
| atks_fail     | The amount of total missed or failed attacks                                                                                                         |
| spells_cast   | The amount of spells cast through cantrips, leveled spells, or scrolls                                                                               |
