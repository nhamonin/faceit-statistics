--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8 (Homebrew)
-- Dumped by pg_dump version 15.8 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


--
-- Name: delete_player_if_unreferenced(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.delete_player_if_unreferenced() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM team_player WHERE player_id = OLD.player_id) THEN
    DELETE FROM player WHERE player_id = OLD.player_id;
  END IF;
  RETURN OLD;
END;$$;


ALTER FUNCTION public.delete_player_if_unreferenced() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.player (
    player_id character varying(255) NOT NULL,
    nickname character varying(255) NOT NULL,
    elo integer NOT NULL,
    lvl integer NOT NULL,
    kd json NOT NULL,
    avg json NOT NULL,
    winrate json NOT NULL,
    hs json NOT NULL,
    "highestElo" integer,
    "highestEloDate" date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    previous_elo integer,
    in_match boolean DEFAULT false
);


ALTER TABLE public.player OWNER TO postgres;

--
-- Name: Highest elo players; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public."Highest elo players" AS
 SELECT player.nickname,
    player.elo,
    player."highestElo",
    player."highestEloDate",
    player.created_at,
    player.in_match
   FROM public.player
  ORDER BY player.elo DESC;


ALTER TABLE public."Highest elo players" OWNER TO postgres;

--
-- Name: team; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team (
    chat_id bigint NOT NULL,
    type character varying(255) NOT NULL,
    username character varying(255),
    first_name character varying(255),
    title character varying(255),
    name character varying(255),
    settings json NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    action_limit integer DEFAULT 100 NOT NULL,
    actions_used integer DEFAULT 0 NOT NULL,
    subscription_expiry timestamp(6) with time zone
);


ALTER TABLE public.team OWNER TO postgres;

--
-- Name: New teams; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public."New teams" AS
 SELECT date_series.day AS created_date,
    COALESCE(team_counts.daily_count, (0)::bigint) AS daily_count
   FROM (( SELECT (generate_series((( SELECT date(min(team.created_at)) AS date
                   FROM public.team))::timestamp with time zone, (CURRENT_DATE)::timestamp with time zone, '1 day'::interval))::date AS day) date_series
     LEFT JOIN ( SELECT date(team.created_at) AS created_date,
            count(*) AS daily_count
           FROM public.team
          GROUP BY (date(team.created_at))) team_counts ON ((date_series.day = team_counts.created_date)))
  ORDER BY date_series.day;


ALTER TABLE public."New teams" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: match; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match (
    match_id character varying(255) NOT NULL,
    player_id character varying(255) NOT NULL,
    elo integer,
    "timestamp" timestamp without time zone,
    kd double precision,
    kills integer,
    hs integer,
    map character varying(255),
    game_mode character varying(255),
    win integer,
    score character varying(255)
);


ALTER TABLE public.match OWNER TO postgres;

--
-- Name: match_prediction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.match_prediction (
    id bigint NOT NULL,
    "totalMatches" bigint DEFAULT '0'::bigint,
    "avgPredictions" real DEFAULT '0'::real,
    "winratePredictions" real DEFAULT '0'::real,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.match_prediction OWNER TO postgres;

--
-- Name: match_prediction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.match_prediction_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.match_prediction_id_seq OWNER TO postgres;

--
-- Name: match_prediction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.match_prediction_id_seq OWNED BY public.match_prediction.id;


--
-- Name: team_player; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_player (
    chat_id bigint NOT NULL,
    player_id character varying(255) NOT NULL
);


ALTER TABLE public.team_player OWNER TO postgres;

--
-- Name: temp_prediction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.temp_prediction (
    match_id character varying(255) NOT NULL,
    predictions jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.temp_prediction OWNER TO postgres;

--
-- Name: match_prediction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_prediction ALTER COLUMN id SET DEFAULT nextval('public.match_prediction_id_seq'::regclass);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: match match_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_pkey PRIMARY KEY (match_id, player_id);


--
-- Name: match match_player_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_player_id_unique UNIQUE (match_id, player_id);


--
-- Name: match_prediction match_prediction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match_prediction
    ADD CONSTRAINT match_prediction_pkey PRIMARY KEY (id);


--
-- Name: player player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.player
    ADD CONSTRAINT player_pkey PRIMARY KEY (player_id);


--
-- Name: team team_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_pkey PRIMARY KEY (chat_id);


--
-- Name: team_player team_player_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_player
    ADD CONSTRAINT team_player_pkey PRIMARY KEY (chat_id, player_id);


--
-- Name: temp_prediction temp_prediction_match_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.temp_prediction
    ADD CONSTRAINT temp_prediction_match_id_unique UNIQUE (match_id);


--
-- Name: temp_prediction temp_prediction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.temp_prediction
    ADD CONSTRAINT temp_prediction_pkey PRIMARY KEY (match_id);


--
-- Name: team_player delete_player_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER delete_player_trigger AFTER DELETE ON public.team_player FOR EACH ROW EXECUTE FUNCTION public.delete_player_if_unreferenced();


--
-- Name: match match_player_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.match
    ADD CONSTRAINT match_player_id_fkey FOREIGN KEY (player_id) REFERENCES public.player(player_id) ON DELETE CASCADE;


--
-- Name: team_player team_player_chat_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.team_player
    ADD CONSTRAINT team_player_chat_id_foreign FOREIGN KEY (chat_id) REFERENCES public.team(chat_id) ON DELETE CASCADE;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

