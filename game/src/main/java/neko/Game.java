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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Created by jack on 15/06/2017. */
public class Game {
  private static ObjectMapper mapper = new ObjectMapper();
  private static AtomicLong counter = new AtomicLong();
  public static final long SENTENCE_CHANGE_INTERVAL = 60000;
  private static Logger logger = LoggerFactory.getLogger(Game.class);

  private static Map<Session, Game> userToGame = new ConcurrentHashMap<>();
  private static Map<Game, Boolean> games = new ConcurrentHashMap<>();

  public long id;
  public Sentence selectedSentence;
  public long sentencePickedAt;
  private AtomicLong messagesSent = new AtomicLong(0);
  private transient Map<Session, Score> users = new ConcurrentHashMap<>();

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

  public Game() {
    this.id = counter.getAndIncrement();
    pickNewSentence();
  }

  public String toString() {
    return String.format(
        "game(#%d: %d, messages: %d)", this.id, this.users.size(), this.messagesSent.get());
  }

  @Override
  public int hashCode() {
    return Long.hashCode(id);
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof Game)) {
      return false;
    }
    return id == ((Game) o).id;
  }

  public static void clearUser(Session user) {
    Game g = userToGame.get(user);
    if (g != null) {
      g.remove(user);
    }
    userToGame.remove(user);
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
    users.forEach(
        (k, score) -> {
          score.totalScore = 0;
        });
    broadcast(MessageType.USER_JOINED);
  }

  public void remove(Session user) {
    users.remove(user);
    this.broadcast(MessageType.USER_LEFT);
  }

  public void play(Session user, String words) {
    Score s = users.get(user);
    boolean changed = false;

    // could be race between disconnect and play, so we might try to play with missing user
    if (s != null) {
      changed = s.score(selectedSentence, words);
      if (s.currentScore > 0.9) {
        this.pickNewSentence();
        changed = true;
      }
    }
    if (changed) {
      this.broadcast(MessageType.STATE_CHANGED);
    }
  }

  public long timeLeft() {
    return SENTENCE_CHANGE_INTERVAL - (System.currentTimeMillis() - sentencePickedAt);
  }

  public synchronized void pickNewSentence() {
    this.selectedSentence = Sentence.pick();
    this.sentencePickedAt = System.currentTimeMillis();
    users.forEach(
        (k, v) -> {
          v.matchingWords.clear();
          v.currentScore = 0f;
        });
    this.broadcast(MessageType.SENTENCE_CHANGED);

    logger.info(this + " new sentence picked");
  }

  public enum MessageType {
    USER_JOINED,
    USER_LEFT,
    STATE_CHANGED,
    SENTENCE_CHANGED
  }

  public static class Message {
    public Game game;
    public int you;
    public MessageType type;

    public Message(Game game, int you, MessageType type) {
      this.game = game;
      this.you = you;
      this.type = type;
    }
  }

  public void broadcast(MessageType type) {
    try {
      for (Session u : users.keySet()) {
        u.getRemote()
            .sendStringByFuture(mapper.writeValueAsString(new Message(this, u.hashCode(), type)));
      }
      this.messagesSent.getAndIncrement();
    } catch (Exception e) {
      logger.error(this + ": broadcasting", e);
    }
  }

  public int members() {
    return users.size();
  }

  public static void ticker() {
    userToGame.forEach(
        (k, game) -> {
          if (game.timeLeft() <= 0) {
            logger.info(game + ":picking new sentence");
            game.pickNewSentence();
          }
          logger.info(game.toString());
        });
    logger.info("number of user: " + userToGame.size() + " number of games: " + games.size());
  }
}
