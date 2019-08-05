import { Linking } from "expo";
import { number } from "prop-types";

export function listenToAccount(callback: (account: string) => void) {
  return Linking.addEventListener("url", ({ url }) => {
    const { queryParams } = Linking.parse(url);
    if (queryParams.account) {
      callback(queryParams.account);
    }
  });
}

export function listenToSignedTx(callback: (signedTx: string) => void) {
  return Linking.addEventListener("url", ({ url }) => {
    const { queryParams } = Linking.parse(url);
    if (queryParams.rawTx) {
      callback(queryParams.rawTx);
    }
  });
}

export function requestAccountAddress(returnPath: string) {
  const url = Linking.makeUrl(returnPath);
  Linking.openURL(`celo://wallet/dappkit?op=account_address&callback=${url}`);
}

export function requestTxSignature(txData: string, estimatedGas: number, from: string, to: string, nonce: number, returnPath: string) {
  const url = Linking.makeUrl(returnPath);
  Linking.openURL(`celo://wallet/dappkit?op=sign_tx&callback=${url}&txData=${txData}&estimatedGas=${estimatedGas}&from=${from}&to=${to}&nonce=${nonce}`);
}