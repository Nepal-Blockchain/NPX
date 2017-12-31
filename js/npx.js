
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */

"use strict";
var NPX = {
	Discord: 'https://discord.gg/erQQCuM',
	CryptoAPI: "//api.coinmarketcap.com/v1/",
	NRBForex: "//runkit.io/nepalbitcoin/nrb-forex-json/0.0.2",
	loading: document.getElementById("loading"),
	list : new List("table-wrap", {
		valueNames: ['RANK', 'COIN', 'NPR','USD','BTC', 'VOL', 'CAP', 'SUPPLY', 'H1', 'H24','D7', 'RS1'],
		page: 13,
		indexAsync: true,
		pagination: [{
			innerWindow:5,
			left:5,
			right:5,
			outerWindow: 2
		}]
	}),
	DATA:{},
	init: function(){
		this.CoinMarketCap("ticker");
	},
	D3Table: function(_data){

	},
	fetchOpts: { 
		method: 'GET',
		headers: new Headers(),
		mode: 'cors',
		cache: 'force-cache'
	},
	getNRBForex:function(){
		fetch(this.NRBForex, this.fetchOpts)
		.then((NRB) => {
			return this.fetchStatus(NRB);
		}).then((forex) => {
			//var USD = forex.result.Conversion.Currency[1];
			//this.USDNPR = ((parseFloat(USD.TargetBuy) + parseFloat(USD.TargetSell)) / 2).toFixed(4);
			//console.log(this.USDNPR);
			//this.coincap("front");
		})
		.catch((err) => {
			console.log(err);
			this.loading.innerHTML = "<h3>Error while loading market data..<p>Please check your internet connection & refresh this page. <br> Contact " + this.Discord + " for feature request &or bug report.</p></h3>";
		});
	},
	CoinMarketCap:function(_api){
		this.loading.innerHTML = "<h3>Loading crypto market data from <a href='https://coinmarketcap.com' target='_blank'>coinmarketcap.com</a></h3>";
		fetch(this.CryptoAPI+_api+"/?convert=INR&limit=101", this.fetchOpts)
		.then((response) => {
			return this.fetchStatus(response);
		})
		.catch((err) => {
			console.log(err);
		})
		.then((data) => {
			this.loading.innerHTML = "";
			switch(_api){
				case "global" :{
					this.cmcGlobal(data);
				}
				break;
				case "ticker":{
					this.frontPage(data);
				}
				break;
				default:{
					console.log(data);
				}		
				break;
			}
		})
		.catch((err) => {
			console.log(err);
			this.loading.innerHTML = "<h3>Error while loading market data..<p>Please check your internet connection & refresh this page. <br> Contact " + this.Discord + " for feature request &or bug report.</p></h3>";
		});
	},
	cmcGlobal:function(data){
		var cap = this.neNumber(data.total_market_cap * 1.60075);
		document.getElementById("total_market_cap").innerHTML = '<h4 title="'+cap[1]+'">Total Market Cap : ' + (cap[0] * 1.60075).toFixed(0)+'</h4>';
		
	},
	frontPage: function(data){
		var tdx ='';
		var _data=[];
		var cryptoTable = document.getElementById("cryptoList");
		var c = 0;
		data.forEach((coin) => {
			for (var [key, value] of Object.entries(coin)) {
				if(value === null){
					return;
					//coin[key] = (value === null ? 0: value);
				}
			}
			var price = parseFloat(coin.price_inr) * 1.60075;
			var vol = parseFloat(coin["24h_volume_inr"]) * 1.60075;
			var cap = parseFloat(coin.market_cap_inr) * 1.60075;
			var rs1 = parseFloat(1 / price);
			tdx += this.makeTable([
				coin.rank,
				coin.name,
				coin.symbol,
				price.toFixed(price < 1 ? 8 : 2),
				parseFloat(coin.price_usd).toFixed(coin.price_usd < 1 ? 8 : 2),
				parseFloat(coin.price_btc).toFixed(coin.price_btc < 1 ? 8 : 0),
				vol.toFixed(0),
				cap.toFixed(0),
				parseFloat(coin.total_supply).toFixed(0),
				coin.percent_change_1h,
				coin.percent_change_24h,
				coin.percent_change_7d,
				(rs1).toFixed(rs1 < 1 ? 8 : 2)
				]);
			c++;
		});
		cryptoTable.innerHTML = tdx;
		this.list.reIndex();
		this.list.update();
		this.list.sort('VOL', { order: "desc" })
		document.getElementById("logo").src = "nepalbitcoin.jpeg";
	},
	makeTable: function(_d){
		var d3 = this.neNumber(_d[3]);
		var d4 = this.neNumber(_d[4]);
		var d5 = this.neNumber(_d[5]);
		var d6 = this.neNumber(_d[6]);
		var d7 = this.neNumber(_d[7]);
		var out = '<tr id="'+_d[2]+'"><td class="RANK">'+_d[0]+'</td><td class="COIN">'+_d[1]+'</td><td class="NPR" title="रु. '+d3[2]+'">'+d3[0]+'</td><td class="USD" title="$ '+d4[2]+'">'+d4[0]+'</td><td class="BTC" title="'+d5[2]+'">'+d5[0]+'</td><td class="VOL" title="रु. '+d6[2]+'">'+d6[0]+'</td><td class="CAP" title="रु. '+d7[2]+'">'+d7[0]+'</td><td class="SUPPLY" title="'+_d[8]+' '+_d[2]+'">'+_d[8]+' '+_d[2]+'</td><td class="H1 '+ (Number(_d[9]) < 0 ? "down" : "up") + '">'+_d[9]+'%</td><td class="H24 '+ (Number(_d[10]) < 0 ? "down" : "up") + '">'+_d[10]+'%</td><td class="D7 '+ (Number(_d[11]) < 0 ? "down" : "up") + '">'+_d[11]+'%</td><td class="NPR1">'+_d[12]+'</td></tr>';
		return out;
	},
	fetchStatus : function(res){
		console.log(res);
		if (res.status >= 200 && res.status < 300) {
				//console.log(res.json());
				return res.json();
			} else {
				var error = new Error(res.statusText);
				error.res = res;
				throw error;
			}
		},
		neNumber : new NeNum().convert,
	};
	NPX.init();
