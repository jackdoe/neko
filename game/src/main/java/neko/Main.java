package neko;

import static spark.Spark.init;
import static spark.Spark.staticFileLocation;
import static spark.Spark.webSocket;

public class Main {

  public static void main(String[] args) {
    staticFileLocation("/public");
    webSocket("/chat", ChatWebSocketHandler.class);
    init();
  }
}
