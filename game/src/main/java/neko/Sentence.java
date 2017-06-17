package neko;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.jar.JarEntry;
import java.util.jar.JarFile;
import neko.GameSetting.Language;
import neko.GameSetting.Level;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class Sentence {
  public static String splitPattern = "[ \"'_\\.,\\-?]+";
  private static Logger logger = LoggerFactory.getLogger(Sentence.class);

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
  private static ObjectMapper mapper = new ObjectMapper();

  // .. wtf java http://www.uofr.net/~greg/java/get-resource-listing.html
  private static String[] getResourceListing(Class clazz, String path)
      throws URISyntaxException, IOException {
    URL dirURL = clazz.getClassLoader().getResource(path);
    if (dirURL != null && dirURL.getProtocol().equals("file")) {
      /* A file path: easy enough */
      return new File(dirURL.toURI()).list();
    }

    if (dirURL == null) {
      /*
       * In case of a jar file, we can't actually find a directory.
       * Have to assume the same jar as clazz.
       */
      String me = clazz.getName().replace(".", "/") + ".class";
      dirURL = clazz.getClassLoader().getResource(me);
    }
    if (dirURL.getProtocol().equals("jar")) {
      /* A JAR path */
      String jarPath =
          dirURL
              .getPath()
              .substring(5, dirURL.getPath().indexOf("!")); //strip out only the JAR file
      JarFile jar = new JarFile(URLDecoder.decode(jarPath, "UTF-8"));
      Enumeration<JarEntry> entries = jar.entries();
      Set<String> result = new HashSet<String>();
      while (entries.hasMoreElements()) {
        String name = entries.nextElement().getName();
        if (name.startsWith(path) && !path.equals(name)) {
          result.add(name);
        }
      }
      return result.toArray(new String[result.size()]);
    }

    throw new UnsupportedOperationException("Cannot list files for URL " + dirURL);
  }

  static List<Sentence> parse(GameSetting setting) throws Exception {
    String root =
        "sentences"
            + File.separatorChar
            + setting.lang.toString()
            + File.separatorChar
            + setting.level.toString()
            + File.separatorChar;

    List<Sentence> out = new ArrayList<>();

    for (String resource : getResourceListing(Sentence.class, root)) {
      logger.info("loading " + resource);
      List<Sentence> current =
          mapper.readValue(
              Sentence.class.getClassLoader().getResourceAsStream(resource),
              new TypeReference<List<Sentence>>() {});
      out.addAll(current);
    }

    if (out.size() == 0) {
      throw new Exception(
          String.format("failed to load data for %s/%s", setting.level, setting.lang));
    }
    return out;
  }

  static void process(Level level, Language language) throws Exception {
    GameSetting setting = new GameSetting(level, language);
    sentences.put(setting, parse(setting));
  }

  static void load() {
    try {
      for (Language lang : Language.values()) {
        for (Level level : Level.values()) {
          process(level, lang);
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
