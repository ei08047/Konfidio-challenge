// 3rd party libraries
const http = require("http")
const url = require('url');
const querystring = require('querystring');
// own libraries
const customers = require('./data/customers')
const bankFW = require('./controllers/bank');
// init controller
let bank = new bankFW.Bank();
bank.loadCustomers(customers);

const server = http.createServer( async (req, res)=> {
	// config response header
	res.setHeader('Content-Type','application/json');
	res.statusCode = 200;

	let parsedRouteUrl = url.parse(req.url);
	let requiredQueryString = querystring.parse(parsedRouteUrl.query);

	// example: newAccount?id=1&initialBalance=1500
	if(parsedRouteUrl.pathname === '/newAccount' && req.method === 'PUT')
	{
		
		const { id, initialBalance } = requiredQueryString;
		let newAccountResult = bank.addNewAccount(parseInt(id),initialBalance)
			.then(
				(result) => { 
				 return {'internalStatus':'success', 'message':result};
				},
				(error) => { 
				 return {'internalStatus':'fail', 'message':error};
				}
			);
		res.write(JSON.stringify(await newAccountResult) );
		res.end();
	}
	// example: /transfer?srcAccount={{account A}}&dstAccount={{account B}}&amount=300
	else if(parsedRouteUrl.pathname === '/transfer' && req.method === 'POST')
	{
		const {srcAccount, dstAccount, amount} = requiredQueryString;
		let transferResult = bank.transfer(srcAccount,dstAccount, amount)
				.then(
					(result) => { 
					 return {'internalStatus':'success', 'message':result};
					},
					(error) => { 
					 return {'internalStatus':'fail', 'message':error};
					}
				);
		res.write(await transferResult);
		res.end();
	}
	//example: /balances/{{account A}}
	else if (parsedRouteUrl.pathname.match(/\/balances\/(\d+_\w+-\w+-\w+-\w+-\w+)/) && req.method === 'GET'){
		let captures = parsedRouteUrl.pathname.match(/\/balances\/(\d+_\w+-\w+-\w+-\w+-\w+)/)
		let balanceResult = bank.getBalanceByAccount(captures[1])
						.then(
							(result) => { 
							 return {'internalStatus':'success', 'message':result};
							},
							(error) => { 
							 return {'internalStatus':'fail', 'message':error};
							}
						);
		res.write(JSON.stringify(await balanceResult));
		res.end()
	}
		// example: /history/{{account A}}
		else if (parsedRouteUrl.pathname.match(/\/history\/(\d+_\w+-\w+-\w+-\w+-\w+)/) && req.method === 'GET'){
		let captures = parsedRouteUrl.pathname.match(/\/history\/(\d+_\w+-\w+-\w+-\w+-\w+)/)
		let historyResult = bank.getHistoryByAccount(captures[1])
						.then(
							(result) => { 
							 return {'internalStatus':'success', 'message':result};
							},
							(error) => { 
							 return {'internalStatus':'fail', 'message':error};
							}
						);
		res.write(JSON.stringify(await historyResult));
		res.end()
	}
	else {
		res.statusCode = 500;
		res.write(`could not find route: ${parsedRouteUrl}`);
		res.end();
	}

} ).on('error', function(e)
{  
      console.log("Got error: " + e.message);   
});

// config server variables
const PORT = process.env.PORT || 9001
// start server
server.listen(PORT, () => console.log(`server running on port ${PORT}`))