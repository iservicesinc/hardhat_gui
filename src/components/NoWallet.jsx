function NoWallet() {
    return (
        <>
            <h2 className='uk-heading-small'>No Wallet Detected</h2>
            <p>Please install a web3 wallet such as MetaMask to continue.</p>
            <a
            className='uk-button uk-button-danger uk-button-large'
            href='https://metamask.io/download/'
            rel='noopener noreferrer nofollow'>
            INSTALL METAMASK
            </a>
        </>
    )
}

export default NoWallet