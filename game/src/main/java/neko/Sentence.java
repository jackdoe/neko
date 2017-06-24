package neko;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import neko.GameSetting.Language;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Sentence {
  public static String splitPattern = "[ \"'_\\.,\\-?]+";
  private static Logger logger = LoggerFactory.getLogger(Sentence.class);
  public int difficulty;
  public String question;
  public transient String answer; // hmm should people see the answer in multi player setting?
  public transient String[] tokenized;
  public transient Map<String, Integer> freq;

  public static String[] tokenize(String s) {
    return s.toLowerCase().split(splitPattern);
  }

  public Sentence(
      @JsonProperty("q") String q, @JsonProperty("a") String a, @JsonProperty("d") int d) {
    this.difficulty = d;
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
  private static ObjectMapper mapper = new ObjectMapper();

  static List<Sentence> parse(GameSetting setting) throws Exception {
    String file = "sentences" + File.separatorChar + setting.lang.toString() + ".json";

    try {
      List<Sentence> out =
          mapper.readValue(
              Sentence.class.getClassLoader().getResourceAsStream(file),
              new TypeReference<List<Sentence>>() {});

      logger.info(String.format("loaded %d from %s", out.size(), file));
      return out;
    } catch (Exception e) {
      logger.error("attempt to load " + file);
      return new ArrayList<>();
    }
  }

  static void process(Language language) throws Exception {
    GameSetting setting = new GameSetting(language);
    sentences.put(setting, parse(setting));
  }

  static void load() {
    try {
      for (Language lang : Language.values()) {
        process(lang);
      }
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException(e);
    }
  }

  public static final Sentence NOT_SUPPORTED =
      new Sentence("not supported yet", "not supported yet", 10);

  public static Sentence pick(GameSetting gameSetting) {
    List<Sentence> perSetting = sentences.get(gameSetting);
    if (perSetting == null) {
      return NOT_SUPPORTED;
    }
    return perSetting.get(random.nextInt(perSetting.size()));
  }
}
