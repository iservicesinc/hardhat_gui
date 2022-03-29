import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import NoWallet from './components/NoWallet';
import Application from './components/Application';

UIkit.use(Icons);

function App() {
    if (window.ethereum === undefined) return <NoWallet />;

    const [userAddress, setUserAddress] = useState(0);
    const [balance, setBalance] = useState(0);
    const [cid, setCid] = useState(null);
    
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

    if (userAddress === 0) {
        return (
            <>
                <h2 className='uk-heading-small'>Please connect your wallet.</h2>
                <button
                className='uk-button uk-button-danger uk-button-large'
                type='button'
                onClick={connectWallet}
                >
                Connect Wallet
                </button>
            </>
        );
    }

    return <Application userAddress={userAddress} balance={balance} cid={cid} />;
}

export default App;