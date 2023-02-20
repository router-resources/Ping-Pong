import React,{useState,useEffect} from 'react'
import { ethers } from 'ethers';
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
// 0xf078259544740e9CA50ed6d73763e02E9D809819
import './Login.css';




function Login() {
    const [account,setAccount]=useState('login')
    const [message,setMessage]=useState('')
    const [recieved,setRecieved]=useState('')
    const [ack,setAck]=useState('')
    const [req,setReq]=useState(1)
    const [walletText,setWalletText]=useState("Connect Wallet")
   const [walletColor,setWalletColor]=useState("btn btn-danger")
    const abi=[
        
            {
                "inputs": [
                    {
                        "internalType": "address payable",
                        "name": "gatewayAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "uint64",
                        "name": "_destGasLimit",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "_ackGasLimit",
                        "type": "uint64"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "constructor"
            },
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "message",
                        "type": "string"
                    }
                ],
                "name": "CustomError",
                "type": "error"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint64",
                        "name": "requestId",
                        "type": "uint64"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "ackMessage",
                        "type": "string"
                    }
                ],
                "name": "AckFromDestination",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint64",
                        "name": "eventIdentifier",
                        "type": "uint64"
                    },
                    {
                        "indexed": false,
                        "internalType": "bool",
                        "name": "isSuccess",
                        "type": "bool"
                    }
                ],
                "name": "ExecutionStatus",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint64",
                        "name": "requestId",
                        "type": "uint64"
                    }
                ],
                "name": "NewPing",
                "type": "event"
            },
            {
                "anonymous": false,
                "inputs": [
                    {
                        "indexed": true,
                        "internalType": "uint64",
                        "name": "srcChainType",
                        "type": "uint64"
                    },
                    {
                        "indexed": true,
                        "internalType": "string",
                        "name": "srcChainId",
                        "type": "string"
                    },
                    {
                        "indexed": true,
                        "internalType": "uint64",
                        "name": "requestId",
                        "type": "uint64"
                    },
                    {
                        "indexed": false,
                        "internalType": "string",
                        "name": "message",
                        "type": "string"
                    }
                ],
                "name": "PingFromSource",
                "type": "event"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint64",
                        "name": "",
                        "type": "uint64"
                    }
                ],
                "name": "ackFromDestination",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "ackGasLimit",
                "outputs": [
                    {
                        "internalType": "uint64",
                        "name": "",
                        "type": "uint64"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "currentRequestId",
                "outputs": [
                    {
                        "internalType": "uint64",
                        "name": "",
                        "type": "uint64"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "destGasLimit",
                "outputs": [
                    {
                        "internalType": "uint64",
                        "name": "",
                        "type": "uint64"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "gatewayContract",
                "outputs": [
                    {
                        "internalType": "contract IGateway",
                        "name": "",
                        "type": "address"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint64",
                        "name": "eventIdentifier",
                        "type": "uint64"
                    },
                    {
                        "internalType": "bool[]",
                        "name": "execFlags",
                        "type": "bool[]"
                    },
                    {
                        "internalType": "bytes[]",
                        "name": "execData",
                        "type": "bytes[]"
                    }
                ],
                "name": "handleCrossTalkAck",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "bytes",
                        "name": "srcContractAddress",
                        "type": "bytes"
                    },
                    {
                        "internalType": "bytes",
                        "name": "payload",
                        "type": "bytes"
                    },
                    {
                        "internalType": "string",
                        "name": "srcChainId",
                        "type": "string"
                    },
                    {
                        "internalType": "uint64",
                        "name": "srcChainType",
                        "type": "uint64"
                    }
                ],
                "name": "handleRequestFromSource",
                "outputs": [
                    {
                        "internalType": "bytes",
                        "name": "",
                        "type": "bytes"
                    }
                ],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint64",
                        "name": "chainType",
                        "type": "uint64"
                    },
                    {
                        "internalType": "string",
                        "name": "chainId",
                        "type": "string"
                    },
                    {
                        "internalType": "uint64",
                        "name": "destGasPrice",
                        "type": "uint64"
                    },
                    {
                        "internalType": "uint64",
                        "name": "ackGasPrice",
                        "type": "uint64"
                    },
                    {
                        "internalType": "address",
                        "name": "destinationContractAddress",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "str",
                        "type": "string"
                    },
                    {
                        "internalType": "uint64",
                        "name": "expiryDurationInSeconds",
                        "type": "uint64"
                    }
                ],
                "name": "pingDestination",
                "outputs": [],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint64",
                        "name": "",
                        "type": "uint64"
                    },
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    },
                    {
                        "internalType": "uint64",
                        "name": "",
                        "type": "uint64"
                    }
                ],
                "name": "pingFromSource",
                "outputs": [
                    {
                        "internalType": "string",
                        "name": "",
                        "type": "string"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "address",
                        "name": "a",
                        "type": "address"
                    }
                ],
                "name": "toBytes",
                "outputs": [
                    {
                        "internalType": "bytes",
                        "name": "b",
                        "type": "bytes"
                    }
                ],
                "stateMutability": "pure",
                "type": "function"
            }
        
]
  
