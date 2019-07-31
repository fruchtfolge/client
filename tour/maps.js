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
        'Klicken Sie auf das "Rechteck"-Symbol, um eine neue Fläche einzuzeichnen.',
      params: {
        placement: 'right',
        enableScrolling: false
      }
    },
    {
      target:
        '#map > div.mapboxgl-control-container > div.mapboxgl-ctrl-bottom-left > div:nth-child(1) > button.mapbox-gl-draw_ctrl-draw-btn.mapbox-gl-draw_trash',
      content:
        'Um ein Feld zu löschen, wählen Sie es zunächst durch anklicken auf der Karte aus. Drücken Sie nun das "Papierkorb"-Symbol, um den Schlag zu entfernen',
      params: {
        placement: 'right',
        enableScrolling: false
      }
    },
    {
      target:
        '#map > div.mapboxgl-control-container > div.mapboxgl-ctrl-bottom-left > div:nth-child(1) > button.mapbox-gl-draw_ctrl-draw-btn.mapbox-gl-draw_combine',
      content:
        'Sie können 2 oder mehr Felder zusammenfügen, indem Sie die "strg"-Taste auf Ihrer Tastatur gedrückt halten und mehrere Felder auf der Karte auswählen. Anschließend drücken Sie auf das "Zusammenfügen"-Symbol, um den Vorgang abzuschließen.',
      params: {
        placement: 'right',
        enableScrolling: false
      }
    },
    {
      target: '.sumHa',
      content:
        'Die insgesamt bewirtschaftete Fläche im ausgewählten Wirtschaftsjahr wird Ihnen hier angezeigt',
      params: {
        placement: 'left',
        enableScrolling: false
      }
    },
    {
      target: '.regionText',
      content: 'Ihre Flächen werden nach Bewirtschaftungsregionen eingeteilt. ',
      params: {
        placement: 'left',
        enableScrolling: false
      }
    }
  ]
}
