package neko;

import static spark.Spark.get;
import static spark.Spark.init;
import static spark.Spark.staticFileLocation;
import static spark.Spark.webSocket;

import com.fasterxml.jackson.databind.ObjectMapper;

public class Main {
  private static ObjectMapper mapper = new ObjectMapper();

  public static class Stats {

    public int totalGames;
  }

  public static void main(String[] args) {
    Sentence.load();
    staticFileLocation("/public");
    webSocket("/chat", ChatWebSocketHandler.class);
    get(
        "/stat",
        (req, res) -> {
          res.status(200);
          res.type("application/json");
          return mapper.writeValueAsString(new Game.Stats());
        });
    init();
  }
}
