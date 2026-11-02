const BookingService = require('../src/domain/BookingService');
const { FixedClock } = require('../src/domain/Clock');

describe('BookingService', () => {
    let service;
    let mockRepo;
    let clock;

    beforeEach(() => {
        mockRepo = {
            getRoom: jest.fn(),
            countFutureBookings: jest.fn(),
            createBooking: jest.fn()
        };
        clock = new FixedClock('2026-11-01T10:00:00Z');
        service = new BookingService(mockRepo, clock);
    });

    test('rejette une réservation de plus de 4 heures', async () => {
        const commande = { memberId: 'member-1', roomId: 'room-1', start: '2026-11-05T14:00:00Z', end: '2026-11-05T19:00:00Z' };
        await expect(service.createBooking(commande)).rejects.toEqual({ status: 400, message: "La durée doit être comprise entre 1h et 4h." });
    });

    test('rejette une réservation qui ne commence pas à une heure pleine', async () => {
        const commande = { memberId: 'member-1', roomId: 'room-1', start: '2026-11-05T14:30:00Z', end: '2026-11-05T16:30:00Z' };
        await expect(service.createBooking(commande)).rejects.toEqual({ status: 400, message: "Le créneau doit commencer à une heure pleine." });
    });

    test('rejette une réservation si la salle est en maintenance', async () => {
        mockRepo.getRoom.mockResolvedValue({
            id: 'room-4',
            maintenance_start_at: '2026-11-05T00:00:00Z',
            maintenance_end_at: '2026-11-08T00:00:00Z'
        });
        const commande = { memberId: 'member-1', roomId: 'room-4', start: '2026-11-06T14:00:00Z', end: '2026-11-06T16:00:00Z' };
        
        await expect(service.createBooking(commande)).rejects.toEqual({ status: 409, message: "La salle est en maintenance sur cette période." });
    });

    test('rejette une réservation si le membre a déjà 2 réservations à venir', async () => {
        mockRepo.getRoom.mockResolvedValue({ id: 'room-1' });
        mockRepo.countFutureBookings.mockResolvedValue(2);
        
        const commande = { memberId: 'member-1', roomId: 'room-1', start: '2026-11-05T14:00:00Z', end: '2026-11-05T16:00:00Z' };
        
        await expect(service.createBooking(commande)).rejects.toEqual({ status: 409, message: "Un membre ne peut pas avoir plus de 2 réservations à venir." });
    });

    test('accepte et crée une réservation valide', async () => {
        mockRepo.getRoom.mockResolvedValue({ id: 'room-1' });
        mockRepo.countFutureBookings.mockResolvedValue(0);
        mockRepo.createBooking.mockResolvedValue({ id: 'booking-fake-id', status: 'confirmed' });
        
        const commande = { memberId: 'member-1', roomId: 'room-1', start: '2026-11-05T14:00:00Z', end: '2026-11-05T16:00:00Z' };
        const result = await service.createBooking(commande);
        
        expect(result.id).toBe('booking-fake-id');
        expect(mockRepo.createBooking).toHaveBeenCalled();
    });
});