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

pio.renderers.default = "iframe"

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

select_context = pn.widgets.RadioButtonGroup(
    name="Context Selection",
    options=["Combat", "Exploration", "Social"],
    value="Combat",
    button_type="success",
    stylesheets=[SUCCESS_SOLID_BUTTON_STYLE],
)


def total_contextual_fig(cntxt):
    pv1_df = (
        pc_rolls_df.groupby(["pc", "context"])
        .size()
        .unstack(fill_value=0)
        .reset_index()
    )

    pv1_fig = px.pie(
        pv1_df,
        values=cntxt,
        names="pc",
        color="pc",
        color_discrete_map=pc_color_map,
        title=f"Total Campaign-wide {cntxt} Rolls Per Character",
    )
    pv1_fig.update_layout(autosize=True)
    return pv1_fig


pv2_fig = px.scatter(
    pc_rolls_df,
    y="roll_total",
    x="session",
    color="pc",
    color_discrete_map=pc_color_map,
    symbol="pc",
    hover_data=["type", "session", "pc"],
    title="All Campaign-wide Rolls Per Character",
)
pv2_fig.update_layout(scattermode="group", scattergap=0.50)

party_box = pn.WidgetBox(
    pn.pane.Markdown(f"# Party Visualizations"),
    select_context,
    pn.panel(pn.bind(total_contextual_fig, select_context), margin=(10, 2, 10, 5)),
)

################################# Party Visualizations: Total Combat Stats Per Character
select_combat_stat = pn.widgets.Select(
    name="Combat Stat Selection",
    options=["dmg_taken", "dmg_dealt", "dmg_mitigated", "dmg_healed"],
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
    pn.Row(pn.pane.Markdown(f"# Party Combat Visualizations")),
    pn.Row(select_combat_stat),
    pn.Row(
        pn.bind(total_combat_stat, select_combat_stat),
        pn.bind(total_combat_stat_per_session, select_combat_stat),
    ),
)

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
