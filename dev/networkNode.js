/*
	Blockchain prototype from scratch in nodejs
	Author: Affan Ahmed Khan
	File: networkNodes.js (API Routes)
*/

const express = require('express')
const bodyParser  = require('body-parser')
const morgan = require('morgan')
const Blockchain = require('./blockchain')
const request = require('request');
const fetch = require('node-fetch');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cors = require ('cors')

var nodePort = process.argv[2]
console.log(nodePort)


var blockchain = new Blockchain();

var app  = express();
app.use(express.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(morgan('dev'))
app.set('views', path.join(__dirname, 'views') );
app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static (__dirname + 'public') );
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

//Fetch Complete Blockchain
app.get('/blockchain',(req,res)=>{
	res.json(blockchain)
})

//Broadcast new Transaction
// app.post('/txAndBroadcast',(req,res)=>{
// 	// if clauses
// 	var txData = blockchain.createNewTx(req.body.amount,req.body.sender,req.body.receiver)
// 	blockchain.addTxToMemPool(txData)
// 	//broadcasting to all networknodes
// 	var promises = [];
// 	blockchain.networkNodes.forEach((nodeurl)=>{
// 		var apiRequest2 = {
// 			method:'POST',
// 			uri:nodeurl+'/addTx',
// 			body:{tx:txData},
// 			json:true
// 		}
// 		promises.push(request(apiRequest2))
// 	})
// 	Promise.all(promises).then((data)=>{
// 		res.json({"msg":"Txs Broadcast Successfully"})
// 	})
// })

//endpoint for receiving new transactions
// app.post('/addTx',(req,res)=>{
// 	var txData = req.body.tx
// 	blockchain.addTxToMemPool(txData)
// 	console.log("New Transaction Received")
// 	res.json({"msg":"New Transaction Received"})
// })

//Mine new block and broadcast to the network
// app.get('/mineAndBroadcast',(req,res)=>{
// 	var block = blockchain.createNewBlock();
// 	var reward = blockchain.createNewTx(12,"00000",blockchain.nodeAddress)
// 	blockchain.addTxToMemPool(reward)
// 	//broadcasting block to all networknodes
// 	var promises = [];
// 	blockchain.networkNodes.forEach((nodeurl)=>{
// 		var apiRequest2 = {
// 			method:'POST',
// 			uri:nodeurl+'/receive-new-block',
// 			body:{blockData:block},
// 			json:true
// 		}
// 		promises.push(request(apiRequest2))
// 	})
// 	Promise.all(promises).then((data)=>{
// 		//broadcasting reward transaction to all networknodes
// 		var promises2 = [];
// 		blockchain.networkNodes.forEach((nodeurl)=>{
// 			var apiRequest2 = {
// 				method:'POST',
// 				uri:nodeurl+'/addTx',
// 				body:{tx:reward},
// 				json:true
// 			}
// 			promises2.push(request(apiRequest2))
// 		})
// 		Promise.all(promises2).then((data)=>{
// 			console.log({"msg":"Block Mined and Broadcast Successfully"})
// 		})
		
// 	})
// 	res.json({'success':true,'msg':'Block Mined Successfully','block':block})
// })

//endpoint for receiving new blocks
app.post('/receive-new-block',(req,res)=>{
	var block = req.body.blockData;
	var index = blockchain.chain.length;
	var latest = blockchain.chain[index-1];
	if(latest.hash == block.previousHash && index == block.height ){
		blockchain.chain.push(block)
		blockchain.memPool = []
		res.json({"msg":"New Block Received"})
	}else{
		res.json({"msg":"Block Rejected"})
	}
})

//endpoint for registering new node in the network
// app.post('/register-node',(req,res)=>{
// 	var newNetworkNode = req.body.newNodeUrl
// 	if(blockchain.networkNodes.indexOf(newNetworkNode) == -1 && newNetworkNode != blockchain.currentNodeURL){
// 		blockchain.networkNodes.push(newNetworkNode)
// 		res.json({"msg":"Node Registered Successfully"});
// 	}else{
// 		res.json({"msg":"Registeration Failed"})
// 	}
// })

//endpoint for registering nodes in bulk in the network
app.post('/register-node-bulk',(req,res)=>{
	var bulkNodes = req.body.bulkNodes;
	bulkNodes.forEach((nodeUrl,index)=>{
		if(blockchain.networkNodes.indexOf(nodeUrl) == -1 && nodeUrl != blockchain.currentNodeURL){
			blockchain.networkNodes.push(nodeUrl)
		}
	})
	console.log({"msg":"Bulk Registration Done!"})
})

