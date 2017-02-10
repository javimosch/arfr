mkdir -p ./src/smc/static/updated;

if [ -d ./src/smc/static/updated ]
then
    date > ./src/smc/static/updated/index.html;
    echo 'Output ./src/smc/static/updated/index.html success'
else 
  echo "Can't create './src/smc/static/updated'"
fi 