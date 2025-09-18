-- Создание структуры базы данных для системы управления футбольными соревнованиями

-- Удаление таблиц если они существуют (в правильном порядке из-за внешних ключей)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS tickets;
DROP TABLE IF EXISTS matches;
DROP TABLE IF EXISTS players;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS stadiums;
DROP TABLE IF EXISTS users;
-- Добавим удаление таблицы ролей, если она используется
DROP TABLE IF EXISTS roles;

-- Создание таблицы пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc')
);

-- Создание таблицы стадионов
CREATE TABLE stadiums (
    id SERIAL PRIMARY KEY, -- ИЗМЕНЕНО: stadium_id -> id
    name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(50) NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc')
);

-- Создание таблицы команд
CREATE TABLE teams (
    id SERIAL PRIMARY KEY, -- ИЗМЕНЕНО: team_id -> id
    name VARCHAR(100) NOT NULL UNIQUE,
    city VARCHAR(50) NOT NULL,
    coach VARCHAR(100),
    last_season_place INTEGER CHECK (last_season_place BETWEEN 1 AND 20),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc')
);

-- Создание таблицы игроков
CREATE TABLE players (
    id SERIAL PRIMARY KEY, -- ИЗМЕНЕНО: player_id -> id
    team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    age INTEGER NOT NULL CHECK (age BETWEEN 16 AND 45),
    jersey_number INTEGER NOT NULL CHECK (jersey_number BETWEEN 1 AND 99),
    position VARCHAR(20) NOT NULL CHECK (position IN ('GK', 'DEF', 'MID', 'FWD')), -- ИЗМЕНЕНО: на короткие названия
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
    UNIQUE(team_id, jersey_number)
);

-- Создание таблицы матчей
CREATE TABLE matches (
    id SERIAL PRIMARY KEY, -- ИЗМЕНЕНО: match_id -> id
    date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    home_team_id INTEGER NOT NULL REFERENCES teams(id),
    away_team_id INTEGER NOT NULL REFERENCES teams(id),
    stadium_id INTEGER NOT NULL REFERENCES stadiums(id),
    home_goals INTEGER DEFAULT NULL CHECK (home_goals >= 0),
    away_goals INTEGER DEFAULT NULL CHECK (away_goals >= 0),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'finished', 'cancelled')), -- ИЗМЕНЕНО: убраны лишние статусы
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
    CHECK (home_team_id != away_team_id)
);

-- Создание таблицы билетов
CREATE TABLE tickets (
    id SERIAL PRIMARY KEY, -- ИЗМЕНЕНО: ticket_id -> id
    match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    category VARCHAR(20) NOT NULL CHECK (category IN ('VIP', 'Standard', 'Economy')),
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc') -- Добавлено для соответствия BaseModel
);

-- Создание таблицы журнала аудита
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INTEGER,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
    details TEXT
);

-- Создание индексов для оптимизации запросов
CREATE INDEX idx_players_team_id ON players(team_id);
CREATE INDEX idx_matches_date ON matches(date);
CREATE INDEX idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX idx_tickets_match_id ON tickets(match_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);