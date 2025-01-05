// Wait for Supabase client to be initialized from script.js
let currentDate = new Date();
let selectedDate = null;
let events = [];

// Wait for supabase to be initialized
const initializeCalendar = () => {
    if (typeof window.supabase === 'undefined') {
        setTimeout(initializeCalendar, 100); // Check again in 100ms
        return;
    }
    fetchEvents();
};

async function fetchEvents() {
    try {
        const { data, error } = await window.supabase
            .from('events')
            .select('*')
            .order('event_date', { ascending: true });

        if (error) throw error;
        events = data;
        renderCalendar();
        updateEventsList();
    } catch (error) {
        console.error('Error fetching events:', error);
        document.getElementById('eventsList').innerHTML = 'Error loading events. Please try again later.';
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Update header
    document.getElementById('currentMonth').textContent = 
        new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    let calendarHTML = '';
    
    // Empty cells before first day
    for (let i = 0; i < startingDay; i++) {
        calendarHTML += '<div class="calendar-date"></div>';
    }
    
    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const hasEvent = events.some(event => {
            const [eventYear, eventMonth, eventDay] = event.event_date.split('-').map(Number);
            return eventDay === day && 
                   eventMonth === month + 1 && 
                   eventYear === year;
        });
        
        const isSelected = selectedDate && 
            date.getDate() === selectedDate.getDate() && 
            date.getMonth() === selectedDate.getMonth() && 
            date.getFullYear() === selectedDate.getFullYear();
        
        calendarHTML += `
            <div class="calendar-date ${hasEvent ? 'has-event' : ''} ${isSelected ? 'selected' : ''}"
                 onclick="selectDate(${year}, ${month}, ${day})">
                ${day}
            </div>`;
    }
    
    document.getElementById('calendarDates').innerHTML = calendarHTML;
}

function selectDate(year, month, day) {
    const newSelectedDate = new Date(year, month, day);
    
    // If clicking the same date, deselect it
    if (selectedDate && 
        selectedDate.getDate() === newSelectedDate.getDate() && 
        selectedDate.getMonth() === newSelectedDate.getMonth() && 
        selectedDate.getFullYear() === newSelectedDate.getFullYear()) {
        selectedDate = null;
    } else {
        selectedDate = newSelectedDate;
    }
    
    renderCalendar();
    updateEventsList();
}

