'use strict'

module.exports = function (ctx) {
  const state = {
    leases: [],
    config: [
      {
        arguments: {
          Dhcp4: {
            allocator: 'iterative',
            authoritative: false,
            'boot-file-name': '',
            'calculate-tee-times': false,
            'client-classes': [
              {
                'boot-file-name': '/dev/null',
                name: 'voip',
                'next-server': '192.0.2.254',
                'option-data': [],
                'option-def': [],
                'server-hostname': 'hal9000',
                test: "substring(option[60].hex,0,6) == 'Aastra'"
              }
            ],
            'control-socket': {
              'socket-name': '/tmp/kea4-ctrl-socket',
              'socket-type': 'unix'
            },
            'ddns-conflict-resolution-mode': 'check-with-dhcid',
            'ddns-generated-prefix': 'myhost',
            'ddns-override-client-update': false,
            'ddns-override-no-update': false,
            'ddns-qualifying-suffix': '',
            'ddns-replace-client-name': 'never',
            'ddns-send-updates': true,
            'ddns-update-on-renew': false,
            'decline-probation-period': 86400,
            'dhcp-ddns': {
              'enable-updates': false,
              'max-queue-size': 1024,
              'ncr-format': 'JSON',
              'ncr-protocol': 'UDP',
              'sender-ip': '0.0.0.0',
              'sender-port': 0,
              'server-ip': '127.0.0.1',
              'server-port': 53001
            },
            'dhcp-queue-control': {
              capacity: 64,
              'enable-queue': false,
              'queue-type': 'kea-ring4'
            },
            'dhcp4o6-port': 0,
            'early-global-reservations-lookup': false,
            'echo-client-id': true,
            'expired-leases-processing': {
              'flush-reclaimed-timer-wait-time': 25,
              'hold-reclaimed-time': 3600,
              'max-reclaim-leases': 100,
              'max-reclaim-time': 250,
              'reclaim-timer-wait-time': 10,
              'unwarned-reclaim-cycles': 5
            },
            'hooks-libraries': [
              {
                library: '/usr/lib/x86_64-linux-gnu/kea/hooks/libdhcp_lease_cmds.so'
              },
              {
                library: '/usr/lib/x86_64-linux-gnu/kea/hooks/libdhcp_stat_cmds.so'
              }
            ],
            'host-reservation-identifiers': [
              'hw-address',
              'duid',
              'circuit-id',
              'client-id'
            ],
            'hostname-char-replacement': '',
            'hostname-char-set': '[^A-Za-z0-9.-]',
            'interfaces-config': {
              interfaces: [
                'enp2s0'
              ],
              're-detect': true
            },
            'ip-reservations-unique': true,
            'lease-database': {
              name: '/var/lib/kea/dhcp4.leases',
              persist: true,
              type: 'memfile'
            },
            loggers: [
              {
                debuglevel: 0,
                name: 'kea-dhcp4',
                output_options: [
                  {
                    flush: true,
                    output: 'stdout',
                    pattern: '%-5p %m\n'
                  }
                ],
                severity: 'INFO'
              }
            ],
            'match-client-id': true,
            'multi-threading': {
              'enable-multi-threading': true,
              'packet-queue-size': 64,
              'thread-pool-size': 0
            },
            'next-server': '0.0.0.0',
            'option-data': [
              {
                'always-send': false,
                code: 6,
                'csv-format': true,
                data: '192.0.2.1, 192.0.2.2',
                name: 'domain-name-servers',
                'never-send': false,
                space: 'dhcp4'
              },
              {
                'always-send': false,
                code: 15,
                'csv-format': true,
                data: 'example.org',
                name: 'domain-name',
                'never-send': false,
                space: 'dhcp4'
              },
              {
                'always-send': false,
                code: 119,
                'csv-format': true,
                data: 'mydomain.example.com, example.com',
                name: 'domain-search',
                'never-send': false,
                space: 'dhcp4'
              },
              {
                'always-send': false,
                code: 67,
                'csv-format': true,
                data: 'EST5EDT4\\,M3.2.0/02:00\\,M11.1.0/02:00',
                name: 'boot-file-name',
                'never-send': false,
                space: 'dhcp4'
              },
              {
                'always-send': false,
                code: 23,
                'csv-format': true,
                data: '0xf0',
                name: 'default-ip-ttl',
                'never-send': false,
                space: 'dhcp4'
              }
            ],
            'option-def': [],
            'parked-packet-limit': 256,
            'rebind-timer': 2000,
            'renew-timer': 1000,
            'reservations-global': false,
            'reservations-in-subnet': true,
            'reservations-lookup-first': false,
            'reservations-out-of-pool': false,
            'sanity-checks': {
              'extended-info-checks': 'fix',
              'lease-checks': 'warn'
            },
            'server-hostname': '',
            'server-tag': '',
            'shared-networks': [],
            'statistic-default-sample-age': 0,
            'statistic-default-sample-count': 20,
            'store-extended-info': false,
            subnet4: [
              {
                '4o6-interface': '',
                '4o6-interface-id': '',
                '4o6-subnet': '',
                allocator: 'iterative',
                'calculate-tee-times': false,
                id: 1,
                'max-valid-lifetime': 4000,
                'min-valid-lifetime': 4000,
                'option-data': [],
                pools: [
                  {
                    'option-data': [],
                    pool: '10.182.0.11-10.182.0.15'
                  },
                  {
                    'option-data': [],
                    pool: '10.182.0.115-10.182.0.130'
                  }
                ],
                'rebind-timer': 2000,
                relay: {
                  'ip-addresses': []
                },
                'renew-timer': 1000,
                reservations: [],
                'store-extended-info': false,
                subnet: '10.182.0.0/24',
                't1-percent': 0.5,
                't2-percent': 0.875,
                'valid-lifetime': 4000
              },
              {
                '4o6-interface': '',
                '4o6-interface-id': '',
                '4o6-subnet': '',
                allocator: 'iterative',
                'calculate-tee-times': false,
                id: 2,
                'max-valid-lifetime': 4000,
                'min-valid-lifetime': 4000,
                'option-data': [],
                pools: [],
                'rebind-timer': 2000,
                relay: {
                  'ip-addresses': []
                },
                'renew-timer': 1000,
                reservations: [],
                'store-extended-info': false,
                subnet: '10.10.0.0/24',
                't1-percent': 0.5,
                't2-percent': 0.875,
                'valid-lifetime': 4000
              },
              {
                '4o6-interface': '',
                '4o6-interface-id': '',
                '4o6-subnet': '',
                allocator: 'iterative',
                'calculate-tee-times': false,
                id: 3,
                'max-valid-lifetime': 4000,
                'min-valid-lifetime': 4000,
                'option-data': [],
                pools: [],
                'rebind-timer': 2000,
                relay: {
                  'ip-addresses': []
                },
                'renew-timer': 1000,
                reservations: [],
                'store-extended-info': false,
                subnet: '15.15.0.0/24',
                't1-percent': 0.5,
                't2-percent': 0.875,
                'valid-lifetime': 4000
              },
              {
                '4o6-interface': '',
                '4o6-interface-id': '',
                '4o6-subnet': '',
                allocator: 'iterative',
                'calculate-tee-times': false,
                id: 4,
                'max-valid-lifetime': 4000,
                'min-valid-lifetime': 4000,
                'option-data': [],
                pools: [],
                'rebind-timer': 2000,
                relay: {
                  'ip-addresses': []
                },
                'renew-timer': 1000,
                reservations: [],
                'store-extended-info': false,
                subnet: '100.100.0.0/24',
                't1-percent': 0.5,
                't2-percent': 0.875,
                'valid-lifetime': 4000
              },
              {
                '4o6-interface': '',
                '4o6-interface-id': '',
                '4o6-subnet': '',
                allocator: 'iterative',
                'calculate-tee-times': false,
                id: 5,
                'max-valid-lifetime': 4000,
                'min-valid-lifetime': 4000,
                'option-data': [],
                pools: [],
                'rebind-timer': 2000,
                relay: {
                  'ip-addresses': []
                },
                'renew-timer': 1000,
                reservations: [],
                'store-extended-info': false,
                subnet: '127.0.0.0/24',
                't1-percent': 0.5,
                't2-percent': 0.875,
                'valid-lifetime': 4000
              },
              {
                '4o6-interface': '',
                '4o6-interface-id': '',
                '4o6-subnet': '',
                allocator: 'iterative',
                'calculate-tee-times': false,
                id: 6,
                'max-valid-lifetime': 4000,
                'min-valid-lifetime': 4000,
                'option-data': [],
                pools: [],
                'rebind-timer': 2000,
                relay: {
                  'ip-addresses': []
                },
                'renew-timer': 1000,
                reservations: [],
                'store-extended-info': false,
                subnet: '127.0.0.0/23',
                't1-percent': 0.5,
                't2-percent': 0.875,
                'valid-lifetime': 4000
              }
            ],
            't1-percent': 0.5,
            't2-percent': 0.875,
            'valid-lifetime': 4000
          },
          hash: '4BFAFF72A02EFEEEC71E7A9BDC29577943EC6E350F32714ACE1F3BD42C5B341C'
        },
        result: 0
      }
    ]
  }

  function cleanup () {
  }

  return { state, cleanup }
}
