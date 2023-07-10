importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: "patch",
    patch: patch,
    buffers: buffers,
  });
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({ type: "status", msg: "Loading pyodide" });
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = [
    "markdown-it-py<3",
    "https://cdn.holoviz.org/panel/1.1.0/dist/wheels/bokeh-3.1.1-py3-none-any.whl",
    "https://cdn.holoviz.org/panel/1.1.0/dist/wheels/panel-1.1.0-py3-none-any.whl",
    "pyodide-http==0.2.1",
    "pandas",
    "plotly",
  ];
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith(".whl")) {
      pkg_name = pkg.split("/").slice(-1)[0].split("-")[0];
    } else {
      pkg_name = pkg;
    }
    self.postMessage({ type: "status", msg: `Installing ${pkg_name}` });
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch (e) {
      console.log(e);
      self.postMessage({
        type: "status",
        msg: `Error while installing ${pkg_name}`,
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({ type: "status", msg: "Executing code" });
  const code = `
  
import asyncio

from panel.io.pyodide import init_doc, write_doc

init_doc()

################################# Imports and Initializations
import pandas as pd
import panel as pn
import plotly.express as px

pn.extension("plotly", "tabulator", sizing_mode="stretch_width")

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

combat_df = pd.DataFrame(
    pd.read_csv(
        "https://raw.githubusercontent.com/sparkcity/campaign_dashboard/main/src/data/starbound/starbound_combat.csv"
    )
)
rolls_df = pd.DataFrame(
    pd.read_csv(
        "https://raw.githubusercontent.com/sparkcity/campaign_dashboard/main/src/data/starbound/starbound_rolls.csv"
    )
)
attr_df = pd.DataFrame(
    pd.read_csv(
        "https://raw.githubusercontent.com/sparkcity/campaign_dashboard/main/src/data/starbound/starbound_attr.csv"
    )
)
stats_df = pd.DataFrame(
    pd.read_csv(
        "https://raw.githubusercontent.com/sparkcity/campaign_dashboard/main/src/data/starbound/starbound_pcs.csv"
    )
)

pc_color_map = {
    "Sparrow": "#118ab2",
    "Madaine": "#073b4c",
    "Evelyn": "#06d6a0",
    "Pollux": "#ffd166",
    "Trey": "#ef476f",
}

sess_min = (rolls_df["session"].min()).item()
sess_max = (rolls_df["session"].max()).item()

################################# Party Visualizations: Context and Overall Rolls

party_dist_df = rolls_df["roll_base"].value_counts()
reset_party_dist_df = party_dist_df.reset_index()
party_dist_fig = px.bar(
    reset_party_dist_df,
    x="roll_base",
    y="index",
    color="index",
    title="Party Rolls Distribution",
)
party_dist_fig.update_xaxes(tickmode="linear")

party_context_df = (
    rolls_df.groupby(["pc", "context"]).size().unstack(fill_value=0).reset_index()
)
party_context_fig = px.bar(
    party_context_df,
    x="pc",
    y=["Combat", "Exploration", "Social"],
    title="All Rolls Per Character By Context",
)
party_context_fig.update_layout(autosize=True)

party_box = pn.WidgetBox(
    pn.Column(
        pn.Row(pn.pane.Markdown(f"# Party Visualizations")),
        pn.Row(party_dist_fig),
        pn.Row(party_context_fig),
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
    gb = combat_df.groupby("pc").sum().reset_index()

    fig = px.bar(
        gb,
        x="pc",
        y=cntxt,
        color="pc",
        color_discrete_map=pc_color_map,
        title=f"Total {cntxt} Per Character",
    )
    return fig


def total_combat_stat_per_session(cntxt):
    fig = px.line(
        combat_df,
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

select_pc = pn.widgets.ToggleGroup(
    name="Combat Stat Selection",
    options=["Sparrow", "Madaine", "Trey", "Pollux", "Evelyn"],
    behavior="radio",
    value="Sparrow",
)


def stat_radar(nm):
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


def pc_sum(nm):
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


def attr_radar(nm):
    df = attr_df.loc[stats_df["pc"] == nm]
    pc_r = [
        df["acrobatics"].item(),
        df["animal_handling"].item(),
        df["arcana"].item(),
        df["athletics"].item(),
        df["deception"].item(),
        df["history"].item(),
        df["insight"].item(),
        df["intimidation"].item(),
        df["investigation"].item(),
        df["medicine"].item(),
        df["nature"].item(),
        df["perception"].item(),
        df["performance"].item(),
        df["persuasion"].item(),
        df["religion"].item(),
        df["sleight_of_hand"].item(),
        df["stealth"].item(),
        df["survival"].item(),
    ]

    pc_theta = [
        "acrobatics",
        "animal_handling",
        "arcana",
        "athletics",
        "deception",
        "history",
        "insight",
        "intimidation",
        "investigation",
        "medicine",
        "nature",
        "perception",
        "performance",
        "persuasion",
        "religion",
        "sleight_of_hand",
        "stealth",
        "survival",
    ]

    fig = px.scatter_polar(df, title="Skill Bonuses", r=pc_r, theta=pc_theta)
    fig.update_traces(fill="toself")
    return fig


ind_box = pn.WidgetBox(
    pn.Column(
        pn.Row(pn.pane.Markdown(f"# Individual Visualizations")),
        pn.Row(select_pc),
        pn.Row(pn.bind(pc_sum, select_pc), pn.bind(stat_radar, select_pc)),
        pn.Row(pn.bind(attr_radar, select_pc)),
        align="start",
        sizing_mode="stretch_width",
    )
)

################################# Layout Template

template = pn.template.FastListTemplate(
    title="Rose's Thorns Campaign Visualizations",
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
    main=[pn.Row(party_box), pn.Row(party_combat_box), pn.Row(ind_box)],
    main_max_width="1000px",
    accent=ACCENT,
    theme_toggle=False,
)
template.servable()


await write_doc()
  `;

  try {
    const [docs_json, render_items, root_ids] =
      await self.pyodide.runPythonAsync(code);
    self.postMessage({
      type: "render",
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids,
    });
  } catch (e) {
    const traceback = `${e}`;
    const tblines = traceback.split("\n");
    self.postMessage({
      type: "status",
      msg: tblines[tblines.length - 2],
    });
    throw e;
  }
}

self.onmessage = async (event) => {
  const msg = event.data;
  if (msg.type === "rendered") {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `);
  } else if (msg.type === "patch") {
    self.pyodide.globals.set("patch", msg.patch);
    self.pyodide.runPythonAsync(`
    state.curdoc.apply_json_patch(patch.to_py(), setter='js')
    `);
    self.postMessage({ type: "idle" });
  } else if (msg.type === "location") {
    self.pyodide.globals.set("location", msg.location);
    self.pyodide.runPythonAsync(`
    import json
    from panel.io.state import state
    from panel.util import edit_readonly
    if state.location:
        loc_data = json.loads(location)
        with edit_readonly(state.location):
            state.location.param.update({
                k: v for k, v in loc_data.items() if k in state.location.param
            })
    `);
  }
};

startApplication();
