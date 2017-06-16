package neko;

import com.fasterxml.jackson.annotation.JsonProperty;

public class GameSetting {

  public enum Level {
    beginner,
    intermediate,
    advanced
  }

  public enum Language {
    ja,
    nl
  }

  public Level level;
  public Language lang;

  public GameSetting(@JsonProperty("level") Level level, @JsonProperty("language") Language lang) {
    this.level = level;
    this.lang = lang;
  }

  @Override
  public int hashCode() {
    return (level.ordinal() << 16) | lang.ordinal();
  }

  @Override
  public boolean equals(Object o) {
    if (!(o instanceof GameSetting)) return false;
    GameSetting other = (GameSetting) o;
    return other.lang == this.lang && other.level == this.level;
  }
}
