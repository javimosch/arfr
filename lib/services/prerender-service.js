/*
var decodeURIComponent = require(path.join(process.cwd(), 'backend/model/utils')).decodeURIComponent;
	controllers._co(function*() {
				var result = yield controllers.prerender.getAll({
					appName: APP_NAME
				});
				//Logger.debugTerminal('PRERENDER VIEWS FOR ', CURRENT_APP_NAME, result);

				if (result) {
					result.forEach(function(item) {
						if (item._doc.name == undefined) return;
						item.url = "/" + replaceAll(item._doc.name, '--', '/');
						app.get(item.url, function(req, res, next) {
							console.log('SERVER GET PRERENDER', item.url);
							res.send(decodeURIComponent(item._doc.content));
						});
						console.log('SERVER PRERENDER ROUTE', item.url);
					});
				}

				redirectToAngular();

				resolve();

			}, redirectToAngular, Logger);
			*/