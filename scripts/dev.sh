#node ./node_modules/concurrently/src/main.js --kill-others 'node ./lib/entry_point.js' 'node ./lib/server.js'
node ./node_modules/concurrently/src/main.js --kill-others 'nodemon ./lib/entry_point.js --watch ./configs --watch ./src/common --watch ./lib --watch ./vendor --watch .env' 'nodemon ./lib/server.js --watch ./backend --watch .env --watch ./lib' 
