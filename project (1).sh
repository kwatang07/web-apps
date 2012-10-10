#!/bin/bash -e

PROJECT_NAME="$1"
USER="$2"
PASS="$3"
gae_dir="gae-boilerplate"
git clone https://github.com/ginotria/gae-boilerplate.git

echo $USER
echo $PASS
echo $PROJECT_NAME

mkdir $PROJECT_NAME

cp -r $gae_dir/static $PROJECT_NAME
cp -r $gae_dir/templates $PROJECT_NAME
cp $gae_dir/app.yaml $PROJECT_NAME
cp $gae_dir/index.yaml $PROJECT_NAME
cp $gae_dir/main.py $PROJECT_NAME    
  
cd $PROJECT_NAME
git init
git add .
git commit -am "initial commit"
curl -u $USER':'$PASS https://api.github.com/user/repos -d '{"name":"'$PROJECT_NAME'"}'
git remote add origin git@github.com:ginotria/$PROJECT_NAME.git
git push origin master