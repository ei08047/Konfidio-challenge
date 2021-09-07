// 3rd party libraries
// Own libraries
const {Account} = require('./account');
const {Operation} = require('../Operation');

module.exports.Bank = class Bank{
	constructor(){
		this.customers = new Map();
	}

    loadCustomers(preload){
    	this.customers = new Map(preload.map((el) => [el.id, el]))
    };


	//Create a new bank account for a customer, with an initial deposit amount
	async addNewAccount(id, initialBalance) {
		return new Promise( (resolve,reject)=>{
			let c = this.getCustomerById(id);
			if(c){
				let newAccount = new Account(c.id,initialBalance);
					if(!!c.accounts)
					{
						c.accounts.push(newAccount);
					}
					else 
					{
						c.accounts = [newAccount];
					}
					resolve(newAccount);
				}
				else {
					reject(`FAIL: customer with id=${id} does not exist.`);
				}
			})
	};

	//Transfer amounts between any two accounts, including those owned by different customers.
	async transfer(srcAccount,destAccount, amount){
		return new Promise( (resolve,reject)=>{
			let src = this.getAccount(srcAccount);
			if(src){
				let dst = this.getAccount(destAccount);
				if(dst){
					if(src.AccountId !== dst.AccountId){
						if(src.hasEnoughBalance(amount) ){
							src.exectuteTransaction(Operation.Send,amount,destAccount);
							dst.exectuteTransaction(Operation.Receive,amount,srcAccount);
							resolve(`Account ${srcAccount} sent ${amount} to account ${destAccount}`);
						}
						else {
							reject(`Account ${srcAccount} has insuficient balance`);
						}
					} else {
						reject(`Destination account cannot match source account`);
					}
				} else {
					reject(`Destination account: ${destAccount} does not exist`);
				}
			} 
			else {
				reject(`Source account: ${srcAccount} does not exist`);
			}
		})
	}

    // Retrieve balances for a given account.
	async getBalanceByAccount(account){
		return new Promise( (resolve, reject)=>{
			let obj = this.getAccount(account);
			if(obj){
				resolve(obj.getBalance());
			}
			else {
				reject('could not find account: ${account}');
			}
		})
	}

    // Retrieve balances for a given account.
	async getHistoryByAccount(account){
		return new Promise( (resolve, reject)=>{
			let obj = this.getAccount(account);
			if(obj){
				resolve(obj.getHistory());
			}
			else {
				reject(`could not find account: ${account}`)
			}
		})
	}

	getAccount(accountId){
		let [id, ...rest] = accountId.split("_");
		let curr = this.getCustomerById(parseInt(id));
		if (curr){
			let obj = curr.accounts.find(obj => obj.AccountId == accountId);
			return obj;
		} else {
			return null;
		}
	}

	customersExists(...ids){
		return ids.map((id) => this.customers.get(id)).filter(e => e)
	}

	getCustomerById(id){
		return this.customers.get(id);
	}

}