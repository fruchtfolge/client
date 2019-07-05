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
      target: '#settings-city',
      content:
        'In den oberen 3 Eingabefeldern können Sie Ihre Betriebsadresse anpassen. Die Änderungen werden beim tippen automatisch gespeichert',
      params: {
        enableScrolling: false
      }
    },
    {
      target: '#zid',
      content:
        'Sie können Ihre Betriebsdaten importieren, indem Sie Ihrer ZID-Nummer und PIN eingeben und abschlißend auf den Button "Absenden" drücken',
      params: {
        placement: 'top',
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
