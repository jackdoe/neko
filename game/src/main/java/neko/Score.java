package neko;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Score {

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
              if (v == null) {
                return 1;
              }
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
