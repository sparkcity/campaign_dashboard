################################# Imports and Initializations

import pandas as pd
import numpy as np
import panel as pn
import plotly.express as px
import plotly.io as pio
import plotly.graph_objects as go

ACCENT = "#e56c6c"

SUCCESS_SOLID_BUTTON_STYLE = f"""
.bk-btn-success {{
    background-color: var(--accent-foreground-rest, {ACCENT});
}}
.bk-active.bk-btn-success {{
    background-color: var(--accent-foreground-active, {ACCENT});
}}
.bk-btn-success:hover {{
    background-color: var(--accent-foreground-hover, {ACCENT});
}}
"""

pn.extension("plotly", "tabulator", sizing_mode="stretch_width")

# pio.renderers.default = "iframe"

pc_combat_stats_df = pd.DataFrame(
    pd.read_csv(
        "https://raw.githubusercontent.com/sparkcity/campaign_dashboard/main/src/data/starbound_pc_combat_stats.csv"
    )
)
pc_rolls_df = pd.DataFrame(
    pd.read_csv(
        "https://raw.githubusercontent.com/sparkcity/campaign_dashboard/main/src/data/starbound_pc_rolls.csv"
    )
)

pc_color_map = {
    "Sparrow": "#118ab2",
    "Madaine": "#073b4c",
    "Evelyn": "#06d6a0",
    "Pollux": "#ffd166",
    "Trey": "#ef476f",
}

sess_min = (pc_rolls_df["session"].min()).item()
sess_max = (pc_rolls_df["session"].max()).item()

################################# Party Visualizations: Context and Overall Rolls

pv1_fig = px.scatter(
    pc_rolls_df,
    y="roll_total",
    x="roll_base",
    color="pc",
    color_discrete_map=pc_color_map,
    symbol="pc",
    hover_data=["type", "session", "pc"],
    title="Campaign-wide Rolls Per Character",
)
pv1_fig.update_layout(scattermode="group", scattergap=0.50)

pv2_df = (
    pc_rolls_df.groupby(["pc", "context"]).size().unstack(fill_value=0).reset_index()
)

pv2_fig = px.bar(
    pv2_df,
    x="pc",
    y=["Combat", "Exploration", "Social"],
    title="Campaign-wide Rolls Per Character By Context",
)
pv2_fig.update_layout(autosize=True)

party_box = pn.WidgetBox(
    pn.Column(
        pn.Row(pn.pane.Markdown(f"# Party Visualizations")),
        pn.Row(pv1_fig),
        pn.Row(pv2_fig),
    )
)

################################# Party Visualizations: Total Combat Stats Per Character
select_combat_stat = pn.widgets.ToggleGroup(
    name="Combat Stat Selection",
    options=["dmg_taken", "dmg_dealt", "dmg_mitigated", "dmg_healed"],
    behavior="radio",
    value="dmg_taken",
)


def total_combat_stat(cntxt):
    gb = pc_combat_stats_df.groupby("pc").sum().reset_index()

    fig = px.bar(
        gb,
        x="pc",
        y=cntxt,
        color="pc",
        color_discrete_map=pc_color_map,
        title=f"Total Campaign-wide {cntxt} Per Character",
    )
    return fig


def total_combat_stat_per_session(cntxt):
    fig = px.line(
        pc_combat_stats_df,
        x="session",
        y=cntxt,
        color="pc",
        color_discrete_map=pc_color_map,
        markers=True,
        title=f"{cntxt} Per Character Per Session",
    )
    return fig


party_combat_box = pn.WidgetBox(
    pn.Column(
        pn.Row(pn.pane.Markdown(f"# Party Combat Visualizations")),
        pn.Row(select_combat_stat),
        pn.Row(pn.bind(total_combat_stat, select_combat_stat)),
        pn.Row(pn.bind(total_combat_stat_per_session, select_combat_stat)),
        align="start",
        sizing_mode="stretch_width",
    )
)

################################# Individual Visualizations


################################# Layout Template

template = pn.template.FastListTemplate(
    title="Rose's Thorns Roll Statistics",
    sidebar=[
        pn.pane.Markdown("## Dashboard"),
        pn.pane.PNG(
            "https://raw.githubusercontent.com/sparkcity/campaign_dashboard/main/img/thorns_logo.png",
            sizing_mode="scale_both",
        ),
        pn.pane.Markdown(
            f"""Earliest Session Data Available: {sess_min}
             <br/>Latest Session Data Available: {sess_max}"""
        ),
    ],
    main=[pn.Row(party_box), pn.Row(party_combat_box)],
    main_max_width="1000px",
    accent=ACCENT,
    theme_toggle=False,
)
template.servable()
