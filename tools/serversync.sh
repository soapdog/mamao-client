#!/bin/sh

# the folder this script is in (*/bootplate/tools)
TOOLS=$(cd `dirname $0` && pwd)


rsync -av -e ssh $TOOLS/../deploy/www/* agarzia@andregarzia.com:public_html/apps/gomeetme

echo "Copying config.xml"
cp $TOOLS/../config.xml $TOOLS/../deploy/www

echo "Zipping"
zip -r $TOOLS/../deploy.zip $TOOLS/../deploy/*
