var path = require("path");
var express = require('express');

exports.configure = (app)=>{


	app.use('/tpl', express.static(__dirname + '/'));
	console.log('TEMPLATE-ROUTES-OK');

	/*
	app.get('/template/order-client',(req,res)=>{
		var filePath = '/templates/order-client.html';
		res.sendFile(path.join(__dirname+filePath));	
	});
*/

	
}