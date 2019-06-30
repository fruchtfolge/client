module.exports = [
  {
    path: '/',
    name: 'LOGOUT',
    icon: 'static/home.png'
  },
  {
    path: '/settings',
    name: 'EINSTELLUNGEN',
    icon: 'static/settings.png'
  },
  {
    path: '/maps',
    name: 'SCHLÄGE',
    file: 'maps',
    icon: 'static/plots.png'
  },
  {
    subPage: true,
    path: '/maps',
    name: 'Karte',
    file: 'maps',
    icon: 'static/plots.png'
  },
  {
    subPage: true,
    path: '/plot-overview',
    name: 'Übersicht',
    file: 'plotsTable',
    icon: 'static/plots.png'
  },
  {
    subPage: true,
    path: '/plots-previous-crops',
    name: 'Vorfrüchte',
    file: 'plotsTable',
    icon: 'static/plots.png'
  },
  {
    path: '/crops',
    name: 'KULTUREN',
    icon: 'static/crops.png'
  },
  {
    subPage: true,
    path: '/crops',
    name: 'Deckungsbeiträge',
    icon: 'static/crops.png'
  },
  {
    subPage: true,
    path: '/timeseries',
    name: 'Marktentwicklung',
    icon: 'static/crops.png'
  },
  {
    subPage: true,
    path: '/crop-labour-requirement',
    name: 'Arbeitsbedarf',
    icon: 'static/crops.png'
  },
  {
    subPage: true,
    path: '/crop-settings',
    name: 'Eigenschaften',
    icon: 'static/crops.png'
  },
  {
    path: '/constraints',
    name: 'NEBENBEDINGUNGEN',
    icon: 'static/constraints.png'
  },
  {
    subPage: true,
    path: '/constraints',
    name: 'Anbaurestriktionen',
    icon: 'static/constraints.png'
  },
  {
    subPage: true,
    path: '/labour',
    name: 'Arbeitszeiten',
    icon: 'static/constraints.png'
  },
  {
    path: '/results',
    name: 'ERGEBNISSE',
    icon: 'static/results.png'
  },
  {
    subPage: true,
    path: '/fertilizer-planning',
    name: 'N-Düngeplanung',
    icon: 'static/fertPlanning.png'
  }
]
