INSERT INTO budget(date) VALUES('2015-01-01');
INSERT INTO budget(date) VALUES('2015-02-01');
INSERT INTO budget(date) VALUES('2015-03-01');

INSERT INTO category(name, type) VALUES('Salary', 'C');
INSERT INTO category(name, type) VALUES('Child Benefit', 'C');
INSERT INTO category(name, type) VALUES('Charity', 'D');
INSERT INTO category(name, type) VALUES('Insurance', 'D');

INSERT INTO budget_category(budget_id, category_id) VALUES(1, 1);
INSERT INTO budget_category(budget_id, category_id) VALUES(1, 2);
INSERT INTO budget_category(budget_id, category_id) VALUES(1, 3);
INSERT INTO budget_category(budget_id, category_id) VALUES(1, 4);