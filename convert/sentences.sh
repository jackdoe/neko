#!/bin/bash
gzcat sentences.raw.utf.gz | grep "A: " | head -5000 |  sed -e 's/^A: //g' | sed -e 's/#ID.*//g' | sed -e 's/"/\\\"/g' | awk -F'\t' '{ print "{\"q\":\"" $1 "\",\"a\":\"" $2 "\"},"}' | tr "\n" " "> /tmp/$$.sentences
echo -n '[' > /tmp/$$.begin
echo -n ']' > /tmp/$$.end
cat /tmp/$$.begin /tmp/$$.sentences /tmp/$$.end | sed -e 's/, ]$/]/g' > ../nekoapp/app/data/sentences.json
rm -f /tmp/$$.begin /tmp/$$.sentences /tmp/$$.end
cp ../nekoapp/app/data/sentences.json ../game/src/main/resources/sentences.json
