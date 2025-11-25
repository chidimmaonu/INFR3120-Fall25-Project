var express = require('express');
var router = express.Router();
var Event = require('../models/event');


// GET /events - Display all events
router.get('/', async function(req, res, next) {
  try {
    const events = await Event.find().sort({ date: 1 }); // Sort by date ascending
    res.render('events/list', {
      title: 'Events — Timely',
      page: 'events',
      events: events,
      message: req.query.message || null
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.render('events/list', {
      title: 'Events — Timely',
      page: 'events',
      events: [],
      message: 'Error loading events'
    });
  }
});


// GET /events/create - Show create form
router.get('/create', function(req, res, next) {
  res.render('events/form', {
    title: 'Create Event — Timely',
    page: 'create',
    event: null,
    isEdit: false
  });
});


// POST /events/create - Handle create form submission
router.post('/create', async function(req, res, next) {
  try {
    const newEvent = new Event({
      title: req.body.title,
      date: req.body.date,
      location: req.body.location,
      description: req.body.description
    });
   
    await newEvent.save();
    res.redirect('/events?message=Event created successfully');
  } catch (error) {
    console.error('Error creating event:', error);
    res.redirect('/events/create?error=Failed to create event');
  }
});


// GET /events/edit/:id - Show edit form
router.get('/edit/:id', async function(req, res, next) {
  try {
    const event = await Event.findById(req.params.id);
   
    if (!event) {
      return res.redirect('/events?message=Event not found');
    }
   
    // Format date for input field (YYYY-MM-DD)
    const formattedEvent = {
      ...event.toObject(),
      date: event.date.toISOString().split('T')[0]
    };
   
    res.render('events/form', {
      title: 'Edit Event — Timely',
      page: 'edit',
      event: formattedEvent,
      isEdit: true
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    res.redirect('/events?message=Event not found');
  }
});


// POST /events/edit/:id - Handle edit form submission
router.post('/edit/:id', async function(req, res, next) {
  try {
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        date: req.body.date,
        location: req.body.location,
        description: req.body.description
      },
      { new: true, runValidators: true }
    );
   
    if (!updated) {
      return res.redirect('/events?message=Event not found');
    }
   
    res.redirect('/events?message=Event updated successfully');
  } catch (error) {
    console.error('Error updating event:', error);
    res.redirect('/events?message=Failed to update event');
  }
});


// POST /events/delete/:id - Handle delete
router.post('/delete/:id', async function(req, res, next) {
  try {
    const deleted = await Event.findByIdAndDelete(req.params.id);
   
    if (!deleted) {
      return res.redirect('/events?message=Event not found');
    }
   
    res.redirect('/events?message=Event deleted successfully');
  } catch (error) {
    console.error('Error deleting event:', error);
    res.redirect('/events?message=Failed to delete event');
  }
});


module.exports = router;
