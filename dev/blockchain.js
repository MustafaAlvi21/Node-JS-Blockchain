/*
	Blockchain prototype from scratch in nodejs
	Author: Affan Ahmed Khan
	File: blockchain.js
*/

var sha256 = require('sha256')
var uuid = require('uuid');
var url = process.argv[3]

//Constructor function initating blockchain structure
function Blockchain(){
	this.chain = [];
	this.memPool = [];
	this.generateGenesis(); /// Creates Genesis Block only once
	this.currentNodeURL = url
	this.networkNodes = [];
	this.nodeAddress = uuid.v4().split('-').join('')
}

Blockchain.prototype.generateGenesis = function(){
	var block = {
		'height': 0,
		'timestamp':'1610783475068',
		'transactions':[],
		'previousHash':'0',
		'hash':'0',
		'nonce':'100'
	}
	this.chain.push(block)
	this.memPool = [];
	console.log('Genesis Block Created ')
	return block;	
}

Blockchain.prototype.createNewBlock = function() {
	if(this.chain.length == 0){
		previousHash = null
	}else{
		previousHash = this.chain[this.chain.length-1].hash;
	}
	var nonce = this.proofOfWork(previousHash,this.memPool)
	var hash = this.blockHashing(previousHash,this.memPool,nonce)
	var block = {
		'height': this.chain.length,
		'timestamp':Date.now(),
		'transactions':this.memPool,
		'previousHash':previousHash,
		'hash':hash,
		'nonce':nonce
	}
	this.chain.push(block)
	this.memPool = [];
	console.log('New Block Added with block height '+block.height)
	return block;
};

Blockchain.prototype.blockHashing = function(previousHash,blockData,nonce){
	blockString = previousHash + JSON.stringify(blockData) + nonce;
	return sha256(blockString);
}

Blockchain.prototype.proofOfWork = function(previousHash,blockData){
	var nonce = 0;
	var hash = this.blockHashing(previousHash,blockData,nonce);
	while(hash.substring(0,4) != '0000'){
		nonce++
		hash = this.blockHashing(previousHash,blockData,nonce);
		//console.log(hash)
	}
	return nonce;
}

Blockchain.prototype.verifyBlock = function(height){
	if(this.chain.length < height){
		return {msg : "No block with this height"}
	}
	if(height == 0){
		return {msg : "Its a Genius"}
	}
	var block = this.chain[height];
	console.log("block")
	console.log(block)
	var hash = this.blockHashing(block.previousHash,block.transactions,block.nonce);
	if(hash == block.hash){
		return true
	}else{
		return false;
	}
}

Blockchain.prototype.getLastBlock = function (){
	var index = this.chain.length
	return this.chain[index-1];
}

Blockchain.prototype.createNewTx =  function(amount,sender,receiver, msg){
	msg = toString(msg)
	// console.log(typeof msg)
	msg = sha256(msg);
	// console.log( msg)

	var tx = {
		'timestamp':Date.now(),
		'amount':amount,
		'receiver':receiver,
		'sender':sender,
		'txHash':uuid.v4().split('-').join(''),
		'msg' : (typeof msg != "undefined" ? msg : "No")
	}
	return tx;
}

Blockchain.prototype.addTxToMemPool = function(txData){
	this.memPool.push(txData);
	return 'tx Added';
}

Blockchain.prototype.getTxsOfBlock = function(height) {
	var block = this.chain[height]
	if(block){
		return block.transactions;
	}else{
		return 'Block Not Found';
	}	
};

Blockchain.prototype.chainIsValid = function(blockchain){
	var validChain = true;
	for (var i = 1; i < blockchain.length; i++) {
		if(blockchain[i].height != i) validChain = false;
		if(blockchain[i-1].hash != blockchain[i].previousHash) validChain = false;
		if(this.blockHashing(blockchain[i].previousHash,blockchain[i].transactions,blockchain[i].nonce) != blockchain[i].hash) validChain = false;
	}
	if(blockchain[0].hash != '0' || blockchain[0].previousHash != '0' || blockchain[0].nonce != '100'){
		validChain = false;
	}
	return validChain
}






/* ----------------------------------------------------------------------------------------------------------------------------------- */
/* ----------------------------------------------------------------------------------------------------------------------------------- */

Blockchain.prototype.showMempool = function() {
	return this.memPool
};

Blockchain.prototype.registerNIC = function (msg) {
	console.log("msg")
	console.log(msg)
	msg = JSON.stringify(msg);
	msg = sha256(msg)
	console.log("msg  hash")
	console.log(msg)

	var tx = {
		'timestamp':Date.now(),
		'txHash':uuid.v4().split('-').join(''),
		'msg' : msg
	}
	return tx;
}

Blockchain.prototype.validateNIC = function (msg) {
	msg = JSON.stringify(msg);
	msg = sha256(msg);

	let result = this.memPool.find( a => a.msg == msg );
	console.log("result")
	console.log(result)
	console.log("result")
	
	result = result ? true : false; 

	return result;
}





module.exports = Blockchain;