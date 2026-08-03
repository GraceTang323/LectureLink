CREATE TABLE availability (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    weekday SMALLINT CHECK (weekday BETWEEN 0 AND 6),
    start_time TIME CHECK (start_time < end_time),
    end_time TIME CHECK (start_time < end_time),

    CONSTRAINT fk_availability_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

ALTER TABLE users ADD COLUMN photo_url TEXT;