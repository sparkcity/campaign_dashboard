import pandas as pd
import panel as pn
import plotly.express as px


def stat_radar(nm, stats_df):
    df = stats_df.loc[stats_df["pc"] == nm]
    pc_r = [
        df["str"].item(),
        df["dex"].item(),
        df["con"].item(),
        df["int"].item(),
        df["wis"].item(),
        df["cha"].item(),
    ]
    pc_theta = ["str", "dex", "con", "int", "wis", "cha"]

    fig = px.scatter_polar(df, title="Stats", r=pc_r, theta=pc_theta)
    fig.update_traces(fill="toself")
    return fig


def pc_sum(nm, stats_df, combat_df):
    df = stats_df.loc[stats_df["pc"] == nm]
    c_df = combat_df.loc[combat_df["pc"] == nm]

    lvl = df["lvl"].item()
    rc = df["race"].item()
    cls = df["class"].item()
    arctps = df["archetypes"].item()

    if type(arctps) == float:
        description = f"{nm} is a level {lvl} {rc} {cls} with no Archetypes."
    else:
        description = f"{nm} is a level {lvl} {rc} {cls} with Archetypes in {arctps}."

    mx_dmg_dlt = c_df.loc[c_df["dmg_dealt"].idxmax()]
    dmg_dlt = f"{mx_dmg_dlt['dmg_dealt']} damage dealt in Session {mx_dmg_dlt['session']}. </br> Combat encounter summary: {mx_dmg_dlt['combat_blurb']}"
    mx_dmg_tkn = c_df.loc[c_df["dmg_taken"].idxmax()]
    dmg_tkn = f"{mx_dmg_tkn['dmg_taken']} damage taken in Session {mx_dmg_tkn['session']}. </br> Combat encounter summary: {mx_dmg_tkn['combat_blurb']}"
    mx_dmg_mtg = c_df.loc[c_df["dmg_mitigated"].idxmax()]
    dmg_mtg = f"{mx_dmg_mtg['dmg_mitigated']} damage mitigated in Session {mx_dmg_mtg['session']}. </br> Combat encounter summary: {mx_dmg_mtg['combat_blurb']}"
    mx_dmg_hld = c_df.loc[c_df["dmg_mitigated"].idxmax()]
    dmg_hld = f"{mx_dmg_hld['dmg_healed']} damage healed in Session {mx_dmg_hld['session']}. </br> Combat encounter summary: {mx_dmg_hld['combat_blurb']}"
    other = f"Total Successful Attacks: {c_df['atks_success'].sum()} </br> Total Failed Attacks: {c_df['atks_fail'].sum()} </br> Total Spells Cast: {c_df['spells_cast'].sum()} </br>Total Final Blows: {c_df['final_blows'].sum()}"

    pane = pn.pane.Markdown(
        f"""
        # Character Highlights: {nm}
        | Category      | Info |
        | ----------- | ----------- |
        | **Description**| {description}|
        | **Most Damage Dealt** | {dmg_dlt}|
        | **Most Damage Taken**| {dmg_tkn}|
        | **Most Damage Mitigated**|{dmg_mtg}|
        | **Most Damage Healed**|{dmg_hld}|
        | **Other**| {other} |
        """
    )
    return pane
