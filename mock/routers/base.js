'use strict'

const allowedCommands = ['config-get', 'lease4-get-all', 'lease4-add', 'lease4-del']

module.exports = function (fastify) {
  fastify.post('/', async (request, reply) => {
    const service = request.body.service[0]
    const command = request.body.command
    const args = request.body.arguments

    if (service !== 'dhcp4') {
      reply.code(400).send({
        result: 1,
        text: 'Invalid service name'
      })
    }
    if (!allowedCommands.includes(command)) {
      reply.code(400).send({
        result: 1,
        text: 'Invalid command'
      })
    }

    if (command === 'config-get') {
      reply.code(200).send(request.state.config)
    } else if (command === 'lease4-get-all') {
      reply.code(200).send([{
        result: 0,
        text: 'Leases retrieved',
        arguments: { leases: request.state.leases }
      }])
    } else if (command === 'lease4-add') {
      const newLease = args
      console.log('newLease', newLease)
      const existingLease = request.state.leases.find(lease => lease['hw-address'] === newLease['hw-address'])
      console.log('existingLease', existingLease)
      if (existingLease && existingLease['ip-address'] !== newLease['ip-address'] && existingLease['subnet-id'] !== newLease['subnet-id']) {
        reply.code(400).send([{
          result: 1,
          text: 'Lease already exists'
        }])
      } else if (!existingLease) {
        request.state.leases.push(newLease)
      }
      reply.code(200).send([{
        result: 0,
        text: 'Lease added'
      }])
    } else if (command === 'lease4-del') {
      const lease = args
      console.log('lease', lease)
      const existingLease = request.state.leases.find(ilease => ilease['hw-address'] === lease['hw-address'])
      console.log('existingLease', existingLease)
      if (existingLease) {
        request.state.leases = request.state.leases.filter(ilease => ilease['hw-address'] !== lease['hw-address'])
        reply.code(200).send([{
          result: 0,
          text: 'Lease deleted'
        }])
      } else {
        reply.code(400).send([{
          result: 1,
          text: 'Lease does not exist'
        }])
      }
    }
  })
}
