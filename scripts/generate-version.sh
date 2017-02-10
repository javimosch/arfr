echo CREATING VERSION FILE


mkdir -p ./src/smc/static/version;

if [ -d ./src/smc/static/version ]
then
    git branch > ./src/smc/static/version/index.html;
    npm run gitlog >> ./src/smc/static/version/index.html;
    echo 'Output ./src/smc/version/index.html success'
else 
  echo "Can't create './src/smc/static/version'"
fi 





