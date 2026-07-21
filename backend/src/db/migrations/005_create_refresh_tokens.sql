CREATE TABLE refresh_tokens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL,
    token_hash TEXT,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ NULL,

    CONSTRAINT fk_refresh_user_id 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);