CREATE TABLE user_interests (
    user_id BIGINT NOT NULL,
    interest_id BIGINT NOT NULL,
    -- Add foreign key constraints
    CONSTRAINT fk_user_interest FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_interest FOREIGN KEY (interest_id) REFERENCES interests(id) ON DELETE CASCADE,
    -- Composite primary key (user_id, interest_id)
    CONSTRAINT pk_user_interests PRIMARY KEY (user_id, interest_id)
);

CREATE TABLE user_courses (
    user_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    -- Add foreign key constraints
    CONSTRAINT fk_user_course FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    -- Composite primary key (user_id, course_id)
    CONSTRAINT pk_user_courses PRIMARY KEY (user_id, course_id)
);