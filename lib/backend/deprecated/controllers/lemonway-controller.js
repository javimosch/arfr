 'use strict';

 //shared
 var urlDirectkit = "https://sandbox-api.lemonway.fr/mb/demo/dev/directkitjson2/Service.asmx/"

 // diagnostical
 //const urlDirectkit = "https://sandbox-api.lemonway.fr/mb/diagnostical/dev/directkitjson2/service.asmx/"

if(process.env.LEMON_DIRECTKIT_URL){
 urlDirectkit = process.env.LEMON_DIRECTKIT_URL;
}

 const request = require('request');
 const Promise = require('promise');
 var ctrl = require('../model/backend-controllers-manager');
 var moment = require('moment');
 const publicIp = require('public-ip');
 const uid = require('rand-token').uid;
 let login = process.env.LEMON_LOGIN,
  pass = process.env.LEMON_PASS;
 let MODULE = 'LEMONWAY';
 var logger = require('../model/logger')(MODULE);
 var commonParams = {
  "wlLogin": login,
  "wlPass": pass,
  "language": "en",
  "walletIp": "1.1.1.1",
  "walletUa": "DiagnosticalNPM",
 };

 publicIp.v4().then(ip => {
  commonParams.walletIp = ip;
 });

 module.exports = {
  registerWallet: registerWallet,
  registerCard: registerCard,
  getWalletDetails: getWalletDetails,
  moneyInWithCardId: moneyInWithCardId,
  getWalletTransHistory: getWalletTransHistory,
  sendPayment: sendPayment,

  registerWalletTest: registerWalletTest,
  registerCardTest: registerCardTest,
  getWalletDetailsTest: getWalletDetailsTest,
  moneyInWithCardIdTest: moneyInWithCardIdTest,
  moneyInWithCardIdAutoCardRegistrationTest: moneyInWithCardIdAutoCardRegistrationTest
 };


 //API EXPOSED METHODS



 //CUSTOM



 //CORE

 function sendPayment(data, callback) {
  if (!data.debitWallet) return callback({
   msg: 'debitWallet champ requis'
  });
  if (!data.creditWallet) return callback({
   msg: 'creditWallet champ requis'
  });
  if (!data.amount) return callback({
   msg: 'amount champ requis'
  });
  if (!data.message) return callback({
   msg: 'message champ requis'
  });
  if (!data.privateData) return callback({
   msg: 'privateData champ requis'
  });
  lemonway.sendPayment(data).then((r) => {
   callback(null, r);
  }, (err) => {
   callback(err);
  });
 }

 function getWalletTransHistory(data, callback) {
  if (!data.wallet) return callback({
   msg: 'wallet champ requis'
  });
  if (!data.startDate) return callback({
   msg: 'startDate champ requis'
  });
  if (!data.endDate) return callback({
   msg: 'endDate champ requis'
  });
  lemonway.getWalletTransHistory(data).then((r) => {
   callback(null, r);
  }, (err) => {
   callback(err);
  });
 }

 function registerWallet(data, callback) {
  callback = callback || (() => {});
  data.wallet = uid(5).toString().toUpperCase();
  lemonway.registerWallet(data).then((r) => {
   logger.info('LEMONWAY WALLET manual registration', data.clientMail);
   callback(null, r);
  }, (err) => {

   if (err.Code && err.Code.toString() == '204') {
    return lemonway.getWalletDetails({
     email: data.clientMail
    }).then(function(res) {
     logger.info('LEMONWAY WALLET manual registration (existing) ', data.clientMail);
     callback(null, res);
    }, function(err) {
     callback(err);
    });
   }
   callback(err);

  });
 }

 function registerCard(data, callback) {
  lemonway.registerCard(data).then(function(res) {
   callback(null, res);
  }, function(err) {
   callback(err);
  });
 }

 function getWalletDetails(data, callback) {
  lemonway.getWalletDetails(data).then(function(res) {
   callback(null, res);
  }, function(err) {
   callback(err);
  });
 }

 /*
       {
       //for payment 
       wallet: 'ESAE1',
       cardId: '7488', (optional)
       amountTot: '50.00',
       amountCom: '5.00',
       comment: "House Inspection by www.houseinspectors.fr, ORDER 24577 for client prop@fake.com (TEST)",
       // for registering card if necessary (required)
       cardType: "0", //0 CB 1 VISA 2 MasterCard
       cardNumber: "5017670000006700",
       cardCode: "123",
       cardDate: "02/2018"
   }
   */
 function moneyInWithCardId(data, callback) {

  logger.info(MODULE, ' PAYMENT ', {
   cardId: data.cardId != undefined,
   cardId_ok: data.cardId_ok
  });

  if (!data.wallet) return callback({
   msg: 'wallet champ requis'
  });
  if (!data.amountTot) return callback({
   msg: 'amountTot champ requis'
  });
  if (!data.amountCom) return callback({
   msg: 'amountTot champ requis'
  });
  if (!data.comment) return callback({
   msg: 'comment champ requis'
  });
  if (!data.cardType) return callback({
   msg: 'cardType champ requis'
  });
  if (!data.cardNumber) return callback({
   msg: 'cardNumber champ requis'
  });
  if (!data.cardCode) return callback({
   msg: 'cardCode champ requis'
  });
  if (!data.cardDate) return callback({
   msg: 'cardDate champ requis'
  });

  if (!data.cardId || !data.cardId_ok) {
   return getWalletDetails({
    wallet: data.wallet
   }, function(err, res) {
    if (err) {
     return callback(err);
    }
    else {
     logger.info(MODULE, ' PAYMENT reading CARDS from wallet ', res.WALLET.ID);

     if (res.WALLET && res.WALLET.CARDS) {
      var num = '';
      for (var x in res.WALLET.CARDS) {
       num = res.WALLET.CARDS[x].EXTRA.NUM;
       if (num.substring(num.length - 4).toString() == data.cardNumber.substring(data.cardNumber.length - 4)) {

        logger.info(MODULE, ' PAYMENT card number belongs to a registered card.');

        return moneyInWithCardId(Object.assign(data, {
         cardId: res.WALLET.CARDS[x].ID,
         cardId_ok: true
        }), callback);
       }
      }

     }
     logger.info(MODULE, ' PAYMENT card number is not a registered card, registering');
     return registerCard({
      wallet: data.wallet,
      cardType: data.cardType,
      cardNumber: data.cardNumber,
      cardCode: data.cardCode,
      cardDate: data.cardDate
     }, function(err, res) {
      if (err) {
       return callback(err);
      }
      else {
       if (res.E != null) {
        return callback(res);
       }
       else {
        return moneyInWithCardId(Object.assign(data, {
         cardId_ok: true,
         cardId: res.CARD.ID
        }), callback);
       }
      }
     });

    }
   });
  }
  else {
   data.autoCommission = data.autoCommission || 0;
   lemonway.moneyInWithCardId({
    wallet: data.wallet,
    cardId: data.cardId,
    amountTot: data.amountTot,
    amountCom: data.amountCom,
    comment: data.comment
   }).then(function(res) {
    logger.info(MODULE, ' PAYMENT CALLBACK? ', (callback != undefined), ' RES? ', (res != undefined));
    callback(null, res);
   }, function(err) {
    callback(err);
   });
  }
 }


 //TEST

 function moneyInWithCardIdAutoCardRegistrationTest(data, callback) {
  data = {
   wallet: 'PZSOK',
   amountTot: '100.00',
   amountCom: '10.00',
   comment: "House Inspection by www.houseinspectors.fr, ORDER 23577 for client prop@fake.com (TEST)",

   cardType: "0", //0 CB 1 VISA 2 MasterCard
   cardNumber: "5017670000006700",
   cardCode: "123",
   cardDate: "02/2018"
  };
  return moneyInWithCardId(data, callback);
  /* SUCCESS RESPONSE

  "__type": "WonderLib.MoneyInResult",
      "TRANS": {
          "HPAY": {
              "ID": "26242",
              "MLABEL": "501767XXXXXX6700",
              "DATE": "06/01/2017 17:38:21",
              "SEN": "",
              "REC": "PZSOK",
              "DEB": "0.00",
              "CRED": "90.00",
              "COM": "10.00",
              "MSG": "House Inspection by www.houseinspectors.fr, ORDER 23577 for client prop@fake.com (TEST)",
              "STATUS": "3",
              "EXTRA": {
                  "IS3DS": "0",
                  "CTRY": "",
                  "AUTH": "587014",
                  "NUM": null,
                  "EXP": null,
                  "TYP": null
              }
          }
      },
      "E": null

      */
 }

 function moneyInWithCardIdTest(data, callback) {
  lemonway.moneyInWithCardId({
   wallet: 'ESAE1',
   cardId: '7488',
   amountTot: '50.00',
   amountCom: '5.00',
   comment: "House Inspection by www.houseinspectors.fr, ORDER 24577 for client prop@fake.com (TEST)",
   autoCommission: '0'
  }).then(function(res) {
   callback(null, res);
  }, function(err) {
   callback(err);
  });

  //STATUS 3 if successful payment 
  /*SUCCESS RESPONSE
      "__type": "WonderLib.MoneyInResult",
      "TRANS": {
          "HPAY": {
              "ID": "26235",
              "MLABEL": "501767XXXXXX6700",
              "DATE": "06/01/2017 15:00:44",
              "SEN": "",
              "REC": "ESAE1",
              "DEB": "0.00",
              "CRED": "45.00",
              "COM": "5.00",
              "MSG": "House Inspection by www.houseinspectors.fr, ORDER 24577 for client prop@fake.com (TEST)",
              "STATUS": "3",
              "EXTRA": {
                  "IS3DS": "0",
                  "CTRY": "",
                  "AUTH": "882888",
                  "NUM": null,
                  "EXP": null,
                  "TYP": null
              }
          }
      },
      "E": null
  */
 }

 function getWalletDetailsTest(data, callback) {
  lemonway.getWalletDetails({
   wallet: 'ESAE1', //prop@fake.com
  }).then(function(res) {
   callback(null, res);
  }, function(err) {
   callback(err);
  });

  /*SUCCESS RESPONSE
  "WALLET": {
      "ID": "ESAE1",
      "BAL": "0.00",
      "NAME": "Alan LOPEZ",
      "EMAIL": "prop@fake.com",
      "DOCS": [],
      "IBANS": [],
      "STATUS": "5",
      "BLOCKED": "0",
      "SDDMANDATES": [],
      "LWID": "13493",
      "CARDS": [
          {
              "ID": "7488",
              "EXTRA": {
                  "IS3DS": "0",
                  "CTRY": "",
                  "AUTH": "850327",
                  "NUM": "501767XXXXXX6700",
                  "EXP": "02/2018",
                  "TYP": "CB"
              }
          }
      ],
      "FirstName": "Alan",
      "LastName": "LOPEZ",
      "CompanyName": "",
      "CompanyDescription": "",
      "CompanyWebsite": "",
      "isDebtor": "0",
      "payerOrBeneficiary": "0"
  },
  "E": null
  */
 }



 function registerCardTest(data, callback) {
  lemonway.registerCard({
   wallet: 'ESAE1', //prop@fake.com
   cardType: "0", //0 CB 1 VISA 2 MasterCard
   cardNumber: "5017670000006700",
   cardCode: "123",
   cardDate: "02/2018"
  }).then(function(res) {
   callback(null, res);
  }, function(err) {
   callback(err);
  });

  /*SUCCESS
  "__type": "WonderLib.RegisterCardResult",
  "CARD": {
      "ID": "7488",
      "EXTRA": {
          "IS3DS": "0",
          "CTRY": "",
          "AUTH": "850327",
          "NUM": "501767XXXXXX6700",
          "EXP": "02/2018"
      }
  },
  "E": null
  */

 }

 function registerWalletTest(data, callback) {
  lemonway.registerCard({
   wallet: id,
   clientMail: 'diag_' + id + '@diags.com',
   clientFirstName: 'Receiver ' + id,
   clientLastName: 'Fake',
   street: "26 rue de Paris",
   postCode: "93100",
   city: "Montreuil",
   phoneNumber: "339582859",
   mobileNumber: "339582234",
   isCompany: 0,
   //companyName:'()'
  }).then(function(res) {
   callback(null, res);
  }, function(err) {
   callback(err);
  })
 }

 //PRIVATE METHODS



 //LEMONWAY API WRAPPER

 var lemonway = {
  //http://documentation.lemonway.fr/api-en/directkit/money-in-credit-a-wallet/by-card/registercard-linking-a-card-number-to-a-wallet-for-one-click-payment-or-rebill
  registerWallet: function(params) {
   params["version"] = "1.1";
   return send('RegisterWallet', params);
  },
  getWalletDetails: function(params) {
   params["version"] = "2.0";
   return send('GetWalletDetails', params);
  },
  updateWalletDetails: function(params) {
   params["version"] = "1.0";
   return send('UpdateWalletDetails', params);
  },
  registerCard: function(params) {
   params["version"] = "1.2";
   return send('RegisterCard', params);
  },
  moneyInWithCardId: function(params) {
   params["version"] = "1.1";
   return send('MoneyInWithCardId', params);
  },
  sendPayment: function(params) {
   params["version"] = "1.0";
   return send('SendPayment', params);
  },
  registerIBAN: function(params) {
   params["version"] = "1.1";
   return send('RegisterIBAN', params);
  },
  moneyOut: function(params) {
   params["version"] = "1.3";
   return send('MoneyOut', params);
  },
  getWalletTransHistory: function(params) {
   params["version"] = "2.1";
   return send('GetWalletTransHistory', params);
  }
 }


 function send(methodName, postData) {
  // Configure
  for (var param in commonParams) {
   postData[param] = commonParams[param];
  }

  var options = {
   url: urlDirectkit + methodName,
   method: "POST",
   headers: {
    "Content-Type": "application/json; charset=utf-8"
   },
   json: {
    "p": postData
   }
  };

  if (process.env.QUOTAGUARDSTATIC_URL) {
   options.proxy = process.env.QUOTAGUARDSTATIC_URL;
  }

  //console.log(MODULE, 'sending ',methodName);
  //console.log(MODULE, postData);

  logger.info(MODULE, ' REQUEST ', methodName, ' ', postData);

  // Use promise to avoid callback hell
  var promise = new Promise(function(resolve, reject) {
   // Request
   request(options, function(error, response, body) {
    if (error) {
     // Handle request error
     logger.info(MODULE, ' RESPONSE ', methodName, '  REQUEST-ERROR ', error);
     reject(error);
    }
    else if (response.statusCode != 200) {
     // Handle HTTP error
     logger.info(MODULE, ' RESPONSE ', methodName, '  HTTP-ERROR ', error);
     reject({
      code: response.statusCode,
      message: body.Message
     });
    }
    else {
     if (body.d.E) {
      logger.info(MODULE, ' RESPONSE ', methodName, '  API-ERROR ', body.d.E);
      reject(body.d.E);
     }
     else {
      logger.info(MODULE, ' RESPONSE ', methodName, '  SUCCESS ', body.d);
      return resolve(body.d);
     }
    }
   });
  });

  return promise;
 }
 