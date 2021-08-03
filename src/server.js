require('env2')('.env')

const Hapi = require('@hapi/hapi')
const routes = require('./routes')
const { validate } = require('./database')

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
    routes: {
      cors: true,
      payload: { multipart: true }
    }
  })
  await server.register(require('@hapi/basic'))
  await server.register({
    plugin: require('hapi-server-session'),
    options: {
      cookie: {
        isSecure: false
      }
    }
  })
  server.auth.strategy('simple', 'basic', { validate })
  server.auth.default({ strategy: 'simple' })
  server.route(routes)

  await server.start()

  // await validate('', 'ga', 'password').then((r) => {
  //   console.log(r)
  // })

  return server.info.uri
}

init().then(r => console.log(`Server running at ${r}`))
