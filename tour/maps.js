export default {
  options: {
    useKeyboardNavigation: false,
    labels: {
      buttonSkip: 'ÜBERSPRINGEN',
      buttonPrevious: 'ZURÜCK',
      buttonNext: 'VOR',
      buttonStop: 'ENDE'
    }
  },
  steps: [
    {
      target:
        '#map > div.mapboxgl-control-container > div.mapboxgl-ctrl-bottom-left > div:nth-child(1) > button.mapbox-gl-draw_ctrl-draw-btn.mapbox-gl-draw_polygon',
      content:
        'Klicken Sie auf dieses Symbol, um eine neue Fläche einzuzeichnen. Schließen Sie die Zeichnung ab, indem Sie wieder auf den zuerst gezeichneten Punkt des Felds klicken',
      params: {
        placement: 'right',
        enableScrolling: false
      }
    },
    {
      target:
        '#map > div.mapboxgl-control-container > div.mapboxgl-ctrl-bottom-left > div:nth-child(1) > button.mapbox-gl-draw_ctrl-draw-btn.mapbox-gl-draw_trash',
      content:
        'Sie können ein Feld löschen, indem Sie es in der Karte zunächst anklicken, und anschließend dieses Symbol klicken',
      params: {
        enableScrolling: false
      }
    },
    {
      target: '#xml',
      content:
        'Alternativ können Sie auch die Antragsdaten aus dem <a href="https://www.lwk-verfahren.de/DownloadPortal/pages/index.action">NRW-Downloadportal</a> oder aus <a href="https://www.topfarmplan.de/elan-flaechenantrag-ackerschlagkartei-flaechenimport/#nrw">ELAN-NRW</a> hochladen',
      params: {
        placement: 'top',
        enableScrolling: false
      }
    },
    {
      target: '#delete-btn',
      content:
        'Vor dem Import empfiehlt es sich, Daten die Sie zu Testzwecken angelegt haben (z.B. Flächen oder Kulturen) zu löschen',
      params: {
        placement: 'top',
        enableScrolling: false
      }
    }
  ]
}
