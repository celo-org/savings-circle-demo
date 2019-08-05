require("ts-node/register");

module.exports = {
    networks: {
        local: {
            host: '127.0.0.1',
            port: 8545,
            network_id: '1101',
        },
        alfajores: {
            from: '0x28fe8bc8e04a273bcf222efcdb107b96e2ed2c46',
            host: '127.0.0.1',
            port: 8545,
            network_id: '44781',
        }
    }
}