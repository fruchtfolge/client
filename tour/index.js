export default {
  options: {
    useKeyboardNavigation: false,
    labels: {
      buttonSkip: 'Tour überspringen',
      buttonPrevious: 'Zurück',
      buttonNext: 'Vor',
      buttonStop: 'Ende'
    }
  },
  steps: [
    {
      target: '#email',
      content:
        "Try it, you'll love it!<br>You can put HTML in the steps and completely customize the DOM to suit your needs.",
      params: {
        placement: 'top'
      }
    }
  ]
}
