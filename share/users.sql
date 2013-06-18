--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

SET search_path = public, pg_catalog;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: users; Type: TABLE; Schema: public; Tablespace:
--

CREATE TABLE users (
    id uuid NOT NULL,
    email text,
    password text,
    confirmed boolean DEFAULT false,
    confirm_token text,
    reset_token text
);


--
-- Name: pk_users; Type: CONSTRAINT; Schema: public; Tablespace:
--

ALTER TABLE ONLY users
    ADD CONSTRAINT pk_users PRIMARY KEY (id);


--
-- Name: unique_confirm_token; Type: INDEX; Schema: public; Tablespace:
--

CREATE UNIQUE INDEX unique_confirm_token ON users USING btree (confirm_token);

--
-- Name: unique_reset_token; Type: INDEX; Schema: public; Tablespace:
--

CREATE UNIQUE INDEX unique_reset_token ON users USING btree (reset_token);


--
-- Name: unique_email_lower_case; Type: INDEX; Schema: public; Tablespace:
--

CREATE UNIQUE INDEX unique_email_lower_case ON users USING btree (lower(email));

--
-- PostgreSQL database dump complete
--

