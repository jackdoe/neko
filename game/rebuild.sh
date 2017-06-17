#!/bin/bash
base=`dirname $0`
sudo docker kill $(sudo docker ps | grep 4567 | cut -f 1 -d ' ') # no memory for everything :)
cd $base/../sentences && sh copy.sh && cd -
cd $base/../nekoapp && webpack --progress -p && cd -

mvn clean package
sudo docker build . -t neko

sudo docker run -d -e "VIRTUAL_HOST=neko.science,www.neko.science" -e "LETSENCRYPT_HOST=neko.science,www.neko.science" -e "LETSENCRYPT_EMAIL=jack@prymr.nl" neko
