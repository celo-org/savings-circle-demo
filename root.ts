import { newKitFromWeb3 } from "@celo/contractkit";
import Web3 from "web3";
export const provider = "https://alfajores-forno.celo-testnet.org";

export const web3 = new Web3(provider);
export const kit = newKitFromWeb3(web3);
