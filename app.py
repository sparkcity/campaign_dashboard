##############################################################################
#                              Imports and Initializations                   #
##############################################################################
import pandas as pd
import numpy as np
import panel as pn
import plotly.express as px
import plotly.io as pio
import plotly.graph_objects as go
from plotly.subplots import make_subplots

pn.extension('tabulator')
pn.extension()
pio.renderers.default='iframe'

pc_combat_stats_df = pd.DataFrame(pd.read_excel('data/starbound_data.xlsx',
                                                   sheet_name='pc_combat_stats'))

pc_rolls_df = pd.DataFrame(pd.read_excel('data/starbound_data.xlsx',
                                                   sheet_name='pc_rolls'))

pc_color_map = {'Sparrow':'#118ab2',
                'Madaine':'#073b4c',
                'Evelyn':'#06d6a0',
                'Pollux':'#ffd166',
                'Trey':'#ef476f'}

##############################################################################
#                         Party Visualization 1, 8, 9                        #
##############################################################################

pv1_df = pc_rolls_df.groupby(['pc','context']).size().unstack(fill_value=0).reset_index()

pv1_fig = px.pie(pv1_df, values='Combat',
                 names= 'pc', 
                 color='pc',
                 color_discrete_map = pc_color_map,
                 title = 'Total Campaign Combat Rolls Per Character')

pv8_fig = px.pie(pv1_df, values='Exploration',
                 names= 'pc', 
                 color='pc',
                 color_discrete_map = pc_color_map,
                 title = 'Total Campaign Exploration Rolls Per Character')

pv9_fig = px.pie(pv1_df, values='Social',
                 names= 'pc', 
                 color='pc',
                 color_discrete_map = pc_color_map,
                 title = 'Total Campaign Social Rolls Per Character')

##############################################################################
#                         Party Visualization 2                              #
##############################################################################

pv2_fig = px.scatter(pc_rolls_df,
                   y='roll_total',
                   x='session',
                   color='pc',
                   color_discrete_map = pc_color_map,
                   symbol='pc',
                   hover_data=['type','session','pc'],
                   title="All Rolls Per Character Across Campaign")
pv2_fig.update_layout(scattermode="group", scattergap=0.50)

sess_min = (pc_rolls_df['session'].min()).item()
sess_max = (pc_rolls_df['session'].max()).item()

##############################################################################
#                         Party Visualization 3, 10, 11, 12                  #
##############################################################################

pv3_gb = pc_combat_stats_df.groupby('pc').sum().reset_index()

pv3_fig = px.bar(pv3_gb,
                 x='pc',
                 y='dmg_taken',
                 color='pc',
                 color_discrete_map = pc_color_map,
                 title='Total Damage Taken Campaign Wide Per Character')

pv10_fig = px.bar(pv3_gb,
                 x='pc',
                 y='dmg_dealt',
                 color='pc',
                 color_discrete_map = pc_color_map,
                 title='Total Damage Dealt Campaign Wide Per Character')

pv11_fig = px.bar(pv3_gb,
                 x='pc',
                 y='dmg_healed',
                 color='pc',
                 color_discrete_map = pc_color_map,
                 title='Total Healing Done Campaign Wide Per Character')

pv12_fig = px.bar(pv3_gb,
                 x='pc',
                 y='dmg_mitigated',
                 color='pc',
                 color_discrete_map = pc_color_map,
                 title='Total Damage Mitigated Campaign Wide Per Character')

##############################################################################
#                         Party Visualization 4 - 7                          #
##############################################################################

pv4_fig = px.line(pc_combat_stats_df,
                  x='session',
                  y='dmg_dealt',
                  color='pc',
                  color_discrete_map = pc_color_map,
                  markers=True,
                  title='Total Damage Dealt Per Character Per Session')

pv5_fig = px.line(pc_combat_stats_df,
                  x='session',
                  y='dmg_taken',
                  color='pc',
                  color_discrete_map = pc_color_map,
                  markers=True,
                  title='Total Damage Taken Per Character Per Session')

pv6_fig = px.line(pc_combat_stats_df,
                  x='session',
                  y='dmg_mitigated',
                  color='pc',
                  color_discrete_map = pc_color_map,
                  markers=True,
                  title='Total Damage Mitigated Per Character Per Session')

pv7_fig = px.line(pc_combat_stats_df,
                  x='session',
                  y='dmg_healed',
                  color='pc',
                  color_discrete_map = pc_color_map,
                  markers=True,
                  title='Total Healing Done Per Character Per Session')

##############################################################################
#                         Layout Template                                    #
##############################################################################

template = pn.template.FastListTemplate(
    title='Rose\'s Thorns Roll Statistics', 
    sidebar=[pn.pane.Markdown("Dashboard"), 
             pn.pane.PNG('img/thorns_logo.png', sizing_mode='scale_both'),
             pn.pane.Markdown(f"""Earliest Session Data Available: {sess_min}
             <br/>Latest Session Data Available: {sess_max}""")
             ],
    main=[pn.Row(pv2_fig,pv1_fig),
          pn.Row(pv8_fig,pv9_fig),
          pn.Row(pv3_fig,pv10_fig),
          pn.Row(pv11_fig,pv12_fig),
          pn.Row(pv4_fig,pv5_fig),
          pn.Row(pv6_fig,pv7_fig)],
    accent_base_color="#88d8b0",
    header_background="#88d8b0",
)
template.show()
template.servable()