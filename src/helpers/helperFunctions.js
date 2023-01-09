import algosdk, { encodeUint64 } from "algosdk";
import axios from "axios";

/**
 *
 * @param {String} token
 * @param {String} server
 * @param {Number} port
 */
export function connectToAlgorand(token, server, port) {
	console.log("=== CONNECT TO NETWORK ===");
	const algoClient = new algosdk.Algodv2(token, server, port);
	return algoClient;
}

export function getBlockchainAccount() {
	console.log("=== GET ACCOUNT ===");
	const account = algosdk.mnemonicToSecretKey(process.env.MNEMONICA);
	console.log("Account: " + account.addr);
	return account;
}


/**
 *
 * @param {Object} customers
 * @param {String} appIndex
 * @param {Callback} cb
 */
export async function checkOptIn(algoClient, customers, appIndex, cb) {
	console.log("=== Check OptIn ===");
	let accAppInfomation;
	for (let i = 0; i < customers.length; i++) {
		await algoClient.accountApplicationInformation(customers[i], appIndex).do().then((accAppInfo) => {
			accAppInfomation = accAppInfo;
			console.log(accAppInfomation);
		}).catch((e) => {
			return cb(e);
		});
	}
	return cb();
}

/**
 *
 * @param {String} algoClient
 * @param {Object} account
 * @param {Number} appIndex
 * @param {Object} transaction
 * @param {String} operation
 * @param {Object} parameter
 * @param {Object} customer
 * @param {any} signedTx
 * @param {Callback} cb
 */
export async function createSignSendTransactionLocalState(algoClient, account, appIndex, transaction, operation, parameter, customers, cb) {
	console.log("=== CREATE AND SIGN TRANSACTION ===");
	let suggestedParams, appArgs, signedTx, txnId;
	await algoClient
		.getTransactionParams()
		.do()
		.then((value) => {
			suggestedParams = value;
			appArgs = [new Uint8Array(Buffer.from(operation))];
			for (let i = 0; i < parameter.length; i++) {
				switch (typeof (parameter[i])) {
					case "string":
						appArgs.push(new Uint8Array(Buffer.from(parameter[i])))
						break;
					case "number":
						appArgs.push(new encodeUint64(parseInt(parameter[i])))
						break;
				}
			}
			console.log(appArgs);
			transaction = algosdk.makeApplicationNoOpTxn(account.addr, suggestedParams, appIndex, appArgs, customers);
			signedTx = algosdk.signTransaction(transaction, account.sk);
		}).catch((e) => {
			return cb(e);
		});
	console.log(" === SEND TRANSACTION === ");
	await algoClient
		.sendRawTransaction(signedTx.blob)
		.do()
		.then((_txnId) => {
			txnId = _txnId;
			console.log(txnId);
			return cb();
		})
		.catch((e) => {
			return cb(e);
		});
}

/**
 *
 * @param {String} algoClient
 * @param {any} callback
 */

/**
 *
 * @param {Object} payloadData
 * @param {any} cb
 */
export function respondToServer(payloadData, cb) {
	console.log("=== RESPOND TO SERVER ===");
	let service = payloadData;
	let destination = service.datashopServerAddress + "/api/job/updateJob";
	let lambdaInput = {
		insightFileURL: service.dataFileURL,
		jobid: service.jobID,
	};
	axios.put(destination, lambdaInput).catch((e) => {
		cb(e);
	});
	console.log("=== JOB RESPONDED ===");
	return;
}

