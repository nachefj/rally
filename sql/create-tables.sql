DROP TABLE IF EXISTS budget_category;
DROP TABLE IF EXISTS budget;
DROP TABLE IF EXISTS category;

CREATE TABLE budget (
  id INT NOT NULL AUTO_INCREMENT,
  date DATE NOT NULL,
  UNIQUE KEY (date),
  PRIMARY KEY (id)
);

CREATE TABLE category (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(32) NOT NULL,
  type CHAR(1) NOT NULL,
  UNIQUE KEY (name),
  PRIMARY KEY (id)
);

CREATE TABLE budget_category (
  budget_id INT NOT NULL,
  category_id INT NOT NULL,
  UNIQUE KEY (budget_id, category_id),
  FOREIGN KEY (budget_id) REFERENCES budget(id),
  FOREIGN KEY (category_id) REFERENCES category(id)
)

/*
DROP TABLE IF EXISTS entry;
DROP TABLE IF EXISTS budget_item;
DROP TABLE IF EXISTS budget;

CREATE TABLE budget (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  UNIQUE KEY(name),
  PRIMARY KEY (id)
);

CREATE TABLE budget_item (
  id INT NOT NULL AUTO_INCREMENT,
  budget_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description VARCHAR(255) NOT NULL,
  item_type CHAR(1) NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FOREIGN KEY (budget_id) REFERENCES budget (id) ON DELETE CASCADE
);

CREATE TABLE entry (
  id INT NOT NULL AUTO_INCREMENT,
  budget_item_id INT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT FOREIGN KEY (budget_item_id) REFERENCES budget_item (id)
);
*/