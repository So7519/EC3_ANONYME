const db = require('./db');

class BookingRepository {
    async getRoom(roomId) {
        const result = await db.query('SELECT * FROM rooms WHERE id = $1', [roomId]);
        return result.rows[0];
    }

    async countFutureBookings(memberId, currentDate) {
        const result = await db.query(
            `SELECT COUNT(*) FROM bookings 
             WHERE member_id = $1 AND start_at > $2 AND status = 'confirmed'`,
            [memberId, currentDate]
        );
        return parseInt(result.rows[0].count, 10);
    }

    async createBooking({ id, roomId, memberId, start, end }) {
        const result = await db.query(
            `INSERT INTO bookings (id, room_id, member_id, start_at, end_at, status) 
             VALUES ($1, $2, $3, $4, $5, 'confirmed') RETURNING *`,
            [id, roomId, memberId, start, end]
        );
        return result.rows[0];
    }
}

module.exports = BookingRepository;