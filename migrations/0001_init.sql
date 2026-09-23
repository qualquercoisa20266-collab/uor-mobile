CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nick TEXT NOT NULL UNIQUE COLLATE NOCASE,
  login TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  last_login_at INTEGER
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS auth_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  login TEXT NOT NULL,
  ip_hash TEXT,
  success INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_login_time ON auth_attempts(login, created_at);
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY,
  points INTEGER NOT NULL DEFAULT 0,
  games INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  abandons INTEGER NOT NULL DEFAULT 0,
  draws INTEGER NOT NULL DEFAULT 0,
  win_streak INTEGER NOT NULL DEFAULT 0,
  best_streak INTEGER NOT NULL DEFAULT 0,
  total_conquests INTEGER NOT NULL DEFAULT 0,
  total_armies_destroyed INTEGER NOT NULL DEFAULT 0,
  total_turns INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS match_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  room_id TEXT,
  room_name TEXT NOT NULL,
  result TEXT NOT NULL,
  finished_at INTEGER NOT NULL,
  players_count INTEGER NOT NULL,
  opponent_names TEXT NOT NULL DEFAULT '[]',
  points_delta INTEGER NOT NULL DEFAULT 0,
  rank_after TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_history_user_time ON match_history(user_id, finished_at DESC);
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at INTEGER NOT NULL,
  PRIMARY KEY(user_id, achievement_id),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  max_players INTEGER NOT NULL,
  host_user_id TEXT NOT NULL,
  players_json TEXT NOT NULL DEFAULT '[]',
  game_active INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_rooms_updated ON rooms(updated_at DESC);
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT,
  nick TEXT NOT NULL,
  color TEXT,
  text TEXT NOT NULL,
  ts INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_chat_ts ON chat_messages(ts DESC);

INSERT OR IGNORE INTO achievements(id,name,description) VALUES
('first_battle','Primeiro Combate','Conclua sua primeira partida.'),
('first_victory','Primeira Vitória','Conquiste sua primeira vitória.'),
('five_victories','Veterano','Alcance 5 vitórias.'),
('ten_victories','Comandante','Alcance 10 vitórias.'),
('streak_three','Em Sequência','Consiga 3 vitórias seguidas.'),
('hundred_points','Primeiros Pontos','Alcance 100 pontos.'),
('thousand_points','Alto Comando','Alcance 1.000 pontos.'),
('marshal','Marechal','Alcance a patente máxima.');
