ALTER TABLE availability
RENAME COLUMN weekday TO user_weekday;

CREATE TABLE weekdays (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    weekday VARCHAR(10) NOT NULL UNIQUE
);

INSERT INTO weekdays (weekday) VALUES
    ('Sunday'),
    ('Monday'),
    ('Tuesday'),
    ('Wednesday'),
    ('Thursday'),
    ('Friday'),
    ('Saturday');