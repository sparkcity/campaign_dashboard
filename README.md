# Overview
![Python Badge](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue) ![Jupyter Badge](https://img.shields.io/badge/Jupyter-F37626.svg?&style=for-the-badge&logo=Jupyter&logoColor=white)

A dashboard webapp built to display overall statistics related to the ongoing Dungeons & Dragons campaign I run for my friends. May include less detailed statistics (because I'm a player, not the GM) for the campaign I play in.

# Datasets

## combat_per_session

| Field      | Description |
| ----------- | ----------- |
| combatant | Name of the combatant |
| base_stat_block | The unedited base of the stat block before any changes are implemented |
| type | The creature type: aberration, beast, celestial, construct, dragon, elemental, fey, fiend, giant, humanoid, monstrosity, ooze, plant, undead |
| size | The size of the creature: tiny, small, medium, large, huge, gargantuan |
| ac | The Armor Class of the creature |
| hp | The Hit Points of the creature |
| str | The Strength score of the creature |
| dex | The Dexterity score of the creature |
| con | The Constitution score of the creature |
| int | The Intelligence score of the creature |
| wis | The Wisdom score of the creature |
| cha | The Charisma score of the creature |
| cr | The Challenge Rating of the creature |
| session | The session number |
| outcome | The outcome of the combat encounter: death, alive, unconscious, escape |
| hdywtdt | 'How Do You Want to Do This' or the character who landed the final, incapacitating blow on the creature |
| disposition | The disposition of the creature during the combat encounter: ally, enemy, neutral |
| party_level | The party level at the time of the combat encounter |
| party_members | The number of party members present at the combat encounter |
| stat_block_src | The stat block source: sourcebook or homebrew |
| homebrew_src | The source if the stat block was homebrew: Pinterest, Reddit, GMBinder, gm (personal homebrew), etc |

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

## interaction_stats

| Field      | Description |
| ----------- | ----------- |
| session | The session number  |
| level | The level of character |
| pc | The name of the Player Character  |
| skill | The skill or ability being rolled |
| roll_dice | The base dice roll |
| roll_bonus | The sum of any applicable bonuses |
| roll_total | The sum of the base dice rolled and the roll bonuses |
| dc | The Difficulty Class of the check |
| outcome | The outcome of the check: success, failure |
