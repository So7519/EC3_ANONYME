const express = require('express');
const BookingRepository = require('../infrastructure/BookingRepository');
const BookingService = require('../domain/BookingService');
const { Clock } = require('../domain/Clock');

const app = express();
app.use(express.json());

const bookingRepo = new BookingRepository();
const clock = new Clock();
const bookingService = new BookingService(bookingRepo, clock);

app.get('/rooms', (req, res) => {
    res.status(200).json({ message: "API Studio Riff en ligne" });
});

app.post('/rooms/:id/bookings', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { memberId, start, end } = req.body;

        if (!memberId || !start || !end) {
            return res.status(400).json({ error: "memberId, start et end sont requis" });
        }

        const booking = await bookingService.createBooking({
            roomId,
            memberId,
            start,
            end
        });

        res.status(201)
           .location(`/bookings/${booking.id}`)
           .json({
               id: booking.id,
               roomId: booking.room_id,
               memberId: booking.member_id,
               start: booking.start_at,
               end: booking.end_at,
               status: booking.status
           });

    } catch (error) {
        if (error.status) {
            return res.status(error.status).json({ error: error.message });
        }
        console.error(error);
        res.status(500).json({ error: "Erreur serveur interne" });
    }
});

module.exports = app;