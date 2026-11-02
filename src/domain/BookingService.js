const crypto = require('crypto');

class BookingService {
    constructor(bookingRepository, clock) {
        this.repo = bookingRepository;
        this.clock = clock;
    }

    async createBooking({ memberId, roomId, start, end }) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const now = this.clock.now();

        const durationHours = (endDate - startDate) / (1000 * 60 * 60);
        if (durationHours < 1 || durationHours > 4) {
            throw { status: 400, message: "La durée doit être comprise entre 1h et 4h." };
        }

        if (startDate.getUTCMinutes() !== 0 || startDate.getUTCSeconds() !== 0) {
            throw { status: 400, message: "Le créneau doit commencer à une heure pleine." };
        }
        const startHour = startDate.getUTCHours();
        if (startHour < 10 || startHour >= 23) {
            throw { status: 400, message: "L'heure de début doit être entre 10h et 23h UTC." };
        }

        const room = await this.repo.getRoom(roomId);
        if (!room) throw { status: 404, message: "Salle introuvable." };
        
        if (room.maintenance_start_at && room.maintenance_end_at) {
            const maintStart = new Date(room.maintenance_start_at);
            const maintEnd = new Date(room.maintenance_end_at);
            if (startDate < maintEnd && endDate > maintStart) {
                throw { status: 409, message: "La salle est en maintenance sur cette période." };
            }
        }

        const futureCount = await this.repo.countFutureBookings(memberId, now);
        if (futureCount >= 2) {
            throw { status: 409, message: "Un membre ne peut pas avoir plus de 2 réservations à venir." };
        }

        try {
            const id = 'booking-' + crypto.randomUUID();
            return await this.repo.createBooking({ id, roomId, memberId, start, end });
        } catch (error) {
            if (error.code === '23P01') {
                throw { status: 409, message: "Cette salle est déjà réservée sur ce créneau." };
            }
            throw error;
        }
    }
}

module.exports = BookingService;