'use strict'

const test = require('brittle')
const path = require('path')
const WrkDHCP = require(path.join(__dirname, '../../workers/dhcp.wrk.js'))

function wrkWithKea (kea) {
  const wrk = Object.create(WrkDHCP.prototype)
  wrk.kea_k0 = kea
  return wrk
}

test('WrkDHCP#setIps delegates to kea_k0.setIps', async function (t) {
  const wrk = wrkWithKea({
    setIps: async (req) => ({ echo: req })
  })
  const req = { addrs: ['10.0.0.1'] }
  t.alike(await wrk.setIps(req), { echo: req })
})

test('WrkDHCP#setIp delegates to kea_k0.setIp', async function (t) {
  const wrk = wrkWithKea({
    setIp: async (req) => ({ echo: req })
  })
  const req = { 'ip-address': '10.0.0.2' }
  t.alike(await wrk.setIp(req), { echo: req })
})

test('WrkDHCP#releaseIp delegates to kea_k0.releaseIp', async function (t) {
  const wrk = wrkWithKea({
    releaseIp: async (req) => ({ released: req })
  })
  const req = { 'hw-address': 'aa:bb:cc:dd:ee:ff' }
  t.alike(await wrk.releaseIp(req), { released: req })
})

test('WrkDHCP#releaseIps delegates to kea_k0.releaseIps', async function (t) {
  const wrk = wrkWithKea({
    releaseIps: async (req) => ({ released: req })
  })
  const req = { list: [] }
  t.alike(await wrk.releaseIps(req), { released: req })
})

test('WrkDHCP#getLeases delegates to kea_k0.getLeases', async function (t) {
  const leases = [{ 'ip-address': '10.0.0.3' }]
  const wrk = wrkWithKea({
    getLeases: async () => leases
  })
  t.is(await wrk.getLeases(), leases)
})

test('WrkDHCP#getConf fetches config and returns serverConf', async function (t) {
  let fetched = false
  const serverConf = { Dhcp4: { subnet4: [] } }
  const wrk = wrkWithKea({
    async fetchConf () {
      fetched = true
    },
    serverConf
  })
  t.is(await wrk.getConf(), serverConf)
  t.ok(fetched)
})

test('WrkDHCP#exportLeases delegates to kea_k0.exportLeases', async function (t) {
  const blob = { raw: 'lease data' }
  const wrk = wrkWithKea({
    exportLeases: async () => blob
  })
  t.is(await wrk.exportLeases(), blob)
})

test('WrkDHCP#importLeases delegates to kea_k0.importLeases', async function (t) {
  const wrk = wrkWithKea({
    importLeases: async (req) => ({ imported: req })
  })
  const req = { data: 'x' }
  t.alike(await wrk.importLeases(req), { imported: req })
})

test('WrkDHCP module exports the worker class', function (t) {
  t.is(typeof WrkDHCP, 'function')
  t.ok(WrkDHCP.name === 'WrkDHCP' || WrkDHCP.prototype.init)
})
