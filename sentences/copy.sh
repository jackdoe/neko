#!/bin/bash
base=`dirname $0`
mkdir -p $base/../game/src/main/resources/sentences
mkdir -p $base/../nekoapp/app/data/sentences

for lang in `ls -1 $base/ | grep '^..$'`; do
    node $base/merge.js $base/$lang > /tmp/$$.tmp
    cp /tmp/$$.tmp $base/../game/src/main/resources/sentences/${lang}.json
    cp /tmp/$$.tmp $base/../nekoapp/app/data/sentences/${lang}.json
done
