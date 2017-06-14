package neko;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class Sentence {
  public String question;
  public String answer;
  public transient String[] tokenized;
  public static String splitPattern = "[ \"'_\\.-]+";
  public transient Map<String, Integer> freq;

  public static String[] tokenize(String s) {
    return s.toLowerCase().split(splitPattern);
  }

  public Sentence(String q, String a) {
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

  public static Sentence pick() {
    return new Sentence(
        "question " + UUID.randomUUID().toString(), "answer " + UUID.randomUUID().toString());
  }
}
