java -Xmx512m -Xms256m -cp $(find target/dependency/* -type f -name '*.jar' | tr "\n" ":"):target/game-1.0-SNAPSHOT.jar neko.Main
