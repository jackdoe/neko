mvn clean package
sudo docker build . -t neko
sudo docker kill $(sudo docker ps | grep 4567 | cut -f 1 -d ' ')
sudo docker run -d -e "VIRTUAL_HOST=neko.science,www.neko.science" -e "LETSENCRYPT_HOST=neko.science,www.neko.science" -e "LETSENCRYPT_EMAIL=jack@prymr.nl" neko
