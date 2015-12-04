/* TEST MAX SCORE */

DELETE FROM score;
DELETE FROM team;

/* insert teams by region and table */
/* currently divided into 6 regions with 5 tables in regions 1-4 and 6 tables in regions 5-6 */
INSERT INTO team (region_number, table_number) VALUES (1, 1);
INSERT INTO team (region_number, table_number) VALUES (1, 2);
INSERT INTO team (region_number, table_number) VALUES (1, 3);
INSERT INTO team (region_number, table_number) VALUES (1, 4);
INSERT INTO team (region_number, table_number) VALUES (1, 5);

INSERT INTO team (region_number, table_number) VALUES (2, 6);
INSERT INTO team (region_number, table_number) VALUES (2, 7);
INSERT INTO team (region_number, table_number) VALUES (2, 8);
INSERT INTO team (region_number, table_number) VALUES (2, 9);
INSERT INTO team (region_number, table_number) VALUES (2, 10);

INSERT INTO team (region_number, table_number) VALUES (3, 11);
INSERT INTO team (region_number, table_number) VALUES (3, 12);
INSERT INTO team (region_number, table_number) VALUES (3, 13);
INSERT INTO team (region_number, table_number) VALUES (3, 14);
INSERT INTO team (region_number, table_number) VALUES (3, 15);

INSERT INTO team (region_number, table_number) VALUES (4, 16);
INSERT INTO team (region_number, table_number) VALUES (4, 17);
INSERT INTO team (region_number, table_number) VALUES (4, 18);
INSERT INTO team (region_number, table_number) VALUES (4, 19);
INSERT INTO team (region_number, table_number) VALUES (4, 20);

INSERT INTO team (region_number, table_number) VALUES (5, 21);
INSERT INTO team (region_number, table_number) VALUES (5, 22);
INSERT INTO team (region_number, table_number) VALUES (5, 23);
INSERT INTO team (region_number, table_number) VALUES (5, 24);
INSERT INTO team (region_number, table_number) VALUES (5, 25);
INSERT INTO team (region_number, table_number) VALUES (5, 26);

INSERT INTO team (region_number, table_number) VALUES (6, 27);
INSERT INTO team (region_number, table_number) VALUES (6, 28);
INSERT INTO team (region_number, table_number) VALUES (6, 29);
INSERT INTO team (region_number, table_number) VALUES (6, 30);
INSERT INTO team (region_number, table_number) VALUES (6, 31);
INSERT INTO team (region_number, table_number) VALUES (6, 32);

/* insert score, we'll put the max value in one round */
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 1;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 2;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 3;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 4;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 5;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 6;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 7;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 8;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 9;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 10;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 11;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 12;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 13;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 14;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 15;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 16;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 17;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 18;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 19;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 20;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 21;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 22;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 23;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 24;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 25;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 26;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 27;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 28;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 29;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 30;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 31;
INSERT INTO score (team_id, round_number, score_value) SELECT id, 1, 7100 FROM team WHERE table_number = 32;