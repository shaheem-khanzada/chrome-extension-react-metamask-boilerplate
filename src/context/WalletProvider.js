import React from 'react';
import createMetaMaskProvider from 'metamask-extension-provider';
import Web3 from 'web3';
import { getNormalizeAddress } from '../utils';
import { EthereumEvents } from '../utils/events';
import storage from '../utils/storage';

export const WalletContext = React.createContext();
export const useWallet = () => React.useContext(WalletContext);

export function withWallet(Component) {
    const WalletComponent = props => (
        <WalletContext.Consumer>
            {contexts => <Component {...props} {...contexts} />}
        </WalletContext.Consumer>
    );
    return WalletComponent;
}

const WalletProvider = React.memo(({ children }) => {
    const [chainId, setChainId] = React.useState(null);
    const [account, setAccount] = React.useState(null);
    const [web3, setWeb3] = React.useState(null);
    const [isAuthenticated, setAuthenticated] = React.useState(false);
    const [appLoading, setAppLoading] = React.useState(false);

    console.log({ chainId, account, web3, isAuthenticated });

    React.useEffect(() => {
        connectEagerly();
        return () => {
            const provider = getProvider();
            unsubscribeToEvents(provider);
        }
    }, []);

    const subscribeToEvents = (provider) => {
        if (provider && provider.on) {
            provider.on(EthereumEvents.CHAIN_CHANGED, handleChainChanged);
            provider.on(EthereumEvents.ACCOUNTS_CHANGED, handleAccountsChanged);
            provider.on(EthereumEvents.CONNECT, handleConnect);
            provider.on(EthereumEvents.DISCONNECT, handleDisconnect);
        }
    }

    const unsubscribeToEvents = (provider) => {
        if (provider && provider.removeListener) {
            provider.removeListener(EthereumEvents.CHAIN_CHANGED, handleChainChanged);
            provider.removeListener(EthereumEvents.ACCOUNTS_CHANGED, handleAccountsChanged);
            provider.removeListener(EthereumEvents.CONNECT, handleConnect);
            provider.removeListener(EthereumEvents.DISCONNECT, handleDisconnect);
        }
    }

    const connectEagerly = async () => {
        const metamask = await storage.get('metamask-connected');
        if (metamask?.connected) {
            await connectWallet();
        }
    }

    const getProvider = () => {
        if (window.ethereum) {
            console.log('found window.ethereum>>');
            return window.ethereum;
        } else {
            const provider = createMetaMaskProvider();
            return provider;
        }
    }

    const getAccounts = async (provider) => {
        if (provider) {
            const [accounts, chainId] = await Promise.all([
                provider.request({
                    method: 'eth_requestAccounts',
                }),
                provider.request({ method: 'eth_chainId' }),
            ]);
            return [accounts, chainId];
        }
        return false;
    }

    const connectWallet = async () => {
        console.log("connectWallet runs....")
        try {
            const provider = getProvider();
            const [accounts, chainId] = await getAccounts(provider);
            if (accounts && chainId) {
                setAppLoading(true);
                const account = getNormalizeAddress(accounts);
                const web3 = new Web3(provider);
                setAccount(account);
                setChainId(chainId);
                setWeb3(web3);
                setAuthenticated(true);
                storage.set('metamask-connected', { connected: true });
                subscribeToEvents(provider)
            }
        } catch (e) {
            console.log("error while connect", e);
        } finally {
            setAppLoading(false);
        }
    }

    const disconnectWallet = () => {
        console.log("disconnectWallet runs")
        try {
            storage.set('metamask-connected', { connected: false });
            setAccount(null);
            setChainId(null);
            setAuthenticated(false);
            setWeb3(null);
        } catch (e) {
            console.log(e);
        }
    }

    const handleAccountsChanged = (accounts) => {
        setAccount(getNormalizeAddress(accounts));
        console.log("[account changes]: ", getNormalizeAddress(accounts))
    }

    const handleChainChanged = (chainId) => {
        setChainId(chainId);
        console.log("[chainId changes]: ", chainId)
    }

    const handleConnect = () => {
        setAuthenticated(true);
        console.log("[connected]")
    }

    const handleDisconnect = () => {
        console.log("[disconnected]")
        disconnectWallet();
    }

    return (
        <WalletContext.Provider
            value={{
                disconnectWallet,
                connectWallet,
                isAuthenticated,
                appLoading
            }}
        >
            {children}
        </WalletContext.Provider>
    )
});

export default WalletProvider
