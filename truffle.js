require("ts-node/register");

module.exports = {
  networks: {
    local: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "1101"
    },
    alfajores: {
      from: "0x456f41406B32c45D59E539e4BBA3D7898c3584dA",
      host: "127.0.0.1",
      port: 8545,
      network_id: "44786"
    }
  }
};
