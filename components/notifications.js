export default {
  // default notifications
  saveSuccess: {
    title: 'GESPEICHERT',
    message: 'Die Änderungen wurden erfolgreich gespeichert.',
    type: 'success'
  },
  saveError: {
    title: 'FEHLER',
    message:
      'Die Änderungen konnten nicht gespeichert werden. Probieren Sie es zu einem späteren Zeitpunkt noch einmal.',
    type: 'error'
  },
  showError: {
    title: 'FEHLER',
    message: 'Ein unbekannter Fehler ist aufgetreten.',
    type: 'error'
  },
  noNumber: {
    title: 'FEHLER',
    message: 'Der eingegebene Wert ist keine Zahl.',
    type: 'error'
  },
  // maps page
  showPlotSucc: {
    title: 'SCHLAG HINZUGEFÜGT',
    message: 'Der Schlag wurde gespeichert.',
    type: 'success'
  },
  showPlotErr: {
    title: 'FEHLER',
    message: 'Beim Hinzufügen des Schlags ist ein Fehler aufgetreten.',
    type: 'error'
  },
  showAddressWarn: {
    title: 'ADRESSE UNVOLLSTÄNDIG',
    message: 'Bitte füllen Sie das Adressfeld komplett aus.',
    type: 'warn'
  },
  showPlotRemoveSucc: {
    title: 'SCHLAG ENTFERNT',
    message: 'Schlag wurde erfolgreich entfernt.',
    type: 'success'
  },
  // crops pages
  showCropSucc: {
    title: 'KULTUR HINZUGEFÜGT',
    message: 'Die Kultur wurde gespeichert.',
    type: 'success'
  },
  showCropErr: {
    title: 'FEHLER',
    message: 'Beim Hinzufügen der Kultur ist ein Fehler aufgetreten.',
    type: 'error'
  },
  showCropRemoveSucc: {
    title: 'KULTUR ENTFERNT',
    message: 'Kultur wurde erfolgreich entfernt.',
    type: 'success'
  },
  // landing (index) page
  incomplete: {
    title: 'UNVOLLSTÄNDIG',
    message: 'Bitte füllen Sie zur Anmeldung alle Felder aus.',
    type: 'warn'
  },
  noDSGVO: {
    title: 'NUTZUNGSBEDINGUNG',
    message:
      'Für die Nutzung der Anwendung müssen Sie den Nutzungsbedingungen und der Cookies-Richtlinie zustimmen.',
    type: 'warn'
  },
  notMatching: {
    title: 'PASSWORT ÜBEREINSTIMMUNG',
    message: 'Die Passwörter stimmen nicht überein.',
    type: 'warn'
  },
  loginError: {
    title: 'FEHLER',
    message: 'Beim Login ist ein Fehler aufgetreten.',
    type: 'error'
  },
  loginSuccess: {
    title: 'WILLKOMMEN',
    message:
      'Schön, dass Sie wieder da sind! Bitte haben Sie einen Augeblick geduld, während Ihre Daten synchronisiert werden.',
    type: 'success'
  },
  signupSuccess: {
    title: 'WILLKOMMEN',
    message:
      'Importieren Sie unter dem Punkt "Dateneingabe" Ihre Flächenatragsdaten, um mit der Optimierung zu beginnen',
    type: 'success'
  },
  // settings page
  showZidErr: {
    title: 'INVEKOS FEHLER',
    message:
      'Bitte stellen Sie sicher, dass Ihre 12-stellige NRW Betriebsnummer (muss mit 27605 beginnen) vollständig ist und Sie das korekkte Passwort eingegeben haben. ',
    type: 'warn'
  },
  noAddressErr: {
    title: 'ADRESSE UNGÜLTIG',
    message: 'Die angegebene Adresse konnte nicht gefunden werden.',
    type: 'error'
  },
  showAddressSucc: {
    title: 'ADRESSE GESPEICHERT',
    message: 'Die Hof-Adresse wurde in den Einstellungen gespeichert.',
    type: 'success'
  },
  showZidSucc: {
    title: 'DATEN IMPORTIERT',
    message: 'Die ELAN Antragsdaten wurden erfolgreich importiert.',
    type: 'success'
  },
  showInfo: {
    title: 'KEINE DATEN',
    message: 'Es wurden keine ELAN Daten gefunden.',
    type: 'info'
  },
  // results page
  showSolved: {
    title: 'ERFOLGREICH',
    message: 'Die Optimierung war erfolgreich und hat eine Lösung gefunden.',
    type: 'success'
  },
  showWarnings: {
    title: 'ANPASSUNG NÖTIG',
    message: 'Nicht alle Restriktionen konnten eingehalten werden',
    type: 'warn'
  },
  showInfeasible: {
    title: 'UNMÖGLICH',
    message:
      'Die Optimierung konnte keine Lösunge finden. Versuchen Sie, Restriktionen aufzuweichen.',
    type: 'error'
  }
}
