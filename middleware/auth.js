export default async function (context) {
  async function deleteAndRedirect() {
    if (context.app.$db) {
      // get elements in db
      const result = await context.app.$db.info()
      if (result.doc_count > 0) {
        // destroy database if not empty
        await context.app.$db.destroy()
        // reinitialize empty db
        context.app.$db = context.app.$initalizeDB()
      }
    }
    if (context.route.path !== '/') {
      return context.redirect('/')
    }
  }

  let settings
  try {
    settings = await context.app.$db.get('settings')
  } catch (e) {
    console.log(e)
    return await deleteAndRedirect()
  }
  try {
    // check if user auth tokens are available
    if (settings && settings.auth) {
      context.$axios.setHeader('Authorization','Bearer ' + settings.auth.token + ':' + settings.auth.password)
      // get session
      await context.$axios.get('http://localhost:3001/auth/session')
      // only sync on page reload
      // ugly hack, as I didn't find a way to check if middleware is called after page reload
      // the 'sync' property is injected into the store, if it is present and not cancelled yet,
      // we reinitalize it
      if (context.app.$store && !context.app.$store.sync || context.app.$store.sync.cancelled) {
        context.app.$store.sync = context.app.$db.sync(settings.auth.userDBs.userdb, {
          live: true,
          retry: true
        })
      }
    } else {
      throw new Error('no auth')
    }
  } catch (e) {
    console.log(e)
    return await deleteAndRedirect()
  }
}
