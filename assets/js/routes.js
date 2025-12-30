export default [
  {
    path: '/',
    name: 'LOGOUT',
    icon: 'static/home.png'
  },
  {
    path: '/settings',
    name: 'EINSTELLUNGEN',
    icon: 'static/settings.png',
    help: "https://fruchtfolge.agp.uni-bonn.de/documentation/guide/import.html#automatischer-import",
    helpText: "Hilfe zum Datenimport"
  },
  {
    path: '/maps',
    name: 'SCHLÄGE',
    file: 'maps',
    icon: 'static/plots.png',
    help: "https://fruchtfolge.agp.uni-bonn.de/documentation/guide/plots.html#ubersicht",
    helpText: "Hilfe zum einzeichnen und bearbeiten von Schlägen"
  },
  {
    subPage: true,
    path: '/maps',
    name: 'Karte',
    file: 'maps',
    icon: 'static/plots.png',
    help: "https://fruchtfolge.agp.uni-bonn.de/documentation/guide/plots.html#ubersicht",
    helpText: "Hilfe zum einzeichnen und bearbeiten von Schlägen"
  },
  {
    subPage: true,
    path: '/plot-overview',
    name: 'Übersicht',
    file: 'plotsTable',
    icon: 'static/plots.png',
    help: "https://fruchtfolge.agp.uni-bonn.de/documentation/guide/plots.html#bodenqualitat-und-weitere-eigenschaften",
    helpText: "Hilfe zur Schlagübersicht"
  },
  {
    subPage: true,
    path: '/plots-previous-crops',
    name: 'Vorfrüchte',
    file: 'plotsTable',
    icon: 'static/plots.png',
    help: "https://fruchtfolge.agp.uni-bonn.de/documentation/guide/plots.html#vorfruchte",
    helpText: "Hilfe zur Eingabe von Vorfrüchten"
  },
  {
    path: '/crops',
    name: 'KULTUREN',
    icon: 'static/crops.png',
    help: "https://fruchtfolge.agp.uni-bonn.de/documentation/guide/crops.html#deckungsbeitrag",
    helpText: "Hilfe zur Anpassung von Deckungsbeiträgen"
  },
  {
    subPage: true,
    path: '/crops',
    name: 'Deckungsbeiträge',
    icon: 'static/crops.png',
    help: "https://fruchtfolge.agp.uni-bonn.de/documentation/guide/crops.html#deckungsbeitrag",
    helpText: "Hilfe zur Anpassung von Deckungsbeiträgen"
  },
  {
    subPage: true,
    path: '/timeseries',
    name: 'Marktentwicklung',
    icon: 'static/crops.png',
    help: "https://fruchtfolge.agp.uni-bonn.de/documentation/guide/crops.html#marktentwicklung",
    helpText: "Hilfe zur Anpassung von Zeitreihendaten"
  },
  {
    subPage: true,
    path: '/crop-labour-requirement',
    name: 'Arbeitszeitbedarf',
    icon: 'static/crops.png',
    help: "https://fruchtfolge.agp.uni-bonn.de/documentation/guide/crops.html#arbeitszeitbedarf",
    helpText: "Hilfe zur Anpassung der Arbeitszeitbedarfe"
  },
  {
    subPage: true,
    path: '/crop-settings',
    name: 'Eigenschaften',
    icon: 'static/crops.png',
    help: "https://fruchtfolge.agp.uni-bonn.de/documentation/guide/crops.html#wirkung-auf-nachfruchte",
    helpText: "Hilfe zur Anpassung der Kultureigenschaften"
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
    subPage: true,
    path: '/organic-fert',
    name: 'Dunganfall',
    icon: 'static/crops.png'
  },
  {
    subPage: true,
    path: '/plots-planned-crops',
    name: 'Planung',
    icon: 'static/crops.png'
  },
  {
    path: '/results',
    name: 'ERGEBNISSE',
    icon: 'static/results.png'
  },
  {
    subPage: true,
    path: '/results',
    name: 'Anbauplanung',
    icon: 'static/results.png'
  },
  {
    subPage: true,
    path: '/n-fertilizer-planning',
    name: 'N-Düngebedarf',
    icon: 'static/fertPlanning.png'
  },
  {
    subPage: true,
    path: '/p-fertilizer-planning',
    name: 'P-Düngebedarf',
    icon: 'static/fertPlanning.png'
  }
]