//endpoint for registering new node and broadcast it to the whole network
app.post('/register-and-broadcast',(req,res)=>{
	var newNodeURL = req.body.newNodeurl;
	if(blockchain.networkNodes.indexOf(newNodeURL) == -1 && newNodeURL != blockchain.currentNodeURL){
		blockchain.networkNodes.push(newNodeURL)
		var promises = [];

		blockchain.networkNodes.forEach((nodeurl)=>{
			console.log(nodeurl)
			var apiRequest2 = {
				method:'POST',
				url:nodeurl+'/register-node-bulk',
				body:{bulkNodes:[...blockchain.networkNodes,blockchain.currentNodeURL]},
				json:true
			}
			promises.push(request(apiRequest2))
		})
		Promise.all(promises).then((data)=>{
			console.log({"msg":"Nodes Broadcast Successfully"})
		})
	}else{
		res.json({"msg":"Registeration Failed"})
	}
})

// //check longest valid chain in the network and replace self data by longest chain data
// app.get('/consensus', (req,res)=>{
// 	var promises = [];
// 	blockchain.networkNodes.forEach(nodeurl =>{
// 		var fetch1 = fetch(nodeurl+'/blockchain').then(data=>data.json())
// 		promises.push(fetch1)
//  	})
// 	Promise.all(promises).then((blockchains) =>{
// 		var currentLongestChainLength = blockchain.chain.length;
// 		var longestChain = []
// 		var updatedMempool = []
// 		blockchains.forEach((item)=>{
// 			console.log("item")
// 			console.log(item)
// 			if(item.chain.length > currentLongestChainLength){
// 				if(blockchain.chainIsValid(item.chain)){
// 					longestChain = item.chain;
// 					console.log("longestChain")
// 					console.log(longestChain)
// 					updatedMempool = item.memPool;
// 					console.log("updatedMempool")
// 					console.log(updatedMempool)
// 					currentLongestChainLength = item.chain.length
// 				}
// 			}
// 		})
// 		if(longestChain){
// 			blockchain.chain = longestChain
// 			blockchain.memPool = updatedMempool
// 			res.json({"msg":"Blockchain Updated Successfully"})
//  		}
//  		else{
//  			res.json({"msg":"Your Blockchain is already upto date!!"})
//  		}
// 	})
// });

//running server on specific port
app.listen(nodePort,()=>{
	console.log('Server Started port listening on '+ nodePort)
})


/* Block Explorer

Routes
* /block  -> get all blocks (timestamp,hash)
* /block/:height  -> get blocks by height
* /block/:hash    -> get blocks by hash
* /txs -> get all txs
* /tx/:txhash     -> get specific tx data by tx hash
* /address/:address  -> get txs by having address in receiver or sender

*/




/* ---------------------------------------------------------------------------------------------------------------------------------------- */
/* ---------------------------------------------------------------------------------------------------------------------------------------- */

app.get('/', (req, res) => {
	return res.render('index',  {blockchain})
});
app.get('/blockchain-data', (req, res) => {
	return res.json({blockchain});
});

app.get('/mempool', (req, res) => {
	data = blockchain.showMempool()
	return res.render('mempool', {data})
});

app.get('/blocks', (req, res) => {
	data = blockchain.chain;
	return res.render('blocks', {data})
});
// app.get('/blocks', (req, res) => {
// 	data = blockchain.chain;
// 	return res.json({data})
// });

/*  ================================  */
/*      Broadcast new Transaction     */
/*  ================================  */

app.get('/add-tx', (req, res) => {
	return res.render('create_transactions')
});

app.post('/txAndBroadcast',(req, res)=>{
	console.log(req.body)
	// console.log(req.body.amount)
	// console.log(req.body.sender)
	// console.log(req.body.receiver)
	var txData = blockchain.createNewTx(req.body.amount,req.body.sender,req.body.receiver,req.body.msg)
	blockchain.addTxToMemPool(txData)
	//broadcasting to all networknodes
	var promises = [];
	blockchain.networkNodes.forEach((nodeurl)=>{
		var apiRequest2 = {
			method:'POST',
			uri:nodeurl+'/addTx',
			body:{tx:txData},
			json:true
		}
		promises.push(request(apiRequest2))
	})
	Promise.all(promises).then((data)=>{
		// res.json({"msg":"Txs Broadcast Successfully"})
	return res.render('create_transactions',  {blockLength: blockchain.chain.length, mempoolLength: blockchain.memPool.length, networkNodes: blockchain.networkNodes.length,  msg: true})

	})
})



