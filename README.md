# `Ping Pong`

> Effortlessly Send and Receive Messages across Blockchains with Ping-Pong Dapp Built with ReactJS and Router Cross-Talk.

🚀DEMO: https://ping-pong-9f9af.web.app/

This project is built with [Router CrossTalk](https://dev.routerprotocol.com/crosstalk-library/overview/introduction)

Router Protocol is a solution introduced to address the issues hindering the usability of cross-chain liquidity migration in the DeFi ecosystem. It acts as a bridge connecting various layer 1 and layer 2 blockchains, allowing for the flow of contract-level data across them. The Router Protocol can either transfer tokens between chains or initiate operations on one chain and execute them on another.

Please check the [official documentation of Router Protocol](https://www.routerprotocol.com/) 

![Ping-Pong](https://firebasestorage.googleapis.com/v0/b/ping-pong-9f9af.appspot.com/o/Demo2.gif?alt=media&token=43933f12-3b85-4dcb-884c-e936a9d704ff)

# ⭐️ `Star us`

If this repository helps you build cross-chain dapps faster and easier - please star this project, every star makes us very happy!

# 🤝 `Need help?`

If you need help or have other some questions - don't hesitate to write in our discord channel and we will check asap. [Discord link](https://discord.gg/xvx2pFu9). The best thing about this is the super active community ready to help at any time! We help each other.

# 🚀 `Quick Start`

📄 Clone or fork `ping-pong`:

```sh
git clone https://github.com/protocol-designer/ping-pong.git
```

💿 Install all dependencies:

```sh
cd cross-chat-main
npm install
```

🚴‍♂️ Run your App:

```sh
npm start
```
# 🧭 `Table of contents`
- [🚀 Quick Start](#-quick-start)
- [🧭 Table of contents](#-table-of-contents)
- [🏗 Frontend](#React JS, Ether.js)
  - [`Basic imports and Setting up Providers`](#Basic-imports-and-Setting-up-Providers)
  - [`Creating a WalletConnect Button`](#Creating-a-WalletConnect-Button)
  - [`Sending message to the Desination Chain`](#Sending-message-to-the-Desination-Chain)
  - [`Fetching Received message from Destination Chain`](#Fetching-Received-message-from-Destination-Chain)
  - [`Fetching Acknowledgement from the source chain`](#Fetching-Acknowledgement-from-the-source-chain)
 
- [🏗 Backend](#Solidity, Router Cross-Talk Library)
  - [`Initiating the Contract`](#Initiating-the-Contract)
  - [`Creating state variables and the constructor`](#Creating-state-variables-and-the-constructor)
  - [`Sending a message to the destination chain`](#Sending-a-message-to-the-destination-chain)
  - [`Handling a crosschain request`](#Handling-a-crosschain-request)
  - [`Handling the acknowledgement received from destination chain`](#Handling-the-acknowledgement-received-from-destination-chain)
  
# 🏗 Frontend


  
# 🏗 Backend
  
### `Initiating the Contract`

For initiating the smart contract named "PingPong", the contract imports three external contracts :-

1. **ICrossTalkApplication.sol**

2. **Utils.sol**

3. **IGateway.sol**

The "ICrossTalkApplication.sol", "Utils.sol" and "IGateway.sol" contracts are imported from the "evm-gateway-contract/contracts" The "PingPong" contract implements the "ICrossTalkApplication" contract by inheriting from it. This means that the "PingPong" contract must have all the functions and variables defined in the "ICrossTalkApplication" contract. By importing and implementing these contracts, the "CrossChat" contract will have access to their functionality and will be compatible with other contracts that follow the same standards.

```sh
//SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

import "evm-gateway-contract/contracts/IGateway.sol";
import "evm-gateway-contract/contracts/ICrossTalkApplication.sol";
import "evm-gateway-contract/contracts/Utils.sol";
```
### `Creating State Variables and the Constructor`

state variables and events are defined for the contract in the Solidity programming language. The code defines the following:

A public state variable **gatewayContract** of type "address" is created to store the address of the gateway contract. This contract will be responsible for routing messages to the Router Chain.

A public state variable **greeting** of type "string" is created. This variable will store a message that will be set on the destination chain when a "message" is received.

A public state variable **lastEventIdentifier** of type "uint64" is created. This variable will store the nonce for the cross-chain transaction generated by the Gateway contract. This will be used to verify the nonce when the acknowledgment is received from the destination chain.

A public state variable **destGasLimit** of type "uint64" is created. This variable indicates the amount of gas required to execute the function that will handle the cross-chain request on the destination chain. This value can be easily calculated using a gas estimator such as the "hardhat-gas-reporter" plugin.

A public state variable **ackGasLimit** of type "uint64" is created. This variable indicates the amount of gas required to execute the callback function that will handle the acknowledgment received from the destination chain. This value can be easily calculated using a gas estimator such as the "hardhat-gas-reporter" plugin.

A custom error **CustomError** is created, which can be used to throw custom errors.

An event **ExecutionStatus** is created with parameters "uint64 eventIdentifier" and "bool isSuccess". This event will be emitted when the acknowledgment is received and handled by the source chain.

An event **ReceivedSrcChainIdAndType** is created with parameters "uint64 chainType" and "string chainID". This event will be emitted when the acknowledgment is received and handled by the source chain.

A constructor is created with the parameters "address payable gatewayAddress", "uint64 _destGasLimit", and "uint64 _ackGasLimit". The constructor sets the values of the "gatewayContract", "destGasLimit", and "ackGasLimit" state variables using the provided parameters.

```sh
address public gatewayContract;
string public greeting;
uint64 public lastEventIdentifier;
uint64 public destGasLimit;
uint64 public ackGasLimit;

error CustomError(string message);
event ExecutionStatus(uint64 eventIdentifier, bool isSuccess);
event ReceivedSrcChainIdAndType(uint64 chainType, string chainID);

constructor(
	address payable gatewayAddress, 
	uint64 _destGasLimit, 
	uint64 _ackGasLimit
) {
  gatewayContract = gatewayAddress;
	destGasLimit = _destGasLimit;
	ackGasLimit = _ackGasLimit;
}
```

### `Sending a message to the destination chain`

**pingDestination Function**:-

This function initiates a cross-chain transaction to a specified destination contract on a different blockchain network. The function accepts various input parameters, including the type and ID of the destination blockchain network, the gas price for executing the transaction on the destination network, the gas price for an acknowledgement to be sent back to the source network, the destination contract's address, a string payload, and an expiry duration for the transaction.

Here is a breakdown of the input parameters:

1. **chainType**: an unsigned 64-bit integer representing the type of the destination blockchain network (e.g., Ethereum, Cosmos, Polkado, etc.)

2. **chainId**: a string representing the unique identifier of the destination blockchain network (e.g., network ID, network name, etc.)

3. **destGasPrice**: an unsigned 64-bit integer representing the gas price in Wei (the smallest unit of ether) for executing the transaction on the destination network.

4. **ackGasPrice**: an unsigned 64-bit integer representing the gas price in Wei for an acknowledgement to be sent back to the source network

5. **destinationContractAddress**: a bytes array representing the address of the destination contract on the destination network
 
6. **str**: a string representing the payload of the transaction to be executed on the destination contract

7. **expiryDurationInSeconds**: an unsigned 64-bit integer representing the duration in seconds until the transaction expires

The function then creates a byte array containing the string payload using the abi.encode() function and calculates the expiry timestamp by adding the current block timestamp to the expiry duration. It then creates a Utils.DestinationChainParams struct containing the destination gas limit, gas price, chain type, and chain ID, and a Utils.AckGasParams struct containing the acknowledgement gas limit and gas price.

Finally,since we want to create only a single request to the destination chain it calls the CrossTalkUtils.singleRequestWithAcknowledgement() function, passing in the gatewayContract address, expiry timestamp, acknowledgement type, acknowledgement gas parameters, destination chain parameters, destination contract address, and payload. The function is marked as payable, which means it can receive Ether as part of the transaction.

```sh
  function pingDestination(
  uint64 chainType,
  string memory chainId,
  uint64 destGasPrice,
  uint64 ackGasPrice,
  bytes memory destinationContractAddress,
  string memory str,
  uint64 expiryDurationInSeconds
) public payable returns (uint64) {
  bytes memory payload = abi.encode(str);
  uint64 expiryTimestamp = uint64(block.timestamp) + expiryDurationInSeconds;
  Utils.DestinationChainParams memory destChainParams=
          Utils.DestinationChainParams(
	    destGasLimit, 
            destGasPrice, 
            chainType, 
            chainId
	);

  Utils.AckType ackType = Utils.AckType.ACK_ON_SUCCESS;
  Utils.AckGasParams memory ackGasParams = Utils.AckGasParams(ackGasLimit, ackGasPrice);
  
  CrossTalkUtils.singleRequestWithAcknowledgement(
      gatewayContract,
      expiryTimestamp,
      ackType,
      ackGasParams,
      destChainParams,
      destinationContractAddress,
      payload
  );
}
```
### `Handling a crosschain request`

**handleRequestFromSource function:-**

The function is designed to handle a request that originates from a source chain , passes through a router chain, and arrives at the contract on a destination blockchain.

The function takes four parameters:

1. **srcContractAddress**: the address of the source contract that initiated the request.
 
2. **payload**: a byte array that contains the payload of the request.
 
3. **srcChainId**: a string that represents the ID of the source blockchain.

4. **srcChainType**: an unsigned 64-bit integer that represents the type of the source blockchain.
The function is marked as "external" and "override", meaning that it can be called from outside the contract and it overrides a function with the same name and signature in the contract it inherits from.

The function first checks that the caller of the function is the "gatewayContract" by using the "require" statement. If the caller is not the gateway contract, the function will stop executing and return an error.

The function then decodes the "payload" parameter into a string variable called "sampleStr". It checks if the string is empty by comparing its hash to the hash of an empty string using the "keccak256" function. If the string is empty, the function will stop executing and return a custom error message.

If the string is not empty, the function will set the value of a global variable called "greeting" to the value of the "sampleStr" variable.

Finally, the function will return a byte array that contains the "srcChainId" and "srcChainType" parameters encoded using the "abi.encode" function.

 ```sh
 function handleRequestFromSource(
  bytes memory srcContractAddress,
  bytes memory payload,
  string memory srcChainId,
  uint64 srcChainType
) external override returns (bytes memory) {
  require(msg.sender == gatewayContract);

  string memory sampleStr = abi.decode(payload, (string));

  if (
    keccak256(abi.encodePacked(sampleStr)) == keccak256(abi.encodePacked(""))
  ) {
    revert CustomError("String should not be empty");
  }
  greeting = sampleStr;
  return abi.encode(srcChainId, srcChainType);
}
```
 
### `Handling the acknowledgement received from destination chain`

**handleCrossTalkAck function:-**

This function handles the acknowledgement sent by the destination chain to the source chain after a successful cross-chain communication. The function takes three parameters: the event identifier, a boolean array of execution flags, and a byte array of execution data. It is an external view function and is marked as an override of a parent contract's function.

The function first checks that the event identifier passed in as the first parameter matches the lastEventIdentifier variable, which is a state variable tracking the most recent cross-chain communication event. If the event identifier does not match, the function will revert.

Next, the function decodes the first element of the execData array, which is assumed to be a byte array. The decoded bytes are then further decoded as a tuple of a string and a uint64, representing the chain ID and chain type of the source chain that initiated the cross-chain communication.

After decoding the execution data, the function emits two events. The first event is an **ExecutionStatus** event that emits the event identifier and the first element of the execFlags array as parameters. The second event is a **ReceivedSrcChainIdAndType** event that emits the chain type and chain ID of the source chain as parameters.

1. **if the execution was successful on the destination chain:**
    
    We will get [true] in execFlags and [abi.encode(abi.encode(sourceChainType, sourceChainId))] in execData as we sent this as return value in handleRequestFromSource function.
    
2. **If the execution failed on the destination chain:**
    
    We will get [false] in execFlags and [errorBytes] in execData where error bytes correspond to the error that was thrown on the destination chain contract

```sh
function handleCrossTalkAck(
    uint64 eventIdentifier,
    bool[] memory execFlags,
    bytes[] memory execData
  ) external view override {
    require(lastEventIdentifier == eventIdentifier);
		bytes memory _execData = abi.decode(execData[0], (bytes));

    (string memory chainID, uint64 chainType) = abi.decode(
      _execData,
      (string, uint64)
    );
		
    emit ExecutionStatus(eventIdentifier, execFlags[0]);
	
    emit ReceivedSrcChainIdAndType(chainType, chainID);
  }
  ```
