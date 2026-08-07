ALTER TABLE likes
ADD CONSTRAINT fk_liker_id
    FOREIGN KEY (liker_id)
    REFERENCES users(id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_liked_id
    FOREIGN KEY (liked_id)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- extra db level enforcement of data validity
ALTER TABLE likes
ADD CONSTRAINT chk_not_self_like
    CHECK (liker_id <> liked_id);

ALTER TABLE matches
ADD CONSTRAINT fk_user_low
    FOREIGN KEY (user_low)
    REFERENCES users(id)
    ON DELETE CASCADE,
ADD CONSTRAINT fk_user_high
    FOREIGN KEY (user_high)
    REFERENCES users(id)
    ON DELETE CASCADE;

-- extra db level enforcement of data validity
ALTER TABLE matches
ADD CONSTRAINT chk_not_self_match
    CHECK (user_low < user_high);