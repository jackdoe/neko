package neko;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import neko.GameSetting.Language;
import neko.GameSetting.Level;

public class Sentence {
  public static String splitPattern = "[ \"'_\\.,\\-?]+";

  public String question;
  public transient String answer; // hmm should people see the answer in multi player setting?
  public transient String[] tokenized;
  public transient Map<String, Integer> freq;

  public static String[] tokenize(String s) {
    return s.toLowerCase().split(splitPattern);
  }

  public Sentence(@JsonProperty("q") String q, @JsonProperty("a") String a) {
    this.question = q;
    this.answer = a;
    this.tokenized = tokenize(a);
    this.freq = new HashMap<>();
    for (String s : this.tokenized) {
      this.freq.compute(
          s,
          (k, v) -> {
            if (v == null) return 1;
            return v + 1;
          });
    }
  }

  private static Map<GameSetting, List<Sentence>> sentences = new HashMap<>();
  private static Random random = new Random();

  static void load() {
    ObjectMapper mapper = new ObjectMapper();
    try {
      List<Sentence> ja =
          mapper.readValue(
              Sentence.class.getClassLoader().getResourceAsStream("sentences.json"),
              new TypeReference<List<Sentence>>() {});

      sentences.put(new GameSetting(Level.advanced, Language.ja), ja);

      for (Language lang : Language.values()) {
        for (Level level : Level.values()) {
          GameSetting s = new GameSetting(level, lang);
          if (!sentences.containsKey(s)) {
            List<Sentence> notSupported = new ArrayList<>();
            String message = String.format("%s/%s not supported", level, lang);
            notSupported.add(new Sentence(message, message));
            sentences.put(s, notSupported);
          }
        }
      }
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException(e);
    }
  }

  public static Sentence pick(GameSetting gameSetting) {
    List<Sentence> perSetting = sentences.get(gameSetting);
    return perSetting.get(random.nextInt(perSetting.size()));
  }
}
