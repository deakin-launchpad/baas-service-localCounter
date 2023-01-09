import async from "async";
import UniversalFunctions from "../../utils/universalFunctions.js";
const ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
import { connectToAlgorand, getBlockchainAccount, checkOptIn,createSignSendTransactionLocalState, respondToServer } from "../../helpers/helperFunctions.js";

/**
 * @param {Object} payloadData
 * @param {String} payloadData.operation 
 * @param {Function} callback
 */
const counter = (payloadData, callback) => {
	const data = payloadData.dataFileURL.json;
	const customers = [data.myAccount];
	const operation = data.operation;
	const parameters = [data.number];
	let account;
	let algoClient;
	let transaction;

	const appIndex = 149326844;
	const tasks = {
		connectToBlockchain: (cb) => {
			algoClient = connectToAlgorand("", "https://testnet-api.algonode.cloud", 443);
			if (!algoClient) return cb(ERROR.APP_ERROR);
			cb();
		},
		getBlockchainAccount: (cb) => {
			account = getBlockchainAccount();
			if (!account) return cb(ERROR.APP_ERROR);
			cb();
		},
		checkAdditionalAddress: (cb) =>{
			if (!customers) return cb(ERROR.APP_ERROR);
			cb(); 
		},
		optInStatusCheck: (cb) =>{
			checkOptIn(algoClient, customers, appIndex, cb);
		},
		createSignAndSendTxn: (cb) => {
			createSignSendTransactionLocalState(algoClient, account, appIndex, transaction, operation, parameters, customers, cb);
		},

		response: (cb) => {
			respondToServer(payloadData, cb);
		},
	};
	async.series(tasks, (err, result) => {
		if (err) return callback(err);
		return callback(null, { result });
	});
};

export default counter;
