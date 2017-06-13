### neko - flashcard app for learning ~500 japanese words

!["screenshot"](https://raw.githubusercontent.com/jackdoe/neko/master/screenshot.png "screenshot")


```
convert JMdict_e.gz to json and then extract some words from words.json.gz to smaller dictionary

cd convert         && \
  npm install      && \
  node convert.js  && \
  node relevant.js # this will create nekoapp/app/data/edict.json

and then just run the app

cd nekoapp && npm install && react-native run-ios
```