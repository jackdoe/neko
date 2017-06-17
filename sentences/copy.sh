#!/bin/bash
base=`dirname $0`
for i in `ls -1 $base/*.json`; do
    cat $base/$i |  json_pp --json_opt=canonical,pretty > /tmp/$$.json
    cp /tmp/$$.json $base/../game/src/main/resources/$i
    cp /tmp/$$.json $base/../nekoapp/app/data/$i
    rm /tmp/$$.json
done
