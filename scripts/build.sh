echo VALIDATING .ENV 

if [ -f ./.env ] 
then
    echo "Found";
else
    echo '' > .env;
    echo "Created (placeholder)";
fi

echo BUILDING $1
PROD=1 node ./node_modules/concurrently/src/main.js --kill-others 'node ./lib/entry_point.js'
echo COPYING CONFIG
sleep 2;
node ./lib/tasks/generateReleaseConfig.js;
#echo COPYING RESOURCES
#sh ./scripts/install-prod.sh $1;
#echo CREATING VERSION FILE
#mkdir ./dist-production/version;
#git branch > ./dist-production/version/index.html;
#npm run gitlog >> ./dist-production/version/index.html;


