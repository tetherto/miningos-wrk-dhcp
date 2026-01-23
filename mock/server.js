'use strict'

const fs = require('fs')
const path = require('path')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const debug = require('debug')('mock')
const fastify = require('fastify')

if (require.main === module) {
  const argv = yargs(hideBin(process.argv))
    .option('port', {
      alias: 'p',
      type: 'number',
      description: 'port to run on',
      default: 8000
    })
    .option('host', {
      alias: 'h',
      type: 'string',
      description: 'host to run on',
      default: '127.0.0.1'
    })
    .parse()
  runServer(argv)
} else {
  module.exports = {
    createServer: runServer
  }
}

function runServer (argv) {
  const CTX = {
    startTime: Date.now(),
    host: argv.host,
    port: argv.port

  }
  const STATE = {}

  const cmdPaths = ['./initial_states/default']
  let cpath = null

  cmdPaths.forEach(p => {
    if (fs.existsSync(path.resolve(__dirname, p) + '.js')) {
      cpath = p
      return false
    }
  })

  try {
    debug(new Date(), `Loading initial state from ${cpath}`)
    Object.assign(STATE, require(cpath)(CTX))
  } catch (e) {
    throw Error('ERR_INVALID_STATE')
  }

  const addState = (req, res, next) => {
    req.state = STATE.state
    next()
  }
  const app = fastify()
  try {
    const router = require('./routers/base.js')
    app.addHook('onRequest', addState)
    router(app)
  } catch (e) {
    console.log(e)
    debug(e)
    throw new Error('ERR_ROUTER_NOTFOUND')
  }

  app.addHook('onClose', STATE.cleanup)
  app.listen({ port: argv.port, host: argv.host }, function (err, addr) {
    if (err) {
      debug(err)
      throw err
    }
    debug(`Server listening for HTTP requests on socket ${addr}`)
  })
  return app
}
