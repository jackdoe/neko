# neko - language learning app using advancedturtle.com (including multi player mode)

Languages: Japanese, Dutch, German, Finnish, French, Italian, Spanish

Home Page: [https://neko.science](https://neko.science) 

AppStore: [iOS App](https://play.google.com/store/apps/details?id=com.neko&hl=en_GB&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1)

PlayStore: [Android App](https://play.google.com/store/apps/details?id=com.neko&hl=en_GB&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1)

!["screenshot"](https://raw.githubusercontent.com/jackdoe/neko/master/screenshot.png "screenshot")

* uses adventureturtle.com sort sentences with 0.5 probability of success
* multi player mode, where players have 1 minute to translate as many words as possible

Once we get more sentences we can tweak the classifier to get better sentences


## Japanese

* about 3000 japanese kanji extracted from http://tangorin.com/common_kanji
* 5000 japanese sentences taken from http://www.edrdg.org/wiki/index.php/Tanaka_Corpus

> need help with more beginner sengences

## Dutch, German, Finnish, French, Italian, Spanish

* 5000 random sentences from from http://www.statmt.org/europarl/
  (european parliament sessions)

### need help

Need much help with getting better sentences, now the sentences are from the european parliament sessions translations and they are too difficult for beginners

## how to contribute

you can submit pull requests containing json dump of array of
questions of the format:

```
[
  {
    "q": "some untranslated sentence",
    "a": "translation",
    "d": 1
  }
]

q: is the question
a: is the answer
d: is the difficulty

for example:

[
  {
    "q": "こんにちは世界。",
    "a": "Hello World",
    "d": 1
  }
]
```

you can also use https://neko.science/contribute/ to help you with the json



### credits

* Logo Icons made by Freepik from www.flaticon.com is licensed by CC 3.0 BY

### stack

* app is written in react native
* backend is written in java

### run
```
$ sh neko/sentences/copy.sh # to copy the sentence data in the correct directories
cd nekoapp && npm install && react-native run-ios
```
