# miningos-wrk-dhcp

DHCP server worker that manages IP address allocation for mining farm devices using Kea DHCP server - provides RPC methods for setting/releasing IPs, managing leases, and subnet operations across multiple mining clusters.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Starting the Worker](#starting-the-worker)
6. [Architecture](#architecture)
7. [RPC Methods](#rpc-methods)
8. [Development](#development)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

## Overview

The DHCP Worker provides a Hyperswarm RPC interface to Kea DHCP server for decentralized IP address management:
- Assigns and releases IP addresses for mining devices via MAC address
- Manages DHCP leases across multiple subnets
- Supports batch operations for efficiency
- Provides lease import/export for migration and backup
- Communicates via RPC (Hyperswarm) for P2P network integration

## Prerequisites

- Node.js >= 20.0
- Kea DHCP Server 2.x or higher (or use the included mock server for development)
- Kea hooks libraries: `libdhcp_lease_cmds.so`, `libdhcp_stat_cmds.so`
- Kea configured with HTTP control socket enabled

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tetherto/miningos-wrk-dhcp.git
cd miningos-wrk-dhcp
```

2. Install dependencies:
```bash
npm install
```

3. Setup configuration files:
```bash
bash setup-config.sh
# For test configurations as well:
bash setup-config.sh --test
```

## Configuration

### Common Configuration (config/common.json)

Currently uses default empty configuration:

```json
{}
```

Additional worker-specific settings can be added here as needed.

### Kea Configuration (config/facs/kea.config.json)

Configure the Kea DHCP server HTTP endpoint:

```json
{
  "k0": {
    "url": "http://127.0.0.1:8000"
  }
}
```

For production, point to your Kea control socket HTTP endpoint (typically `http://127.0.0.1:8000`).

### Network Configuration (config/facs/net.config.json)

Configure Hyperswarm RPC network settings:

```json
{
  "r0": {
    "serverName": "dhcp"
  }
}
```

The `serverName` is used when calling the worker via RPC (e.g., `hp-rpc-cli -s dhcp ...`).

### Storage Configuration (config/facs/store.config.json)

Configure local storage directory (auto-created):

```json
{}
```

Storage directory: `store/${cluster}/` (cluster name from CLI argument).

## Starting the Worker

### Development Mode (with Mock Server)

1. Start the mock Kea DHCP server:
```bash
DEBUG="*" node mock/server.js
# Options: -p <port> (default: 8000), -h <host> (default: 127.0.0.1)
```

2. In another terminal, start the worker:
```bash
node worker.js --wtype wrk-dhcp --env development --cluster cluster-0
```

### Production Mode

```bash
# Ensure Kea DHCP server is running and configured
node worker.js --wtype wrk-dhcp --env production --cluster production-cluster
```

The worker will:
- Initialize storage at `store/${cluster}/`
- Connect to Kea server at configured URL
- Start Hyperswarm RPC server
- Log RPC public key for client connections

## Architecture

### Core Components

#### Worker Type: `wrk-dhcp`
Main class: `WrkDHCP` (extends `bfx-wrk-base`)

#### Facilities (Initialization Order)

1. **Store** (`hp-svc-facs-store`, priority -5): Local SQLite storage
2. **Network** (`hp-svc-facs-net`, priority 0): Hyperswarm RPC server/client
3. **HTTP Client** (`bfx-facs-http`, priority 0): HTTP client for Kea API
4. **Kea Interface** (`svc-facs-kea`, priority 5): Kea DHCP server facade

#### Communication Flow

```
RPC Client (hp-rpc-cli)
    ↓ Hyperswarm RPC call
Worker RPC Server (net_r0)
    ↓ handleReply()
Worker Method (e.g., setIp)
    ↓ Calls Kea facade
Kea Facade (kea_k0)
    ↓ HTTP POST to Kea control socket
Kea DHCP Server
    ↓ Response
Back through chain to RPC Client
```

### Kea DHCP Server Integration

The worker communicates with Kea via HTTP control socket using these Kea commands:
- `config-get`: Retrieve server configuration
- `lease4-get-all`: Get all IPv4 leases
- `lease4-add`: Add/update a lease
- `lease4-del`: Delete a lease

## RPC Methods

All methods are called via Hyperswarm RPC. Use `hp-rpc-cli` for testing:

### setIp

Assign an IP address to a MAC address within a subnet.

**Request:**
```bash
npx hp-rpc-cli -s dhcp -m setIp -d '{"mac": "00:00:00:00:00:06", "subnet": "10.182.0.0/24"}'
```

**Response:**
```
Success: "10.182.0.1"
Errors: ERR_MAC_AND_SUBNET_REQUIRED, ERR_SUBNET_NOT_FOUND, ERR_IN_ANOTHER_SUBNET, ERR_NO_AVAILABLE_IP
```

### releaseIp

Release an IP address back to the pool.

**Request:**
```bash
npx hp-rpc-cli -s dhcp -m releaseIp -d '{"ip":"10.10.0.25"}'
```

**Response:**
```
Success: 1
Errors: ERR_IP_REQUIRED, ERR_IP_NOT_FOUND
```

### setIps

Batch IP assignment for multiple MAC addresses.

**Request:**
```bash
npx hp-rpc-cli -s dhcp -m setIps -d '[{"mac": "00:00:00:00:00:06", "subnet": "10.182.0.0/24"}, {"mac": "00:00:00:00:00:07", "subnet": "10.10.0.0/24"}]'
```

**Response:**
```json
[
  {"success": true, "mac": "00:00:00:00:00:06", "ip": "10.182.0.1", "error": null},
  {"success": false, "mac": "00:00:00:00:00:07", "ip": null, "error": "ERR_NO_AVAILABLE_IP"}
]
```

### releaseIps

Batch IP release.

**Request:**
```bash
npx hp-rpc-cli -s dhcp -m releaseIps -d '[{"ip":"10.10.0.25"},{"ip":"10.10.0.26"}]'
```

**Response:**
```json
[
  {"ip":"10.10.0.25", "success": true, "error": null},
  {"ip":"10.10.0.26", "success": false, "error": "ERR_IP_NOT_FOUND"}
]
```

### getLeases

Retrieve all current DHCP leases.

**Request:**
```bash
npx hp-rpc-cli -s dhcp -m getLeases -d '{}'
```

**Response:**
```json
[
  {"ip":"10.172.144.30","mac":"52:54:00:db:46:e5"},
  {"ip":"10.172.144.31","mac":"52:54:00:db:46:e6"}
]
```

### getConf

Get Kea DHCP server configuration.

**Request:**
```bash
npx hp-rpc-cli -s dhcp -m getConf -d '{}'
```

**Response:**
Returns full Kea Dhcp4 configuration object including subnets, pools, and global settings.

### exportLeases

Export all leases in Kea format for backup/migration.

**Request:**
```bash
npx hp-rpc-cli -s dhcp -m exportLeases -d '{}'
```

**Response:**
```json
[
  {"ip-address":"10.182.0.12","hw-address":"cc:00:00:00:00:01","subnet-id":1},
  {"ip-address":"10.182.0.13","hw-address":"cc:00:00:00:00:02","subnet-id":1}
]
```

### importLeases

Import leases from Kea export format.

**Request:**
```bash
npx hp-rpc-cli -s dhcp -m importLeases -d '[{"mac":"CC:00:00:00:00:01","ip":"10.182.0.12","subnetId":1},{"mac":"CC:00:00:00:00:02","ip":"10.182.0.13","subnetId":1}]'
```

**Response:**
```json
[
  {"success":true,"mac":"CC:00:00:00:00:01","ip":{"ip":"10.182.0.12"}},
  {"success":true,"mac":"CC:00:00:00:00:02","ip":{"ip":"10.182.0.13"}}
]
```

## Development

### Running Tests

```bash
npm test              # Run all tests (lint + unit)
npm run test:unit     # Run unit tests only
npm run lint          # Check code style (Standard.js)
npm run lint:fix      # Auto-fix linting issues
```

### Running Individual Tests

```bash
npx brittle test/specific-test.js
```

### Mock Server Development

The mock server simulates Kea DHCP server responses without requiring a full Kea installation.

**Start the mock server:**
```bash
DEBUG="*" node mock/server.js -p 8000 -h 127.0.0.1
```

**Mock server features:**
- Simulates Kea control socket HTTP interface
- Handles commands: `config-get`, `lease4-get-all`, `lease4-add`, `lease4-del`
- Maintains in-memory lease state
- Returns realistic Kea response formats
- Pre-configured with test subnets (10.182.0.0/24, 10.10.0.0/24, etc.)

**Test against mock server:**
```bash
# Terminal 1: Start mock server
DEBUG="*" node mock/server.js

# Terminal 2: Start worker (configured to use localhost:8000)
node worker.js --wtype wrk-dhcp --env development --cluster test-cluster

# Terminal 3: Test RPC methods
npx hp-rpc-cli -s dhcp -m getLeases -d '{}'
```

### Project Structure

```
.
├── config/              # Configuration files
│   ├── common.json      # Main worker configuration
│   └── facs/            # Facility configs (kea, net, store)
├── workers/
│   └── dhcp.wrk.js      # Main worker class (WrkDHCP)
├── mock/
│   ├── server.js        # Mock Kea DHCP server
│   ├── routers/
│   │   └── base.js      # Mock HTTP routes
│   └── initial_states/
│       └── default.js   # Mock server initial state
├── setup-config.sh      # Configuration setup script
└── worker.js            # Entry point (bootstraps worker)
```

### Code Style

- Standard.js (ESLint with opinionated defaults)
- No semicolons, 2-space indentation
- Async/await preferred over callbacks
- Debug logging via `debug` module

## Troubleshooting

### Common Issues

1. **Cannot connect to Kea DHCP server**
   - Verify Kea is running and HTTP control socket is enabled
   - Check URL in `config/facs/kea.config.json` matches Kea's socket
   - Ensure Kea hooks are installed: `libdhcp_lease_cmds.so`, `libdhcp_stat_cmds.so`
   - Check Kea config for `control-socket` section

2. **ERR_SUBNET_NOT_FOUND**
   - Verify subnet exists in Kea configuration
   - Run `getConf` method to see available subnets
   - Check subnet format matches CIDR notation (e.g., `10.182.0.0/24`)

3. **ERR_NO_AVAILABLE_IP**
   - All IPs in subnet pool are allocated
   - Check Kea subnet configuration for pool ranges
   - Release unused IPs or expand pool range in Kea config

4. **ERR_IN_ANOTHER_SUBNET**
   - MAC address already has an IP in a different subnet
   - Release existing lease first, then assign new one
   - Or use batch operations to handle migration

5. **RPC connection failures**
   - Verify worker started successfully and logged RPC public key
   - Check network configuration in `config/facs/net.config.json`
   - Ensure `hp-rpc-cli` can reach Hyperswarm DHT

6. **Mock server issues**
   - Ensure port 8000 is available (or use `-p` flag)
   - Check DEBUG output for error messages
   - Verify mock server is configured in `config/facs/kea.config.json`

### Kea DHCP Server Setup

For production use, install and configure Kea:

```bash
# Ubuntu/Debian
sudo apt-get install kea-dhcp4-server kea-ctrl-agent

# Configure Kea with HTTP control socket
# Edit /etc/kea/kea-dhcp4.conf:
{
  "Dhcp4": {
    "control-socket": {
      "socket-type": "http",
      "socket-address": "127.0.0.1",
      "socket-port": 8000
    },
    "hooks-libraries": [
      { "library": "/usr/lib/x86_64-linux-gnu/kea/hooks/libdhcp_lease_cmds.so" },
      { "library": "/usr/lib/x86_64-linux-gnu/kea/hooks/libdhcp_stat_cmds.so" }
    ],
    "subnet4": [
      {
        "subnet": "10.182.0.0/24",
        "pools": [
          { "pool": "10.182.0.11 - 10.182.0.254" }
        ],
        "id": 1
      }
    ]
  }
}

# Start Kea
sudo systemctl start kea-dhcp4-server
```

## Contributing

Contributions are welcome and appreciated!

### How to Contribute

1. **Fork** the repository
2. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and ensure tests pass:
   ```bash
   npm test
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** describing what you changed and why

### Guidelines

- Follow Standard.js code style (`npm run lint`)
- Add tests for new functionality
- Keep PRs focused—one feature or fix per pull request
- Update documentation as needed
- Ensure all tests pass before submitting
- Test against both mock server and real Kea installation when possible