/* ======================================================= */
/*       Mine new block and broadcast to the network       */
/* ======================================================= */
app.get('/mineAndBroadcast',(req,res)=>{
	var block = blockchain.createNewBlock();
	var reward = blockchain.createNewTx(12,"00000",blockchain.nodeAddress)
	blockchain.addTxToMemPool(reward)
	//broadcasting block to all networknodes
	var promises = [];
	blockchain.networkNodes.forEach((nodeurl)=>{
		console.log("First");
		console.log(nodeurl);

		var apiRequest2 = {
			method:'POST',
			uri:nodeurl+'/receive-new-block',
			body:{blockData:block},
			json:true
		}
		promises.push(request(apiRequest2))
	})
	Promise.all(promises).then((data)=>{
	
		//broadcasting reward transaction to all networknodes
		var promises2 = [];
		blockchain.networkNodes.forEach((nodeurl)=>{
			console.log("Second");
			console.log(nodeurl);
			var apiRequest2 = {
				method:'POST',
				uri:nodeurl+'/addTx',
				body:{tx:reward},
				json:true
			}
			promises2.push(fetch(apiRequest2))
		})
		Promise.all(promises2).then((data)=>{
			console.log({"msg":"Block Mined and Broadcast Successfully"})
		})
	})

	// return res.json({block})
	return res.render('mineAndShowBlock',  {block})
})


/* =========================================== */
/*                Verify Block                 */
/* =========================================== */
app.get('/verifyBlock', (req, res) => {
	return res.render("verifyBlock")
});

app.post('/verifyBlock', (req, res) => {
	console.log('=======>')
	height = (req.body.height)
	console.log(height)
	block = blockchain.verifyBlock(height)
	console.log(block)
	return res.render("verifyBlock", {msg : block});
});


/* =========================================== */
/*                Register Node                */
/* =========================================== */
app.post('/register-node',(req,res)=>{
	var newNetworkNode = req.body.newNodeUrl
	if(blockchain.networkNodes.indexOf(newNetworkNode) == -1 && newNetworkNode != blockchain.currentNodeURL){
		blockchain.networkNodes.push(newNetworkNode)
		return res.redirect('/')
		// res.json({"msg":"Node Registered Successfully"});
	}else{
		res.json({"msg":"Registeration Failed"})
	}
})


/* =========================================== */
/*                  Consensus                  */
/* =========================================== */
//check longest valid chain in the network and replace self data by longest chain data
app.get('/consensus', (req,res)=>{
	var promises = [];
	blockchain.networkNodes.forEach(nodeurl =>{
		var fetch1 = fetch(nodeurl+'/blockchain').then(data=>data.json())
		promises.push(fetch1)
 	})
	Promise.all(promises).then((blockchains) =>{
		var currentLongestChainLength = blockchain.chain.length;
		var longestChain = []
		var updatedMempool = []
		blockchains.forEach((item)=>{
			console.log("item")
			console.log(item)
			if(item.chain.length > currentLongestChainLength){
				if(blockchain.chainIsValid(item.chain)){
					longestChain = item.chain;
					console.log("longestChain")
					console.log(longestChain)
					updatedMempool = item.memPool;
					console.log("updatedMempool")
					console.log(updatedMempool)
					currentLongestChainLength = item.chain.length
				}
			}
		})
		if(longestChain){
			blockchain.chain = longestChain
			blockchain.memPool = updatedMempool
			// res.json({"msg":"Blockchain Updated Successfully"})
			return res.redirect('/')
			// return res.render('index', {"msg":"Blockchain Updated Successfully"})
		}
		else{
			return res.redirect('/')
			//  return res.render('index', {"msg":"Your Blockchain is already upto date!!"})
 			// res.json({"msg":"Your Blockchain is already upto date!!"})
 		}
	})
});


/* =========================================== */
/*                Register NIC                 */
/* =========================================== */
app.get("/register-my-nic", (req, res) => {
	return res.render("registerNIC")
});

app.post("/register-my-nic", (req, res) => {
	data = blockchain.registerNIC(req.body);
	blockchain.addTxToMemPool(data)
	// return res.json({data : req.body})

	return res.render("registerNIC", {msg : true})
});


/* =========================================== */
/*                Validate NIC                 */
/* =========================================== */
app.get("/validate-my-nic", (req, res) => {
	return res.render("nicVerificationForm")
});

app.post("/validate-my-nic", (req, res) => {
	data = blockchain.validateNIC(req.body);

	return res.render("nicVerificationForm", {msg : data})
});
