DROP TABLE IF EXISTS team;
DROP TABLE IF EXISTS score;

CREATE TABLE team (
  id INT NOT NULL AUTO_INCREMENT,
  region_number INT NOT NULL,
  table_number INT NOT NULL,
  UNIQUE KEY (table_number),
  PRIMARY KEY (id)
);

CREATE TABLE score (
  id INT NOT NULL AUTO_INCREMENT,
  team_id INT NOT NULL,
  round_number INT NOT NULL,
  FOREIGN KEY (team_id) REFERENCES team(id),
  PRIMARY KEY (id)
)