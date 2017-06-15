FROM java:8

COPY target/dependency /app/dependency

ARG CACHEBUST=1
EXPOSE 4567
COPY target/game-1.0-SNAPSHOT.jar /app/game.jar
CMD java -Xmx400m -Xms256m -XX:NewRatio=1 -XX:+PrintGCDetails -XX:+PrintGCTimeStamps -cp $(find /app/dependency/* -type f -name '*.jar' | tr "\n" ":"):/app/game.jar neko.Main
