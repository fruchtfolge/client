import Vue from 'vue'
import VueNotifications from 'vue-notifications'

// Include mini-toaster (or any other UI-notification library)
import miniToastr from 'mini-toastr'

// We shall setup types of the messages. ('error' type - red and 'success' - green in mini-toastr)
const toastTypes = {
  success: 'success',
  error: 'error',
  info: 'info',
  warn: 'warn'
}

// This step requires only for mini-toastr, just an initialization
miniToastr.init({
  types: toastTypes,
  style: {
    '.mini-toastr': {
      position: 'fixed',
      'z-index': 99999,
      right: '22px',
      top: '72px'
    },
    /* This would only show the first error, however it seem confusing as
    from a users perspective its not possible to see if the latest changes
    have been accepted or not
    '.mini-toastr > div:not(:first-child)': {
      display: 'none'
    },
    */
    '.mini-toastr__notification': {
      cursor: 'pointer',
      padding: '12px 18px',
      margin: '0 0 6px 0',
      'background-color': '#000',
      opacity: 0.95,
      color: '#fff',
      /*
      'border-radius': '3px',
      'box-shadow': '#3c3b3b 0 0 12px',
      */
      width: '300px',
      '&.-error': {
        'background-color': '#de4457',
        'border': '2px solid #c33b4b'
      },
      '&.-warn': {
        'background-color': '#e2963d',
        'border': '2px solid #c38032'
      },
      '&.-success': {
        'background-color': '#79ae98',
        'border': '2px solid #669481'
      },
      '&.-info': {
        'background-color': '#3684c8',
        'border': '2px solid #2d70aa'
      },
      '&:hover': {
        opacity: 1
        // 'box-shadow': '#000 0 0 12px'
      }
    },
    '.mini-toastr-notification__title': {
      'font-family': 'Open Sans Condensed',
      'font-weight': 'bold',
      'letter-spacing': '0.1em',
      'margin-bottom': '6px'
    },
    '.mini-toastr-notification__message': {
      'font-size': '13px',
      display: 'inline-block',
      'vertical-align': 'middle',
      width: '240px'
    }
  }
})

// Here we are seting up messages output to `mini-toastr`
// This mean that in case of 'success' message we will call miniToastr.success(message, title, timeout, cb)
// In case of 'error' we will call miniToastr.error(message, title, timeout, cb)
// and etc.
const toastDisplayTimes = {
  success: 1500,
  error: 3000,
  info: 8000,
  warn: 8000
}

function toast({ title, message, type, timeout, cb }) {
  return miniToastr[type](message, title, toastDisplayTimes[type], cb)
}

// Here we map vue-notifications method to function abowe (to mini-toastr)
// By default vue-notifications can have 4 methods: 'success', 'error', 'info' and 'warn'
// But you can specify whatever methods you want.
// If you won't specify some method here, output would be sent to the browser's console
const options = {
  success: toast,
  error: toast,
  info: toast,
  warn: toast
}

// Activate plugin
// VueNotifications have auto install but if we want to specify options we've got to do it manually.
Vue.use(VueNotifications, options)
