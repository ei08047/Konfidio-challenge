// 3rd party libraries
const { v4: uuidv4 } = require('uuid');
// Own libraries
const {Operation} = require('../Operation');


module.exports.Account = class Account{

	constructor(customerId, initialBalance){
		this.AccountId = `${customerId}_${uuidv4()}`;
		this.balance = initialBalance;
		this.history = [];
		if(initialBalance > 0)
		{
			this.history.push({'operation':Operation.Deposit, 'amount':initialBalance, 'time':new Date()});
		}
	}

	getBalance(){
		return this.balance;
	}

	getHistory(){
		return this.history;
	}

	hasEnoughBalance(ammount){
		return this.balance >= ammount;
	}

	exectuteTransaction(operation,amount,targetAccount){
		switch(operation){
			case 'RECEIVE':{
				this.balance += amount;
				this.addTransactionHistory(operation, amount,targetAccount)
				break;
			}
			case 'SEND':{
				this.balance -= amount;
				this.addTransactionHistory(operation, amount,targetAccount)
				break;
			}
			default:
				break;
		}
	}

	addTransactionHistory(operation, ammount,targetAccount){
		this.history.push({'operation':operation, 'amount':ammount, 'time':new Date(), 'targetAccount':targetAccount});
	}

}


