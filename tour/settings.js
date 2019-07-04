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
        'In den oberen 3 Eingabefeldern können Sie Ihre Betriebsadresse anpassen. Die Änderungen werden beim tippen automatisch gespeichert.'
    },
    {
      target: '#zid-pw',
      content:
        'In den oberen 3 Eingabefeldern können Sie Ihre Betriebsadresse anpassen. Die Änderungen werden beim tippen automatisch gespeichert.',
      params: {
        placement: 'bottom'
      }
    }
  ]
}
