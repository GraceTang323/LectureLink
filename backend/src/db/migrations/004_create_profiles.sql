CREATE TABLE profiles (
    user_id BIGINT PRIMARY KEY,
    major VARCHAR(100),
    bio TEXT,
    graduation_year SMALLINT,

    CONSTRAINT fk_user_profile 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);