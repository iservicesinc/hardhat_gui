import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import NoWallet from './components/NoWallet';
import Application from './components/Application';
import QRCode from 'qrcode';

UIkit.use(Icons);

function App() {
    if (window.ethereum === undefined) return <NoWallet />;

    const [userAddress, setUserAddress] = useState(0);
    const [balance, setBalance] = useState(0);
    const [cid, setCid] = useState(null);
    const [newWallet, setNewWallet] = useState(null);
    
    useEffect(() => {
        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
        window.ethereum.on('accountsChanged', () => {
            window.location.reload();
        });
    });

    const connectWallet = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        const [account] = await provider.send('eth_requestAccounts', []);
        const wei = await provider.getBalance(account);
        const network = await provider.getNetwork();
        const CID = {
            1: 'Mainnet',
            3: 'Ropsten',
            4: 'Rinkeby',
            5: 'Goerli',
            137: 'MATIC',
            31337: 'Hardhat',
            80001: 'Mumbai',
        }
        setUserAddress(account);
        setBalance(ethers.utils.formatEther(wei));
        setCid(CID[network.chainId]);
    }

    async function generateWallet() {
        const w = [];
        const wallet = ethers.Wallet.createRandom();
        // const text = `{"address": "${wallet.address}", "mnemonic": "${wallet.mnemonic.phrase}", "key": "${wallet.privateKey}"}`
        w["address"] = wallet.address;
        w["qraddress"] = await qrCode(wallet.address);
        w["privateKey"] = wallet.privateKey;
        w["qrprivateKey"] = await qrCode(wallet.privateKey);
        w["mnemonicPhrase"] = wallet.mnemonic.phrase;
        w["qrmnemonicPhrase"] = await qrCode(wallet.mnemonic.phrase);
        setNewWallet(w);
    }

    async function qrCode(text) {
        var opts = {
            errorCorrectionLevel: 'H',
            quality: 0.3,
            margin: 1,
            color: {
                dark:"#2b2b30ff",
                light:"#dee6e8ff"
            }
        }
        data = await QRCode.toDataURL(text);
        return data;
    }

    if (userAddress === 0) {
        return (
            <div className='uk-container'>
                <div className='uk-text-center'>
                    <button className='uk-button uk-button-primary uk-button-large' onClick={generateWallet}>Generate new wallet</button>
                    {newWallet ? (
                        <>
                            <p className='uk-alert uk-alert-danger'>This data is generated on your machine, we do not transmit or store this data in any way. Print or record this data in a secure location.</p>
                            <div className='uk-child-width-expand@s uk-text-center' uk-grid='true'>
                                <div>
                                    <div className="uk-panel uk-padding">
                                        <h3>Public Address</h3>
                                        <img data-src={newWallet["qraddress"]} alt="public address" uk-img='true'/>
                                        <p className='uk-text-small uk-text-justify uk-text-break'>{newWallet["address"]}</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="uk-panel uk-padding">
                                        <h3>Private Key</h3>
                                        <img data-src={newWallet["qrprivateKey"]} alt="private key" uk-img='true' />
                                        <p className='uk-text-small uk-text-justify uk-text-break'>{newWallet["privateKey"]}</p>
                                    </div>
                                </div>
                                <div>
                                    <div className="uk-panel uk-padding">
                                        <h3>Mnemonic Phrase</h3>
                                        <img data-src={newWallet["qrmnemonicPhrase"]} alt="mnemonic phrase" uk-img='true' />
                                        <p className='uk-text-break'>{newWallet["mnemonicPhrase"]}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : ('')}
                    <ul id='newWallet' className='uk-list uk-text-justify'></ul>
                </div>
                <p className='uk-text-lead'>Connect your wallet to continue.</p>
                <button
                className='uk-button uk-button-danger uk-button-large'
                type='button'
                onClick={connectWallet}
                >
                Connect Wallet
                </button>
            </div>
        );
    }

    return <Application userAddress={userAddress} balance={balance} cid={cid} />;
}

export default App;