function updateEventsList() {
    const eventsList = document.getElementById('eventsList');
    let filteredEvents = events;
    const now = new Date();
    
    if (selectedDate) {
        filteredEvents = events.filter(event => {
            const [eventYear, eventMonth, eventDay] = event.event_date.split('-').map(Number);
            return eventDay === selectedDate.getDate() && 
                   eventMonth === selectedDate.getMonth() + 1 && 
                   eventYear === selectedDate.getFullYear();
        });
    } else {
        // Show current month's events if no date selected
        filteredEvents = events.filter(event => {
            const [eventYear, eventMonth, eventDay] = event.event_date.split('-').map(Number);
            return eventMonth === currentDate.getMonth() + 1 && 
                   eventYear === currentDate.getFullYear();
        });
    }

    // Separate past and future events
    const pastEvents = filteredEvents.filter(event => {
        const [eventYear, eventMonth, eventDay] = event.event_date.split('-').map(Number);
        const [hours, minutes] = event.event_time.split(':').map(Number);
        const eventDateTime = new Date(eventYear, eventMonth - 1, eventDay, hours, minutes);
        return eventDateTime < now;
    });
    const futureEvents = filteredEvents.filter(event => {
        const [eventYear, eventMonth, eventDay] = event.event_date.split('-').map(Number);
        const [hours, minutes] = event.event_time.split(':').map(Number);
        const eventDateTime = new Date(eventYear, eventMonth - 1, eventDay, hours, minutes);
        return eventDateTime >= now;
    });
    
    // Sort future events by date (ascending)
    futureEvents.sort((a, b) => {
        const [eventYearA, eventMonthA, eventDayA] = a.event_date.split('-').map(Number);
        const [hoursA, minutesA] = a.event_time.split(':').map(Number);
        const eventDateTimeA = new Date(eventYearA, eventMonthA - 1, eventDayA, hoursA, minutesA);
        const [eventYearB, eventMonthB, eventDayB] = b.event_date.split('-').map(Number);
        const [hoursB, minutesB] = b.event_time.split(':').map(Number);
        const eventDateTimeB = new Date(eventYearB, eventMonthB - 1, eventDayB, hoursB, minutesB);
        return eventDateTimeA - eventDateTimeB;
    });
    
    // Sort past events by date (descending)
    pastEvents.sort((a, b) => {
        const [eventYearA, eventMonthA, eventDayA] = a.event_date.split('-').map(Number);
        const [hoursA, minutesA] = a.event_time.split(':').map(Number);
        const eventDateTimeA = new Date(eventYearA, eventMonthA - 1, eventDayA, hoursA, minutesA);
        const [eventYearB, eventMonthB, eventDayB] = b.event_date.split('-').map(Number);
        const [hoursB, minutesB] = b.event_time.split(':').map(Number);
        const eventDateTimeB = new Date(eventYearB, eventMonthB - 1, eventDayB, hoursB, minutesB);
        return eventDateTimeB - eventDateTimeA;
    });

    // Combine future events followed by past events
    const sortedEvents = [...futureEvents, ...pastEvents];

    if (sortedEvents.length === 0) {
        eventsList.innerHTML = '<p class="no-events">No events scheduled for this period.</p>';
        return;
    }

    let eventsHTML = '<div class="events-list-inner">';
    sortedEvents.forEach(event => {
        // Combine event_date and event_time into a single Date object
        const [year, month, day] = event.event_date.split('-').map(Number);
        const [hours, minutes] = event.event_time.split(':').map(Number);
        const eventDateTime = new Date(year, month - 1, day, hours, minutes);
        
        const isPast = eventDateTime < now;
        
        // Format the date in Indian format
        const formattedDate = new Intl.DateTimeFormat('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Kolkata'
        }).format(eventDateTime);

        // Format the time in 12-hour format with AM/PM
        const formattedTime = new Intl.DateTimeFormat('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Kolkata'
        }).format(eventDateTime);

        eventsHTML += `
            <div class="event-item ${isPast ? 'past-event' : ''}">
                <div class="event-date">
                    <i class="fas fa-calendar-alt"></i>
                    ${formattedDate} at ${formattedTime}
                </div>
                <h4 class="event-title">${event.event_name}</h4>
                <p class="event-description">${event.event_description || ''}</p>
                ${event.location ? `<p class="event-location"><i class="fas fa-map-marker-alt"></i> ${event.location}</p>` : ''}
                <div class="event-fee">
                    ${event.is_free ? 
                        '<span class="event-free">Free</span>' : 
                        `₹${event.entry_fee}`}
                </div>
                ${event.registration_link ? 
                    `<a href="${event.registration_link}" class="register-button" target="_blank">Register Now</a>` : 
                    ''}
            </div>
        `;
    });
    eventsHTML += '</div>';
    eventsList.innerHTML = eventsHTML;
}

// Navigation handlers
document.getElementById('prevMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    updateEventsList();
});

document.getElementById('nextMonth').addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    updateEventsList();
});

// Refresh button handler
document.getElementById('refreshEvents').addEventListener('click', async () => {
    const refreshBtn = document.getElementById('refreshEvents');
    refreshBtn.classList.add('spinning');
    
    try {
        await fetchEvents(); // This will automatically update the calendar and events list
    } catch (error) {
        console.error('Error refreshing events:', error);
    } finally {
        setTimeout(() => {
            refreshBtn.classList.remove('spinning');
        }, 1000);
    }
});

// Initial load - wait for both DOM and Supabase
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
});
