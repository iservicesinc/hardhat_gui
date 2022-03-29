import { ethers } from 'ethers'
import UIkit from "uikit"

function GetABI() {
    const contract = JSON.parse(localStorage.getItem('contract'))
    const provider = new ethers.providers.Web3Provider(window.ethereum, 'any');
    const Contract = new ethers.Contract(localStorage.getItem("caddress"), JSON.parse(contract).abi, provider.getSigner());
    
    return (
        <div id='abi' className='uk-container uk-width-xlarge uk-margin-top uk-margin-auto'>
            <h2>CONTRACT ABI</h2>
            <ul className="uk-list">
                {JSON.parse(contract).abi.map((d, i) => (
                    <li key={i} className='uk-card uk-card-body uk-text-justify'>
                        <h3 className="uk-margin-remove">{d.name}()</h3>
                        <p className="uk-text-muted uk-margin-remove">type: {d.type}</p>
                        <p className="uk-text-muted uk-margin-remove">stateMutability: {d.stateMutability}</p>
                        <h4 className="uk-margin-remove">@params:</h4>
                        {d.inputs.map((f, i) => (
                            <p key={i} className="uk-margin-remove">{f.name}, {f.type}</p>
                        ))}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default GetABI
