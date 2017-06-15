package neko;

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

  @OnWebSocketConnect
  public void onConnect(Session user) {
    user.setIdleTimeout(120000);
    Game.findGame(user);
  }

  @OnWebSocketClose
  public void onClose(Session user, int statusCode, String reason) {
    Game.clearUser(user);
  }

  @OnWebSocketMessage
  public void onMessage(Session user, String message) {
    Game game = Game.findGame(user);
    if ("__ping__".equals(message)) {
      user.getRemote().sendStringByFuture("pong:" + game.timeLeft());
    } else {
      game.play(user, message);
    }
  }
}
