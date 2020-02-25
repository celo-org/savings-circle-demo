import * as fs from "fs";

const contracts = ["SavingsCircle"];
const networkId = "44786";
const outputDir = "web3-contracts";

contracts.forEach(contractName => {
  const artifact = JSON.parse(
    fs.readFileSync(`build/contracts/${contractName}.json`).toString()
  );
  const address = artifact.networks[networkId].address;
  fs.writeFileSync(
    `${outputDir}/${contractName}.ts`,
    `import Web3 from 'web3'
    import { ${contractName} as ${contractName}Type } from '../web3-types/${contractName}'
    export default async function getInstance(web3: Web3, account: string | null = null) {
      const contract = new web3.eth.Contract(${JSON.stringify(
        artifact.abi,
        null,
        2
      )}, "${address}", { from: account || (await web3.eth.getAccounts())[0] }) as unknown as ${contractName}Type
      return contract
    }
    `
  );
});
