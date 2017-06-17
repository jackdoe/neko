#!/bin/bash
base=`dirname $0`
mkdir -p $base/../game/src/main/resources/sentences
mkdir -p $base/../nekoapp/app/data/sentences

for lang in `ls -1 $base/ | grep '^..$'`; do
    rsync -r $base/$lang $base/../game/src/main/resources/sentences/

    for level in `ls -1 $base/$lang`; do
        cat $base/$lang/$level/*.json | json -g > $base/../nekoapp/app/data/sentences/${lang}_${level}.json
    done
done
