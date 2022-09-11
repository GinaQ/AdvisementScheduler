const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


// Child Schema
const studentSchema = mongoose.Schema({
    ucoid: {
        type: Number, required: [true, 'UCO ID required'], unique: false
    },
    firstname: {
        type: String, required: [true, 'First name required']
    },
    lastname: {
        type: String, required: [true, 'Last name required']
    },
    phone: {    
        type: String, required: [true, 'Phone number required. Use format ###-###-####']
    },
    major: {
        type: String, enum: ['Computer Science', 'Computer Science - Applied', 
        'Computer Science - Information Science', 'Software Engineering']
    },
    advstatus: {
        type: String, enum: ['', 'Complete', 'Scheduled']
    },
    advisementhistory: [{
        type: String
    }],
    documents: [{
        type: Object
    }],
    notes: [{
        date:Date, text:String
    }],
    updated: {type: Date, default: Date.now}    // stores date of last update
});

const Student = mongoose.model('students', studentSchema);
module.exports = mongoose.model('students', studentSchema);


