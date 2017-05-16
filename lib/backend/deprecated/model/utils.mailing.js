var mime = require('mime-types')
var fs = require('fs');
var mailgun = require('mailgun-js')({
	//apiKey: 'key-4b58a66565bdaeceeaa5c3a0b29f64f8',
	//domain: 'sandbox6495084a9e554582a14b91bf2b45baa0.mailgun.org'
	//domain: 'misitioba.com'
	
	apiKey: 'key-537daa84b8e3ea8797c895c8b5725ee0',
	domain:'diagnostical.fr'
});
var getFile = require('./utils').getFile;
var mailcomposer = require('mailcomposer');

exports.mailgun = mailgun;
exports.mailgunHTML = mailgunHTML;

exports.sendEmail = function(data, cb) {
	return mailgunHTML(data, cb);
};

function mailgunHTML(options, cb) {
	if (!options.html && options.templateUrl) {
		options.html = getFile(options.html);
	}

	var _options = {
		from: options.from,
		to: options.to,
		subject: options.subject,
		body: options.body,
		html: options.html
	};

	//attachment
	if (options.attachment) {
		if (fs.existsSync(options.attachment.path)) {
			var fileStream = fs.createReadStream(options.attachment.path);
			var fileStat = fs.statSync(options.attachment.path);
			/*var attch = new mailgun.Attachment({
				data: fileStream,
				filename: options.attachment.fileName,
				knownLength: fileStat.size,
				contentType: mime.lookup(options.attachment.path) || undefined
			});*/
			_options.attachments = [{
				filename: options.attachment.fileName,
				content: fileStream
			}]
			console.log('MAILING: Attachment File added ' + options.attachment.fileName + ' type ' + mime.lookup(options.attachment.path) || undefined);
		}
		else {
			console.log('MAILING: Attachment File not found at path ' + options.attachment.path);
		}
	}

	var mail = mailcomposer(_options);
	mail.build(function(mailBuildError, message) {
		if (mailBuildError) {
			return cb(null, {
				error: mailBuildError,
				ok: false
			});
		}
		var dataToSend = {
			to: options.to,
			message: message.toString('ascii')
		};



		console.log('MAILING: sending');
		mailgun.messages().sendMime(dataToSend, function(sendError, body) {
			console.log('MAILING: ' + ((sendError) ? "Error" : "Success"));
			cb(null, {
				message: (sendError) ? "Error" : "Success",
				result: body,
				err: sendError,
				ok: !sendError
			});
		});
	});
}