import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import UIkit from 'uikit';
import GetABI from './GetABI';

let contract = false;
if (localStorage.getItem('contract')) {
    contract = JSON.parse(localStorage.getItem('contract'));
}

function Application({userAddress, balance, cid}) {
    const [state, setState] = useState(null);
    useEffect(async () => {
        if (localStorage.getItem("caddress")) {
            const c = JSON.parse(contract);
            const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
            const Contract = new ethers.Contract(localStorage.getItem("caddress"), c.abi, provider.getSigner());
            setState(await Contract.status() ? "enabled" : "disabled");
            console.log(await Contract.status());
        }
    })

    async function uploadJson(f) {
        const fr = new FileReader();
        fr.readAsText(f.target.files[0], 'UTF-8');
        fr.onload = (e) => {
            if (e.target.result != "") {
                contract = JSON.parse(e.target.result);
                document.getElementById('uploadBtn').innerHTML = contract.contractName;
                localStorage.setItem('contract', JSON.stringify(e.target.result));
            }
        };
    }

    const setStatus = async () => {
        document.getElementById('setBtn').setAttribute('disabled', 'true');
        const c = JSON.parse(contract);
        const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        const Contract = new ethers.Contract(localStorage.getItem("caddress"), c.abi, provider.getSigner());
        const s = document.getElementById('status').value;
        console.log(s);
        await Contract.setStatus(s > 0 ? true : false);
        UIkit.notification('Contract status updated succesfully!');
        document.getElementById('setBtn').removeAttribute('disabled');
    }
    
    const withdraw = async () => {
        document.getElementById('withdraw').setAttribute('disabled', 'true');
        const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
        const Contract = new ethers.Contract(localStorage.getItem("contract"), contract.abi, provider.getSigner());
        await Contract.withdraw();
        UIkit.notification('Withdrawal requested!');
        document.getElementById('withdraw').removeAttribute('disabled');
    }

    const clearStorage = () => {
        localStorage.clear();
        window.location.reload();
    }

    async function deployContract() {
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
        localStorage.setItem('caddress', Contract.address);
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
        {!localStorage.getItem('caddress') ? (
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
                                        >Upload Contract
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
                        <p>Your contract ({JSON.parse(contract).contractName}) has already been deployed.</p>
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
                                    <select className='uk-select' name="status" id="status">
                                        <option value={0}>Disable</option>
                                        <option value={1}>Enable</option>
                                    </select>
                                    <label className='uk-form-label' htmlFor="status">Status</label>
                                </div>
                                <div className='uk-margin uk-form-controls'>
                                    <button
                                    id='setBtn'
                                    className='uk-button uk-button-primary'
                                    type='button'
                                    onClick={setStatus}
                                    >
                                    Update Status
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className='uk-card uk-card-default uk-margin-auto uk-width-xlarge'>
                    <div className='uk-card-header'>
                        <p className='uk-margin-remove uk-text-lead'>Withdraw Balance</p>
                    </div>
                    <div className='uk-card-body'>
                        <form className='uk-form'>
                            <aside id='messages'></aside>
                            <div className='uk-margin'>
                                <div className='uk-margin uk-form-controls'>
                                    <button
                                    id='withdraw'
                                    className='uk-button uk-button-danger'
                                    type='button'
                                    onClick={withdraw}
                                    >
                                    Withdraw
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <GetABI />
            </div>
        )}
        </>
    )
}

export default Application;