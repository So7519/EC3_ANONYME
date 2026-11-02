--
-- PostgreSQL database dump
--

\restrict DVejUkcaC6cJx86KjzCcbOh0eeMKqWUMSi4DVfDWTRVeLSQ6yUUHz2WX8DzBGWN

-- Dumped from database version 17.6 (Debian 17.6-2.pgdg13+1)
-- Dumped by pg_dump version 17.6 (Debian 17.6-2.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: btree_gist; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;


--
-- Name: EXTENSION btree_gist; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION btree_gist IS 'support for indexing common datatypes in GiST';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: studio
--

CREATE TABLE public.bookings (
    id character varying(50) NOT NULL,
    room_id character varying(50) NOT NULL,
    member_id character varying(50) NOT NULL,
    start_at timestamp with time zone NOT NULL,
    end_at timestamp with time zone NOT NULL,
    status character varying(20) NOT NULL
);


ALTER TABLE public.bookings OWNER TO studio;

--
-- Name: members; Type: TABLE; Schema: public; Owner: studio
--

CREATE TABLE public.members (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.members OWNER TO studio;

--
-- Name: rooms; Type: TABLE; Schema: public; Owner: studio
--

CREATE TABLE public.rooms (
    id character varying(50) NOT NULL,
    name character varying(100) NOT NULL,
    capacity integer NOT NULL,
    maintenance_start_at timestamp with time zone,
    maintenance_end_at timestamp with time zone
);


ALTER TABLE public.rooms OWNER TO studio;

--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: studio
--

COPY public.bookings (id, room_id, member_id, start_at, end_at, status) FROM stdin;
booking-1	room-1	member-1	2026-11-03 18:00:00+00	2026-11-03 20:00:00+00	confirmed
booking-2	room-3	member-1	2026-11-10 14:00:00+00	2026-11-10 17:00:00+00	confirmed
booking-3	room-2	member-2	2026-11-02 19:00:00+00	2026-11-02 21:00:00+00	confirmed
booking-4	room-2	member-2	2026-10-28 19:00:00+00	2026-10-28 21:00:00+00	confirmed
booking-32aadb89-e45c-463a-a517-003190970255	room-1	member-3	2026-11-04 14:00:00+00	2026-11-04 16:00:00+00	confirmed
\.


--
-- Data for Name: members; Type: TABLE DATA; Schema: public; Owner: studio
--

COPY public.members (id, name) FROM stdin;
member-1	Les Volts
member-2	Café Noir
member-3	Marée Basse
\.


--
-- Data for Name: rooms; Type: TABLE DATA; Schema: public; Owner: studio
--

COPY public.rooms (id, name, capacity, maintenance_start_at, maintenance_end_at) FROM stdin;
room-1	Salle Hendrix	5	\N	\N
room-2	Salle Simone	4	\N	\N
room-3	Salle Bowie	6	\N	\N
room-4	Salle Björk	3	2026-11-05 00:00:00+00	2026-11-08 00:00:00+00
\.


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: studio
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (id);


--
-- Name: members members_pkey; Type: CONSTRAINT; Schema: public; Owner: studio
--

ALTER TABLE ONLY public.members
    ADD CONSTRAINT members_pkey PRIMARY KEY (id);


--
-- Name: bookings no_overlapping_bookings; Type: CONSTRAINT; Schema: public; Owner: studio
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT no_overlapping_bookings EXCLUDE USING gist (room_id WITH =, tstzrange(start_at, end_at) WITH &&) WHERE (((status)::text = 'confirmed'::text));


--
-- Name: rooms rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: studio
--

ALTER TABLE ONLY public.rooms
    ADD CONSTRAINT rooms_pkey PRIMARY KEY (id);


--
-- Name: bookings bookings_member_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_member_id_fkey FOREIGN KEY (member_id) REFERENCES public.members(id);


--
-- Name: bookings bookings_room_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: studio
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id);


--
-- PostgreSQL database dump complete
--

\unrestrict DVejUkcaC6cJx86KjzCcbOh0eeMKqWUMSi4DVfDWTRVeLSQ6yUUHz2WX8DzBGWN

