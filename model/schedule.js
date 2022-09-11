const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const scheduleSchema = mongoose.Schema({
    text: {type: String},
    date: {type: Date},
    start_time: {type: String},
    end_time: {type: String},
    start_date: {type: Date},
    end_date: {type: Date},
    details: {type: String},
    student: {type: String}, 
    meeting_status: {type: String, enum: ["open", "closed"]},
    adv_status: {type: String, enum: ["Scheduled", "Complete", "Canceled", "No Show"]},
    degree_plan: {type: String},
    meeting_type: {type: String},
    skype_id: {type: String},
    proposed_schedule: [{
        semester:{type: String}, prefix: {type: String}, course_number: {type: String}, crn: {type: String}, title: {type: String}
    }],
    questions: {type: String}
});

const Schedule = mongoose.model('schedules', scheduleSchema);
module.exports = mongoose.model('schedules', scheduleSchema);
