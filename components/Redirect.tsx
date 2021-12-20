import React, {useEffect, useState} from 'react';
import {Button, Image, Linking, Text, View} from 'react-native';
import {encode as btoa, decode as atob} from 'base-64';
import solanaWeb3 from '@solana/web3.js';
import {StyleSheet, Dimensions} from 'react-native';
const {height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: height,
    justifyContent: 'center',
    flexGrow: 1,
    alignItems: 'center',
    overflow: 'scroll',
  },
  btn: {
    marginBottom: 10,
    marginTop: 10,
  },
  nftBtn: {
    marginBottom: 10,
    display: 'flex',
    justifyContent: 'space-around',
    flexDirection: 'row',
    alignItems: 'center',
  },
  result: {
    borderWidth: 2,
    borderColor: 'red',
    padding: 10,
    height: 100,
    overflow: 'hidden',
  },
  img: {
    height: 50,
    width: 50,
    marginRight: 30,
  },
});

export const Redirect = () => {
  const [result, setResult] = useState<string>('~So Empty~');
  const [triggerUrl, setTriggerUrl] = useState<string>('');
  const [nfts, setNfts] = useState<any[]>([]);
  useEffect(() => {
    try {
      const url = new URL(triggerUrl);
      setResult(atob(`${url.searchParams.get('result')}`));
      const nft: any[] = JSON.parse(
        atob(`${url.searchParams.get('result')}`) || '',
      );
      if (nft.length) {
        setNfts(
          nft.map(n => {
            return {
              mint_address: n.mintAddress,
              image: n.metaplexData.offChainMetaData.image,
              name: n.metaplexData.offChainMetaData.name,
            };
          }),
        );
      } else {
        setNfts([]);
      }
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
  const openurl = async (method: string, mint?: string) => {
    const baseurl = 'http://192.168.0.102:8080/redirectflow';
    let url = baseurl;
    let params = {};
    let queryParams = new URLSearchParams();
    switch (method) {
      case 'nft_transfer':
        params = {
          mint_add: mint,
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
    <View style={styles.container}>
      <View style={styles.btn}>
        <Button
          onPress={() => {
            openurl('login');
          }}
          title="LOGIN"
        />
      </View>
      <View style={styles.btn}>
        <Button
          onPress={() => {
            openurl('logout');
          }}
          title="LOGOUT"
        />
      </View>

      {nfts.map(n => (
        <View style={styles.nftBtn} key={n.mint_address}>
          <Image source={{uri: n.image + ''}} style={styles.img} />
          <View style={styles.btn} key={n.mint_address}>
            <Button
              onPress={() => {
                openurl('nft_transfer', n.mint_address);
              }}
              title={'Transfer -> ' + n?.name}
            />
          </View>
        </View>
      ))}

      <View style={styles.btn}>
        <Button
          onPress={() => {
            openurl('nft_list');
          }}
          title="List NFT"
        />
      </View>
      <View style={styles.result}>
        <Text>{result}</Text>
      </View>
    </View>
  );
};
