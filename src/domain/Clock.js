class Clock {
    now() {
        return new Date();
    }
}

class FixedClock extends Clock {
    constructor(fixedDate) {
        super();
        this.fixedDate = new Date(fixedDate);
    }
    now() {
        return this.fixedDate;
    }
}

module.exports = { Clock, FixedClock };