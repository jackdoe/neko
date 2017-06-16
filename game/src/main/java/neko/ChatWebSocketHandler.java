package neko;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@WebSocket
public class ChatWebSocketHandler {

  private static Logger logger = LoggerFactory.getLogger(Main.class);
  private static ObjectMapper mapper = new ObjectMapper();

  @OnWebSocketConnect
  public void onConnect(Session user) {
    user.setIdleTimeout(120000);
  }

  @OnWebSocketClose
  public void onClose(Session user, int statusCode, String reason) {
    Game.clearUser(user);
  }

  public static class Input {
    public String value;
    public boolean ping;
    public GameSetting setting;
  }

  public static class Pong {
    public long currentGameTimeLeft;
    public long pongSentAt;

    public Pong(long t) {
      this.currentGameTimeLeft = t;
      this.pongSentAt = System.currentTimeMillis();
    }
  }

  @OnWebSocketMessage
  public void onMessage(Session user, String message) {
    try {
      Input input = mapper.readValue(message, Input.class);
      if (input.setting != null) {
        Game.findOrMakeGame(user, input.setting);
      } else {
        Game game = Game.findGame(user);

        if (input.ping) {
          user.getRemote()
              .sendStringByFuture(
                  mapper.writeValueAsString(new Pong(game == null ? 0 : game.timeLeft())));
        } else {
          game.play(user, input.value);
        }
      }
    } catch (Exception e) {
      logger.error("reading input", e);
    }
  }
}