useEffect(async() => {
    const provider1 = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai");
    const contractAddress = "0x9fF2c6D8bFf3b87538A156Ea1a768ec5A2d55B32";


  const contract = new ethers.Contract(
    contractAddress,
    abi,
    provider1
)
const data=await contract.currentRequestId();
setReq(data)
}, [])

const provider = new ethers.providers.Web3Provider(window.ethereum);
const provider1 = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai");
const provider2= new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/avalanche_fuji")
console.log(provider1)

const handleSubmit=async ()=>{
    
    try{
        const contractAddress = "0x9fF2c6D8bFf3b87538A156Ea1a768ec5A2d55B32";


  const contract = new ethers.Contract(
    contractAddress,
    abi,
    provider1
)
console.log(contract)

try
  {
    const data=await contract.ackFromDestination(req)
  
    setAck(data)

   
    }
    catch(err){
        console.log("calling the function"+err)
    }
}
    catch(err){
        console.log("outside"+err)
    }
  

        
}

  return (

    <div>
        <br/>
        <button type="button" style={{'width':'10em','height':'3em','margin-left':'30em'}} class={walletColor} onClick={async()=>{
         
         console.log('Requesting account...');
     
         // ❌ Check if Meta Mask Extension exists 
         if(window.ethereum) {
           console.log('detected');
     
           try {
             const accounts = await window.ethereum.request({
               method: "eth_requestAccounts",
             });
             alert(accounts[0])
             setWalletText("Connected");
             setWalletColor("btn btn-success")
           } catch (error) {
             console.log('Error connecting...');
           }
     
         } else {
           alert('Meta Mask not detected');
         }
       
     
   }}>
     {walletText}
     
   </button>
    <div class="main">
    
      
        <div class="card" style={{'width':'20em'}}>
  <div class="card-header">
    Mumbai Testnet
  </div>
  <div class="card-body">
    
    <textarea class="form-control" id="textAreaExample2" rows="4" onChange={(e)=>{
            setMessage(e.target.value)
        }}/>
        <br></br>
       
    
     <button type="button" class="btn btn-success" onClick={async()=>{
              const signer = provider.getSigner();

           

            const contractAddress = "0x9fF2c6D8bFf3b87538A156Ea1a768ec5A2d55B32";
            
            const contract = new ethers.Contract(
                contractAddress,
                abi,
               signer
            );
            
            contract.pingDestination(0,"43113",200000,200000,"0xf7015AD80B60EA4A9e12d90ff00D68fAa8e08df4",message,1000000000000).then(()=>{
                
            })
            
     
            
          
            
        }}>Send Message</button>
        <br></br>
        <br></br>
        <textarea value={ack} class="form-control" id="textAreaExample2" rows="4" onChange={(e)=>{
            setMessage(e.target.value)
        }}/>
       
        <br></br>
   
        <button type="button" class="btn btn-success" onClick={
            handleSubmit
    }>Acknowledgement</button>
  </div>
</div>
     
        <div class="card" style={{'width':'20em'}}>
  <div class="card-header">
    Fuji Testnet
  </div>
  <div class="card-body">
  <textarea value={recieved} class="form-control" id="textAreaExample2" rows="4" onChange={(e)=>{
            setMessage(e.target.value)
        }}/>

 

<br></br> 
       <button type="button" class="btn btn-success" onClick={async()=>{
                   const provider1 = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon_mumbai");
                   const contractAddress1 = "0x9fF2c6D8bFf3b87538A156Ea1a768ec5A2d55B32";
               
               
                 const contract1 = new ethers.Contract(
                   contractAddress1,
                   abi,
                   provider1
               )
               const data=await contract1.currentRequestId();
             
               setReq(data)
              const signer = provider.getSigner()
           
            
            const contractAddress = "0xf7015AD80B60EA4A9e12d90ff00D68fAa8e08df4";
            
            const contract = new ethers.Contract(
                contractAddress,
                abi,
                provider2
            );
            
            contract.pingFromSource(0,"80001",req).then((data)=>{
               
                setRecieved(data)
            }).catch(()=>{
                alert('connect to Fuji Network')
            })
            
            
        }}>Message Recieved</button>
        
  </div>
</div>
        
     
           </div>
           </div>
  )
}

export default Login