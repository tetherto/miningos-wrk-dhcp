'use strict'

const test = require('brittle')
const fs = require('fs')
const path = require('path')

test('worker entry delegates to bfx-svc-boot-js', function (t) {
  const src = fs.readFileSync(path.join(__dirname, '../../worker.js'), 'utf8')
  t.ok(src.includes('@bitfinex/bfx-svc-boot-js'))
})

test('dhcp worker class can be required', function (t) {
  const WrkDHCP = require(path.join(__dirname, '../../workers/dhcp.wrk.js'))
  t.is(typeof WrkDHCP, 'function')
})
