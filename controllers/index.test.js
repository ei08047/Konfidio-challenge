const {Bank} = require('./bank');
const assert = require('assert').strict;
const customers = require('../data/customers');
const {Operation} = require('../Operation');

describe("create new accounts", function() {

    beforeEach(async function () {
        this.bank = new Bank();
        this.bank.loadCustomers(customers);
        this.accountA = await this.bank.addNewAccount(1,100);
    	this.accountB = await this.bank.addNewAccount(1,200);
    	this.accountC = await this.bank.addNewAccount(2,300);
    	this.customerA = this.bank.getCustomerById(1);
    	this.customerB = this.bank.getCustomerById(2);
    });


    it("check number of created accounts", async function() {
        assert.strictEqual(this.customerA.accounts.length, 2);
        assert.strictEqual(this.customerB.accounts.length, 1);
    });

    it("check initial balance of created accounts", async function() {
    	let balA = await this.bank.getBalanceByAccount(this.accountA.AccountId);
    	let balB = await this.bank.getBalanceByAccount(this.accountB.AccountId);
    	let balC = await this.bank.getBalanceByAccount(this.accountC.AccountId);
        assert.strictEqual(balA, 100);
        assert.strictEqual(balB, 200);
        assert.strictEqual(balC, 300);
    });
});



describe("transfers between accounts with diferent customers", function() {
	
    beforeEach(async function () {
    	this.initialBalanceA = 100;
    	this.initialBalanceB = 200;
    	this.initialBalanceC = 300;
        this.bank = new Bank();
        this.bank.loadCustomers(customers);
        this.accountA = await this.bank.addNewAccount(1,this.initialBalanceA);
    	this.accountB = await this.bank.addNewAccount(1,this.initialBalanceB);
    	this.accountC = await this.bank.addNewAccount(2,this.initialBalanceC);
    	this.customerA = this.bank.getCustomerById(1);
    	this.customerB = this.bank.getCustomerById(2);
    });


    it("transfer fails due to insuficient balance", async function() {
    	let amountGreaterThanBalance = 101;
		let res = this.bank.transfer(this.accountA.AccountId,this.accountB.AccountId, amountGreaterThanBalance)
		.then(
				(result) => { 
				 console.log(result);
				},
				(error) => { 
				 return error;
				}
			);
		let balA = await this.bank.getBalanceByAccount(this.accountA.AccountId);
    	let balB = await this.bank.getBalanceByAccount(this.accountB.AccountId);   
		assert.equal(await res, `Account ${this.accountA.AccountId} has insuficient balance`);
		assert.strictEqual(balA, this.initialBalanceA);
		assert.strictEqual(balB, this.initialBalanceB);
    });

    it("sucessfull transfers", async function() {
        let amountAtoB = 100;
        let amountCtoB = 50;
		let res1 = this.bank.transfer(this.accountA.AccountId,this.accountB.AccountId, amountAtoB)
		.then(
				(result) => { 
				 return result;
				},
				(error) => { 
				 return error;
				}
			);
		let res2 = this.bank.transfer(this.accountC.AccountId,this.accountB.AccountId, amountCtoB)
		.then(
				(result) => { 
				 return result;
				},
				(error) => { 
				 return error;
				}
			);

		let balA = await this.bank.getBalanceByAccount(this.accountA.AccountId);
    	let balB = await this.bank.getBalanceByAccount(this.accountB.AccountId);
    	let balC = await this.bank.getBalanceByAccount(this.accountC.AccountId); 
		assert.equal(await res1, `Account ${this.accountA.AccountId} sent ${amountAtoB} to account ${this.accountB.AccountId}`);
		assert.equal(await res2, `Account ${this.accountC.AccountId} sent ${amountCtoB} to account ${this.accountB.AccountId}`);
		assert.strictEqual(balA, this.initialBalanceA-amountAtoB);
		assert.strictEqual(balB, this.initialBalanceB+amountAtoB+amountCtoB);
		assert.strictEqual(balC, this.initialBalanceC-amountCtoB);
    });
});

describe("check transactions", function() {
	
    beforeEach(async function () {
    	this.initialBalanceA = 100;
    	this.initialBalanceB = 200;
    	this.initialBalanceC = 300;
        this.bank = new Bank();
        this.bank.loadCustomers(customers);
        this.accountA = await this.bank.addNewAccount(1,this.initialBalanceA);
    	this.accountB = await this.bank.addNewAccount(1,this.initialBalanceB);
    	this.accountC = await this.bank.addNewAccount(2,this.initialBalanceC);
    	this.amountAtoB = 100;
        this.amountCtoB = 50;
		await this.bank.transfer(this.accountA.AccountId,this.accountB.AccountId, this.amountAtoB);
		await this.bank.transfer(this.accountC.AccountId,this.accountB.AccountId, this.amountCtoB);
    });

    it("could not find account", async function() {
    	let fakeUuid = 'FAKE-UUID';
		let hisA = this.bank.getHistoryByAccount(fakeUuid)		
		.then(
				(result) => { 
				 return result;
				},
				(error) => { 
				 return error;
				}
			);
		assert.strictEqual(await hisA, `could not find account: ${fakeUuid}`);
    });

    it("check transaction history", async function() {
		let hisA = await this.bank.getHistoryByAccount(this.accountA.AccountId);
		assert.strictEqual(hisA[0].operation, Operation.Deposit);
		assert.strictEqual(hisA[0].amount, this.initialBalanceA);
		assert.strictEqual(hisA[1].operation, Operation.Send);
		assert.strictEqual(hisA[1].amount, this.amountAtoB);
		assert.strictEqual(hisA[1].targetAccount, this.accountB.AccountId);
    });

});