CREATE TABLE likes (
    liker_id BIGINT NOT NULL,
    liked_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (liker_id, liked_id)
);

CREATE TABLE matches (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_low BIGINT NOT NULL,
    user_high BIGINT NOT NULL,
    matched_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE (user_low, user_high)
);