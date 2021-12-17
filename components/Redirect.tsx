import React, {useEffect, useState} from 'react';
import {Button, Linking, Text, View} from 'react-native';
import {encode as btoa, decode as atob} from 'base-64';
import solanaWeb3 from '@solana/web3.js';
export const Redirect = () => {
  const [result, setResult] = useState<string>('~So Empty~');
  const [triggerUrl, setTriggerUrl] = useState<string>('');
  useEffect(() => {
    try {
      const url = new URL(triggerUrl);
      setResult(atob(`${url.searchParams.get('result')}`));
    } catch (e) {
      setResult('');
    }
  }, [triggerUrl]);
  useEffect(() => {
    Linking.addEventListener('url', e => {
      setTriggerUrl(e.url);
    });
  }, []);
  const generateTransaction = async () => {
    const target_network = {
      blockExplorerUrl: 'https://explorer.solana.com',
      chainId: '0x1',
      displayName: 'Solana Mainnet',
      logo: 'solana.svg',
      rpcTarget: solanaWeb3.clusterApiUrl('mainnet-beta'),
      ticker: 'SOL',
      tickerName: 'Solana Token',
    };
    const conn = new solanaWeb3.Connection(target_network.rpcTarget);
    const blockhash = (await conn.getRecentBlockhash('finalized')).blockhash;
    const TransactionInstruction = solanaWeb3.SystemProgram.transfer({
      fromPubkey: new solanaWeb3.PublicKey(
        'C4Letg829ytf5PqyEDSdBUWs4T1GT7whYGrZsJreftgW',
      ),
      toPubkey: new solanaWeb3.PublicKey(
        '32Qy5pNBpQVdPDu458PoEtMC85nm5HEsCe4eAtUH2xfF',
      ),
      lamports: 0.000000001 * 1000000000,
    });
    let transaction = new solanaWeb3.Transaction({
      recentBlockhash: blockhash,
      feePayer: new solanaWeb3.PublicKey(
        'C4Letg829ytf5PqyEDSdBUWs4T1GT7whYGrZsJreftgW',
      ),
    }).add(TransactionInstruction);
    return transaction.serializeMessage().toString('hex');
  };
  const openurl = async (method: string) => {
    const baseurl = 'http://192.168.0.100:8080/redirectflow';
    let url = baseurl;
    let params = {};
    let queryParams = new URLSearchParams();
    switch (method) {
      case 'nft_transfer':
        params = {
          mint_add: '4k2JEFZ9xwQhzFkRpa4YL8RjaUFsza8KCAZ99hmWdT93',
          receiver_add: '24s5oo1A5BzDvqKgqdem3777kPMnLgWgZFDhC9qGvWNz',
          sender_add: 'AyLEezjkWF7fyZq4iis5cASh2A5FpekwMKRZxVrPGDbg',
        };
        break;
      case 'send_transaction':
        params = {
          message: await generateTransaction(),
        };
        break;
      case 'sign_transaction':
        params = {
          message: await generateTransaction(),
        };
        break;
      default:
    }
    queryParams.set('method', method);
    let encodedParams = btoa(JSON.stringify(params));
    let useParams = true;
    if (typeof params === 'object' && Object.keys(params).length === 0) {
      useParams = false;
    }
    if (Array.isArray(params) && params.length === 0) {
      useParams = false;
    }
    const resolvePath = 'srf://redirect-handle';
    url = `${url}?${queryParams.toString()}&resolveRoute=${resolvePath}${
      useParams ? '#params=' + encodedParams : ''
    }`;
    Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
  };

  return (
    <View>
      <Button
        onPress={() => {
          openurl('login');
        }}
        title="LOGIN"
      />
      <Button
        onPress={() => {
          openurl('logout');
        }}
        title="LOGOUT"
      />
      <Button
        onPress={() => {
          openurl('nft_transfer');
        }}
        title="Transfer Nft"
      />
      <Button
        onPress={() => {
          openurl('nft_list');
        }}
        title="List NFT"
      />
      {/* <Button
      NOT WORKING ATM
        onPress={() => {
          openurl('send_transaction');
        }}
        title="Send Transction"
      />
      <Button
        onPress={() => {
          openurl('sign_transaction');
        }}
        title="Sign Transction"
      /> */}
      <Text>{result}</Text>
    </View>
  );
};
