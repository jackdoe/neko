package neko;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

public class Sentence {
  public static String splitPattern = "[ \"'_\\.,\\-?]+";

  public String question;
  public String answer; // hmm should people see the answer in multi player setting?
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

  private static List<Sentence> sentences;
  private static Random random = new Random();

  static void load() {
    ObjectMapper mapper = new ObjectMapper();
    try {
      sentences =
          mapper.readValue(
              Sentence.class.getClassLoader().getResourceAsStream("sentences.json"),
              new TypeReference<List<Sentence>>() {});
    } catch (Exception e) {
      e.printStackTrace();
      throw new RuntimeException(e);
    }
  }

  public static Sentence pick() {
    return sentences.get(random.nextInt(sentences.size()));
  }
}
