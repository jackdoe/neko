package neko;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class GameSetting {
  public enum Language {
    ja,
    nl
  }

  public Language lang;

  public GameSetting(@JsonProperty("language") Language lang) {
    this.lang = lang;
  }

  @Override
  public int hashCode() {

    return lang.hashCode();
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof GameSetting)) return false;
    GameSetting other = (GameSetting) o;
    return other.lang == this.lang;
  }
}
