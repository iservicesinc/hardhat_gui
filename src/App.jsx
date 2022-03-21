import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import UIkit from 'uikit';
import Icons from 'uikit/dist/js/uikit-icons';
import MetaMask from './metamask-fox.svg';

UIkit.use(Icons);

function App() {
    if (window.ethereum === undefined) {
        return (
            <>
                <h2 className='uk-heading-small'>No Wallet Detected</h2>
                <p>Please install a web3 wallet such as MetaMask to continue.</p>
                <a
                className='uk-button uk-button-danger uk-button-large'
                href='https://metamask.io/download/'
                rel='noopener noreferrer nofollow'>
                <img className="uk-text-middle uk-padding-small uk-padding-remove-left" src={MetaMask} /> 
                INSTALL METAMASK
                </a>
            </>
        );
    }

    const [userAddress, setUserAddress] = useState(0);
    const [balance, setBalance] = useState(0);
    const [cid, setCid] = useState(null);
    const [contract, setContract] = useState(null);
    const [state, setState] = useState(null);
    useEffect(async () => {
        const c = JSON.parse(localStorage.getItem('contract'));
        const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        const Contract = new ethers.Contract(localStorage.getItem("address"), c.abi, provider.getSigner());
        setState(await Contract.status() ? "enabled" : "disabled");
    })
    
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
            10: 'Optimism',
            42: 'Kovan',
            56: 'BSC',
            137: 'MATIC',
            31337: 'Hardhat',
            42161: 'Arbitrum One',
            43114: 'Avalanche',
            80001: 'Mumbai',
        }
        setUserAddress(account);
        setBalance(ethers.utils.formatEther(wei));
        setCid(CID[network.chainId]);
    }

    const uploadJson = async (f) => {
        const fr = new FileReader();
        fr.readAsText(f.target.files[0], 'UTF-8');
        fr.onload = (e) => {
            if (e.target.result != "") {
                setContract(JSON.parse(e.target.result));
                localStorage.setItem("contract", JSON.stringify(JSON.parse(e.target.result)));
            }
        }
    }

    const deployContract = async () => {
        const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        document.getElementById('deployBtn').innerHTML = "Deploying contract...";
        document.getElementById('deployBtn').setAttribute('disabled', 'true');
        const cURI = document.getElementById('contractURI').value;
        const bURI = document.getElementById('baseURI').value;
        const Factory = new ethers.ContractFactory(contract.abi, contract.bytecode, provider.getSigner());
        const Contract = await Factory.deploy(cURI, bURI);
        await Contract.deployTransaction.wait();
        console.log(Contract.deployTransaction);
        UIkit.notification('Contract deployed succesfully!');
        document.getElementById('messages').innerHTML = "Contract address: " + Contract.address;
        localStorage.setItem("address", Contract.address);
    }

    const setStatus = async () => {
        document.getElementById('setBtn').setAttribute('disabled', 'true')
        const c = JSON.parse(localStorage.getItem('contract'));
        const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        const Contract = new ethers.Contract(localStorage.getItem("address"), c.abi, provider.getSigner());
        const s = document.getElementById('status').value;
        await Contract.setStatus(s === true ? true : false);
        UIkit.notification('Contract status updated succesfully!');
        document.getElementById('setBtn').removeAttribute('disabled');
    }
    
    const clearStorage = () => {localStorage.clear()}

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

    return (
        <>
            <div className='uk-container uk-child-width-1-2@s uk-flex uk-flex-center'>
                <div className='uk-card uk-card-primary'>
                    <div className='uk-card-header'>
                        <p className='uk-margin-remove uk-text-lead'>Connected wallet</p>
                    </div>
                    <div className='uk-card-body uk-padding-remove-top'>
                        <p className='uk-margin-remove uk-text-muted uk-text-truncate'>{userAddress}</p>
                        <p className='uk-margin-remove uk-text-muted'>Network: {cid}</p>
                        <p className='uk-margin-remove uk-text-muted'>Balance: {balance}</p>
                    </div>
                </div>
            </div>
            {!localStorage.getItem("address") ? (
            <div className='uk-container uk-child-width-1-2@s uk-flex uk-flex-center'>
                <div className='uk-card uk-card-default'>
                    <div className='uk-card-header'>
                        <p className='uk-margin-remove uk-text-lead'>Deploy new contract</p>
                    </div>
                    <div className='uk-card-body'>
                        <form className='uk-form'>
                            <aside id='messages'></aside>
                            <div className='uk-margin'>
                                <div className='uk-margin uk-form-controls'>
                                    <div uk-form-custom='true'>
                                        <input type="file" onChange={uploadJson} />
                                        <button
                                        id='uploadBtn'
                                        className="uk-button uk-button-default"
                                        type="button"
                                        tabIndex={-1}
                                        >
                                        {contract ? (
                                            contract.contractName
                                        ) : (
                                            "Upload Contract"
                                        )}
                                        </button>
                                    </div>
                                </div>
                                <p className='uk-text-meta'>The following inputs set the Contract URI and Base URI for the constructor.</p>
                                <div className='uk-margin uk-form-controls'>
                                    <label className='uk-form-label' htmlFor="contractURI">Contract URI</label>
                                    <input className='uk-input uk-text-center' type='text' name='contractURI' id='contractURI' placeholder='ipfs://123abc123abc123abc123abc123' />
                                    <p className='uk-text-meta uk-margin-remove'>Enter the path to a contract level json object.</p>
                                </div>
                                <div className='uk-margin uk-form-controls'>
                                    <label className='uk-form-label' htmlFor="baseURI">Base URI</label>
                                    <input className='uk-input uk-text-center' type='text' name='baseURI' id='baseURI' placeholder='ipfs://123abc123abc123abc123abcdef/' />
                                    <p className='uk-text-meta uk-margin-remove'>Enter the path to the token metadata ending with a trailing slash.</p>
                                </div>
                                <div className='uk-margin uk-form-controls'>
                                    <button
                                    id='deployBtn'
                                    className='uk-button uk-button-primary'
                                    type='button'
                                    onClick={deployContract}
                                    >
                                    Deploy Contract
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            ) : (
            <div className='uk-container uk-flex uk-flex-center uk-flex-column'>
                <div className='uk-card uk-card-default uk-margin-auto uk-width-xlarge'>
                    <div className='uk-card-header'>
                        <p className='uk-margin-remove uk-text-lead'>Contract Deployed</p>
                        <p className='uk-text-muted uk-text-truncate'>{localStorage.getItem('address')}</p>
                    </div>
                    <div className='uk-card-body'>
                        <p>Your contract ({JSON.parse(localStorage.getItem('contract')).contractName}) has already been deployed.</p>
                        <p>If you wish to deploy a new contract you will need to clear your browsers local storage.</p>
                        <button className='uk-button uk-button-danger' onClick={clearStorage}>Clear Local Storage</button>
                    </div>
                </div>
                <div className='uk-card uk-card-default uk-margin-auto uk-width-xlarge'>
                    <div className='uk-card-header'>
                        <p className='uk-margin-remove uk-text-lead'>Set Status</p>
                        <p className='uk-margin-remove uk-text-muted'>current status is {state}</p>
                    </div>
                    <div className='uk-card-body'>
                        <form className='uk-form'>
                            <aside id='messages'></aside>
                            <div className='uk-margin'>
                                <div className='uk-margin uk-form-controls'>
                                    <input className='uk-checkbox uk-margin-right' type="checkbox" name="status" id="status" value={true} />
                                    <label className='uk-form-label' htmlFor="status">Status</label>
                                    <p className='uk-text-meta uk-margin-remove'>Checked = enabled, unchecked = disabled.</p>
                                </div>
                                <div className='uk-margin uk-form-controls'>
                                    <button
                                    id='setBtn'
                                    className='uk-button uk-button-primary'
                                    type='button'
                                    onClick={setStatus}
                                    >
                                    Submit
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            )}
        </>
    );
}

export default App