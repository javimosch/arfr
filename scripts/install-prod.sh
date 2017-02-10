cd dist-production
echo DEBUG: copy resources from $1
cp ../src//$1/res/* -r .
cd ..