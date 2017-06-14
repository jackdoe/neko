package neko;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Collection;
import java.util.Map;
import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.eclipse.jetty.websocket.api.Session;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketClose;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketConnect;
import org.eclipse.jetty.websocket.api.annotations.OnWebSocketMessage;
import org.eclipse.jetty.websocket.api.annotations.WebSocket;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@WebSocket
public class ChatWebSocketHandler {
  private static ObjectMapper mapper = new ObjectMapper();
  private static Logger logger = LoggerFactory.getLogger(Main.class);
  private static AtomicLong counter = new AtomicLong();

  public static class Game {
    private static Logger logger = LoggerFactory.getLogger(Game.class);

    private static Map<Session, Game> userToGame = new ConcurrentHashMap<>();
    private static Map<Game, Boolean> games = new ConcurrentHashMap<>();

    public Game() {
      this.id = counter.getAndIncrement();
      logger.info("new game created");
      pickNewSentence();
    }

    @Override
    public int hashCode() {
      return Long.hashCode(id);
    }

    @Override
    public boolean equals(Object o) {
      if (!(o instanceof Game)) return false;
      return id == ((Game) o).id;
    }

    public long id;
    public Sentence selectedSentence;
    public long sentencePickedAt;
    private transient Map<Session, Score> users = new ConcurrentHashMap<>();

    public static class Score {
      private static Logger logger = LoggerFactory.getLogger(Score.class);
      public int id;
      public Map<String, Integer> matchingWords = new ConcurrentHashMap<>();
      public float currentScore = 0f;
      public float totalScore = 0f;

      public Score(int id) {
        this.id = id;
        logger.info("new score created with id: ", id);
      }

      public boolean score(Sentence sentence, String input) {
        matchingWords.clear();
        float oldScore = currentScore;
        totalScore -= currentScore;
        for (String s : input.split(Sentence.splitPattern)) {
          if (sentence.freq.containsKey(s)) {
            matchingWords.compute(
                s,
                (k, v) -> {
                  if (v == null) return 1;
                  return v + 1;
                });
          }
        }
        currentScore = 0;
        if (sentence.freq.size() > 0) {
          currentScore = (float) matchingWords.size() / (float) sentence.freq.size();
        }
        totalScore += currentScore;
        return (currentScore != oldScore);
      }
    }

    public static void clearUser(Session user) {
      Game g = userToGame.get(user);
      if (g != null) g.remove(user);
    }

    public static Game findGame(Session user) {
      return userToGame.computeIfAbsent(
          user,
          (k) -> {
            for (Game game : games.keySet()) {
              if (game.members() < 5) {
                game.addMember(user);
                return game;
              }
            }

            Game game = new Game();
            game.addMember(user);

            games.put(game, true);

            return game;
          });
    }

    @JsonProperty("state")
    public Collection<Score> getState() {
      return users.values();
    }

    public void addMember(Session user) {
      users.computeIfAbsent(user, (k) -> new Score(user.hashCode()));
    }

    public void remove(Session user) {
      users.remove(user);
    }

    public void play(Session user, String words) throws Exception {
      Score s = users.get(user);

      // could be race between disconnect and play, so we might try to play with missing user
      boolean changed = false;
      if (s != null) {
        changed = s.score(selectedSentence, words);
        if (s.currentScore > 0.9) {
          this.pickNewSentence();
        }
      }
      this.broadcast();
    }

    public synchronized void pickNewSentence() {
      this.selectedSentence = Sentence.pick();
      this.sentencePickedAt = System.currentTimeMillis();
      users.forEach(
          (k, v) -> {
            v.matchingWords.clear();
            v.currentScore = 0f;
          });
      logger.info("new sentence picked");
    }

    public void broadcast() throws Exception {
      final String state = mapper.writeValueAsString(this);
      logger.info("broadcasting " + state);
      users.forEach((u, v) -> u.getRemote().sendStringByFuture(state));
    }

    public int members() {
      return users.size();
    }

    public static void ticker() {

      userToGame.forEach(
          (k, game) -> {
            if ((System.currentTimeMillis() - game.sentencePickedAt) > 60000) {
              game.pickNewSentence();
            }
            logger.info(game.id + ": active members: " + game.members());
          });
      logger.info("number of user: " + userToGame.size() + " number of games: " + games.size());
    }

    private static Timer timer;

    static {
      timer = new Timer();
      timer.scheduleAtFixedRate(
          new TimerTask() {
            @Override
            public void run() {
              ticker();
            }
          },
          0,
          1000);
    }
  }

  @OnWebSocketConnect
  public void onConnect(Session user) throws Exception {}

  @OnWebSocketClose
  public void onClose(Session user, int statusCode, String reason) {
    Game.clearUser(user);
  }

  @OnWebSocketMessage
  public void onMessage(Session user, String message) throws Exception {
    Game.findGame(user).play(user, message);
  }
}
