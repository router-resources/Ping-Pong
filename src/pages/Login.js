import React, { useState, useEffect } from 'react'
import { ethers } from 'ethers';
import abi from '../utils/PingPongportal.json'
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import './Login.css';

//  mumbai deployed address 0xa574Bb76Fb2755EF69a7708896b1A0f22bEc1Dc1
//  fuji deployed address 0xE10328f1B8eAA23eA090B7b0490435af79E4835c

function Login() {
    const [account, setAccount] = useState('login')
    const [message, setMessage] = useState('')
    const [recieved, setRecieved] = useState('')
    const [ack, setAck] = useState('')
    const [req, setReq] = useState(1)
    const [walletText, setWalletText] = useState("Connect Wallet")
    const [walletColor, setWalletColor] = useState("btn btn-danger")


    useEffect(() => {
        (async () => {
            const polygonMumbaiProvider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai");
            const contractAddress = "0xa574Bb76Fb2755EF69a7708896b1A0f22bEc1Dc1";
            const contract = new ethers.Contract(
                contractAddress,
                abi.abi,
                polygonMumbaiProvider
            )
            const data = await contract.currentRequestId();
            setReq(data)
        })()
    }, [])

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const polygonMumbaiProvider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai");
    const avalancheFujiProvider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/avalanche_fuji")
    console.log(polygonMumbaiProvider)


    const connectWallet = async () => {
        console.log('Requesting account...');
        // ❌ Check if Meta Mask Extension exists 
        if (window.ethereum) {
            console.log('detected');
            try {
                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                setAccount(accounts[0])
                setWalletText("Connected");
                setWalletColor("btn btn-success")
            } catch (error) {
                console.log('Error connecting...');
            }
        } else {
            alert('Meta Mask not detected');
        }
    }

    const handleSubmit = async () => {
        try {
            const contractAddress = "0xa574Bb76Fb2755EF69a7708896b1A0f22bEc1Dc1";
            const contract = new ethers.Contract(
                contractAddress,
                abi.abi,
                polygonMumbaiProvider
            )
            console.log(contract)
            try {
                const data = await contract.ackFromDestination(req)
                setAck(data)
            }
            catch (err) {
                console.log("calling the function" + err)
            }
        }
        catch (err) {
            console.log("outside" + err)
        }
    }

    const sendPingFromSourceChain = async () => {
        const signer = provider.getSigner();
        const contractAddress = "0xa574Bb76Fb2755EF69a7708896b1A0f22bEc1Dc1";
        const contract = new ethers.Contract(
            contractAddress,
            abi.abi,
            signer
        );
        const pingTransaction = await contract.pingDestination(0, "43113", 200000, 200000, "0xE10328f1B8eAA23eA090B7b0490435af79E4835c", message, 1000000000000);
        console.log("pingTransactionKey:", pingTransaction)
    }

    const receivePongToDestinationChain = async () => {
        const polygonMumbaiProvider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai");
        const contractAddress1 = "0xa574Bb76Fb2755EF69a7708896b1A0f22bEc1Dc1";
        const contract1 = new ethers.Contract(
            contractAddress1,
            abi.abi,
            polygonMumbaiProvider
        )
        const data = await contract1.currentRequestId();
        setReq(data)
       // const signer = provider.getSigner()
        const contractAddress = "0xE10328f1B8eAA23eA090B7b0490435af79E4835c";
        const contract = new ethers.Contract(
            contractAddress,
            abi.abi,
            avalancheFujiProvider
        );
        contract.pingFromSource(0, "80001", req).then((data) => {
            setRecieved(data)
        }).catch(() => {
            alert('connect to Fuji Network')
        })
    }

    return (
        <>
            <br />
            <button type="button" style={{ 'width': '10em', 'height': '3em' }} className={`connect-wallet ${walletColor}`} onClick={connectWallet}>
                {walletText}
            </button>
            <div className="main">
                <div className="card" style={{ 'width': '20em' }}>
                    <div className="card-header">
                        Mumbai Testnet
                    </div>
                    <div className="card-body">
                        <textarea className="form-control" id="textAreaExample2" rows="4" onChange={(e) => {
                            setMessage(e.target.value)
                        }} />
                        <br>
                        </br>
                        <button type="button" className="btn btn-success" onClick={sendPingFromSourceChain}>Send Message</button>
                        <br></br>
                        <br></br>
                        <textarea value={ack} className="form-control" id="textAreaExample2" rows="4" onChange={(e) => {
                            setMessage(e.target.value)
                        }} />
                        <br></br>
                        <button type="button" className="btn btn-success" onClick={handleSubmit}>Acknowledgement</button>
                    </div>
                </div>
                <div className="card" style={{ 'width': '20em' }}>
                    <div className="card-header">
                        Fuji Testnet
                    </div>
                    <div className="card-body">
                        <textarea value={recieved} className="form-control" id="textAreaExample2" rows="4" onChange={(e) => { setMessage(e.target.value) }} />
                        <br></br>
                        <button type="button" className="btn btn-success" onClick={receivePongToDestinationChain}>Message Recieved</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Login