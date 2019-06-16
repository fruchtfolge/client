export default [
  {
    path: '/',
    name: 'LOGOUT',
    icon: 'fas fa-sign-out-alt'
  },
  {
    path: '/settings',
    name: 'EINSTELLUNGEN',
    icon: 'far fa-user'
  },
  {
    path: '/maps',
    name: 'SCHLÄGE',
    file: 'maps',
    icon: 'far fa-map'
  },
  {
    subPage: true,
    path: '/maps',
    name: 'Karte',
    file: 'maps',
    icon: ''
  },
  {
    subPage: true,
    path: '/plot-overview',
    name: 'Tabelle',
    file: 'plotsTable',
    icon: ''
  },
  {
    subPage: true,
    path: '/plots-previous-crops',
    name: 'Vorfrüchte',
    file: 'plotsTable',
    icon: ''
  },
  {
    path: '/crops',
    name: 'KULTUREN',
    icon: 'fas fa-seedling'
  },
  {
    subPage: true,
    path: '/crops',
    name: 'Deckungsbeiträge',
    icon: ''
  },
  {
    subPage: true,
    path: '/timeseries',
    name: 'Marktentwicklung',
    icon: ''
  },
  {
    subPage: true,
    path: '/crop-labour-requirement',
    name: 'Arbeitsbedarf',
    icon: ''
  },
  {
    subPage: true,
    path: '/crop-settings',
    name: 'Eigenschaften',
    icon: ''
  },
  {
    path: '/constraints',
    name: 'NEBENBEDINGUNGEN',
    icon: 'far fa-clipboard'
  },
  {
    subPage: true,
    path: '/constraints',
    name: 'Anbaurestriktionen',
    icon: ''
  },
  {
    subPage: true,
    path: '/labour',
    name: 'Arbeitszeiten',
    icon: ''
  },
  {
    path: '/results',
    name: 'ERGEBNISSE',
    icon: 'fas fa-chart-line'
  }
  /*
  {
    subPage: true,
    path: '/fertilizer-planning',
    name: 'N-Düngeplanung',
    icon: 'static/fertPlanning.png'
  }
  */
]
