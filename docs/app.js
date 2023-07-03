importScripts("https://cdn.jsdelivr.net/pyodide/v0.23.0/full/pyodide.js");

function sendPatch(patch, buffers, msg_id) {
  self.postMessage({
    type: 'patch',
    patch: patch,
    buffers: buffers
  })
}

async function startApplication() {
  console.log("Loading pyodide!");
  self.postMessage({type: 'status', msg: 'Loading pyodide'})
  self.pyodide = await loadPyodide();
  self.pyodide.globals.set("sendPatch", sendPatch);
  console.log("Loaded!");
  await self.pyodide.loadPackage("micropip");
  const env_spec = ['markdown-it-py<3', 'https://cdn.holoviz.org/panel/1.1.0/dist/wheels/bokeh-3.1.1-py3-none-any.whl', 'https://cdn.holoviz.org/panel/1.1.0/dist/wheels/panel-1.1.0-py3-none-any.whl', 'pyodide-http==0.2.1', 'numpy', 'pandas', 'plotly']
  for (const pkg of env_spec) {
    let pkg_name;
    if (pkg.endsWith('.whl')) {
      pkg_name = pkg.split('/').slice(-1)[0].split('-')[0]
    } else {
      pkg_name = pkg
    }
    self.postMessage({type: 'status', msg: `Installing ${pkg_name}`})
    try {
      await self.pyodide.runPythonAsync(`
        import micropip
        await micropip.install('${pkg}');
      `);
    } catch(e) {
      console.log(e)
      self.postMessage({
	type: 'status',
	msg: `Error while installing ${pkg_name}`
      });
    }
  }
  console.log("Packages loaded!");
  self.postMessage({type: 'status', msg: 'Executing code'})
  const code = `
  
import asyncio

from panel.io.pyodide import init_doc, write_doc

init_doc()

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


await write_doc()
  `

  try {
    const [docs_json, render_items, root_ids] = await self.pyodide.runPythonAsync(code)
    self.postMessage({
      type: 'render',
      docs_json: docs_json,
      render_items: render_items,
      root_ids: root_ids
    })
  } catch(e) {
    const traceback = `${e}`
    const tblines = traceback.split('\n')
    self.postMessage({
      type: 'status',
      msg: tblines[tblines.length-2]
    });
    throw e
  }
}

self.onmessage = async (event) => {
  const msg = event.data
  if (msg.type === 'rendered') {
    self.pyodide.runPythonAsync(`
    from panel.io.state import state
    from panel.io.pyodide import _link_docs_worker

    _link_docs_worker(state.curdoc, sendPatch, setter='js')
    `)
  } else if (msg.type === 'patch') {
    self.pyodide.globals.set('patch', msg.patch)
    self.pyodide.runPythonAsync(`
    state.curdoc.apply_json_patch(patch.to_py(), setter='js')
    `)
    self.postMessage({type: 'idle'})
  } else if (msg.type === 'location') {
    self.pyodide.globals.set('location', msg.location)
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
    `)
  }
}

startApplication()