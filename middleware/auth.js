export default async function (context) {
  const allowedRoutes = [
    '/',
    '/forgot-password',
    '/datenschutz',
    '/impressum',
    '/kontakt',
    '/nutzungsbedingungen'
  ]
  function deleteAndRedirect() {
    localStorage.removeItem('lastUser')
    if (allowedRoutes.indexOf(context.route.path) === -1) {
      return context.redirect('/')
    }
  }

  if (!context.app.$db) {
    const lastUser = localStorage.getItem('lastUser')
    if (lastUser) context.app.$initalizeDB(lastUser)
  }

  let settings
  try {
    settings = await context.app.$db.get('settings')
  } catch (e) {
    // fail quietly and redirect if route requires auth
    return deleteAndRedirect()
  }
  try {
    // check if user auth tokens are available
    if (settings && settings.auth) {
      // check if session is valid
      await context.$axios.get(settings.auth.userDBs.userdb, {
        headers: {
          Authorization: 'Basic ' + btoa(settings.auth.token + ':' + settings.auth.password)
        }
      })
      context.$axios.setHeader(
        'Authorization',
        'Bearer ' + settings.auth.token + ':' + settings.auth.password
      )
      // only sync on page reload
      // ugly hack, as I didn't find a way to check if middleware is called after page reload
      // the 'sync' property is injected into the store, if it is present and not cancelled yet,
      // we reinitalize it
      if (
        (context.app.$store && !context.app.$store.sync) ||
        context.app.$store.sync.cancelled
      ) {
        context.app.$store.sync = context.app.$db.sync(
          settings.auth.userDBs.userdb,
          {
            live: true,
            retry: true
          }
        )
        if (context.route.path === '/') {
          return context.redirect('/maps')
        }
      }
    } else {
      throw new Error('no auth')
    }
  } catch (e) {
    return deleteAndRedirect()
  }
}
