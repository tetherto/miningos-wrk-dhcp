'use strict'

const async = require('async')
const WrkBase = require('bfx-wrk-base')
const debug = require('debug')('dhcp:wrk')

class WrkDHCP extends WrkBase {
  constructor (conf, ctx) {
    super(conf, ctx)

    this.init()
    this.start()
    this.loadStatus()
  }

  init () {
    super.init()
    this.setInitFacs([
      ['fac', 'hp-svc-facs-store', 's0', 's0', {
        storeDir: `store/${this.ctx.cluster}`
      }, -5],
      ['fac', 'hp-svc-facs-net', 'r0', 'r0', () => {
        return {
          fac_store: this.store_s0
        }
      }, 0],
      ['fac', 'bfx-facs-http', 'c0', 'c0', { timeout: 30000, debug: false }, 0],
      ['fac', 'svc-facs-kea', 'k0', 'k0', () => {
        return {
          fac_http: this.http_c0
        }
      }, 5]
    ])
  }

  async setIps (req) {
    return await this.kea_k0.setIps(req)
  }

  async setIp (req) {
    return await this.kea_k0.setIp(req)
  }

  async releaseIp (req) {
    return await this.kea_k0.releaseIp(req)
  }

  async releaseIps (req) {
    return await this.kea_k0.releaseIps(req)
  }

  async getLeases () {
    return await this.kea_k0.getLeases()
  }

  async getConf () {
    await this.kea_k0.fetchConf()
    return this.kea_k0.serverConf
  }

  async exportLeases () {
    return await this.kea_k0.exportLeases()
  }

  async importLeases (req) {
    return await this.kea_k0.importLeases(req)
  }

  _start (cb) {
    async.series([
      next => { super._start(next) },
      async () => {
        await this.net_r0.startRpcServer()
        const rpcServer = this.net_r0.rpcServer

        rpcServer.respond('echo', x => x)

        rpcServer.respond('exportLeases', async (req) => {
          return await this.net_r0.handleReply('exportLeases', req)
        })

        rpcServer.respond('importLeases', async (req) => {
          return await this.net_r0.handleReply('importLeases', req)
        })

        rpcServer.respond('getConf', async (req) => {
          return await this.net_r0.handleReply('getConf', req)
        })

        rpcServer.respond('getLeases', async (req) => {
          return await this.net_r0.handleReply('getLeases', req)
        })

        rpcServer.respond('setIp', async (req) => {
          return await this.net_r0.handleReply('setIp', req)
        })

        rpcServer.respond('releaseIp', async (req) => {
          return await this.net_r0.handleReply('releaseIp', req)
        })

        rpcServer.respond('setIps', async (req) => {
          return await this.net_r0.handleReply('setIps', req)
        })

        rpcServer.respond('releaseIps', async (req) => {
          return await this.net_r0.handleReply('releaseIps', req)
        })

        this.status.rpcPublicKey = rpcServer.publicKey.toString('hex')
        this.saveStatus()
        debug('Started')
      }
    ], cb)
  }
}

module.exports = WrkDHCP
