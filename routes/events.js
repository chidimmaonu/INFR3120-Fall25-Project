var express = require('express');
var router = express.Router();
var Event = require('../models/event');
// Import authentication middleware
const { ensureAuthenticated } = require('../middleware/auth');


/**
 * Events Routes
 * Public routes: GET / (list all events)
 * Protected routes: GET /create, POST /create, GET /edit/:id, POST /edit/:id, POST /delete/:id
 */


// GET /events - Display all events
router.get('/', async function(req, res, next) {
  try {
    // Fetch all events from database, sorted by date
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






//PROTECTED ROUTES (Require Login)


/**
 * GET /events/create - Show create form
 * PROTECTED: Only logged-in users can access
 * ensureAuthenticated middleware checks if user is logged in
 */


router.get('/create', ensureAuthenticated, function(req, res, next) {
  res.render('events/form', {
    title: 'Create Event — Timely',
    page: 'create',
    event: null,
    isEdit: false
  });
});




/**
 * POST /events/create - Handle create form submission
 * PROTECTED: Only logged-in users can create events
 */
router.post('/create', ensureAuthenticated, async function(req, res, next) {
  try {
    // Create new event with form data
    const newEvent = new Event({
      title: req.body.title,
      date: req.body.date,
      location: req.body.location,
      description: req.body.description
    });
   
    // Save to database
    await newEvent.save();
   
    // Success message
    req.flash('success', 'Event created successfully');
    res.redirect('/events');
  } catch (error) {
    console.error('Error creating event:', error);
    req.flash('error', 'Failed to create event');
    res.redirect('/events/create');
  }
});




/**
 * GET /events/delete/:id - Show delete confirmation page
 * PROTECTED: Only logged-in users can access delete confirmation
 */
router.get('/delete/:id', ensureAuthenticated, async function(req, res, next) {
  try {
    // Find the event by ID
    const event = await Event.findById(req.params.id);
   
    // If event not found, show error and redirect
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
   
    // Render the delete confirmation page
    res.render('events/delete', {
      title: 'Delete Event — Timely',
      page: 'delete',
      event: event
    });
  } catch (error) {
    console.error('Error fetching event for deletion:', error);
    req.flash('error', 'Event not found');
    res.redirect('/events');
  }
});




/**
 * GET /events/edit/:id - Show edit form
 * PROTECTED: Only logged-in users can edit events
 */
router.get('/edit/:id', ensureAuthenticated, async function(req, res, next) {
  try {
    // Find event by ID
    const event = await Event.findById(req.params.id);
   
    // If event not found
    if (!event) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
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
    req.flash('error', 'Event not found');
    res.redirect('/events');
  }
});




/**
 * POST /events/edit/:id - Handle edit form submission
 * PROTECTED: Only logged-in users can update events
 */
router.post('/edit/:id', ensureAuthenticated, async function(req, res, next) {
  try {
    // Find and update event
    const updated = await Event.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        date: req.body.date,
        location: req.body.location,
        description: req.body.description
      },
      { new: true, runValidators: true } // Return updated doc & validate
    );
   
    // If event not found
    if (!updated) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
   
    // Success message
    req.flash('success', 'Event updated successfully');
    res.redirect('/events');
  } catch (error) {
    console.error('Error updating event:', error);
    req.flash('error', 'Failed to update event');
    res.redirect('/events');
  }
});






/**
 * POST /events/delete/:id - Handle delete
 * PROTECTED: Only logged-in users can delete events
 */
router.post('/delete/:id', ensureAuthenticated, async function(req, res, next) {
  try {
    // Find and delete event
    const deleted = await Event.findByIdAndDelete(req.params.id);
   
    // If event not found
    if (!deleted) {
      req.flash('error', 'Event not found');
      return res.redirect('/events');
    }
   
    // Success message
    req.flash('success', 'Event deleted successfully');
    res.redirect('/events');
  } catch (error) {
    console.error('Error deleting event:', error);
    req.flash('error', 'Failed to delete event');
    res.redirect('/events');
  }
});




module.exports = router;
