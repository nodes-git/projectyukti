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
            const eventDate = new Date(event.event_date);
            return eventDate.getDate() === day && 
                   eventDate.getMonth() === month && 
                   eventDate.getFullYear() === year;
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
    selectedDate = new Date(year, month, day);
    renderCalendar();
    updateEventsList();
}

function updateEventsList() {
    const eventsList = document.getElementById('eventsList');
    let filteredEvents = events;
    
    if (selectedDate) {
        filteredEvents = events.filter(event => {
            const eventDate = new Date(event.event_date);
            return eventDate.getDate() === selectedDate.getDate() && 
                   eventDate.getMonth() === selectedDate.getMonth() && 
                   eventDate.getFullYear() === selectedDate.getFullYear();
        });
    } else {
        // Show current month's events if no date selected
        filteredEvents = events.filter(event => {
            const eventDate = new Date(event.event_date);
            return eventDate.getMonth() === currentDate.getMonth() && 
                   eventDate.getFullYear() === currentDate.getFullYear();
        });
    }
    
    if (filteredEvents.length === 0) {
        eventsList.innerHTML = '<div class="event-card">No events scheduled for this period.</div>';
        return;
    }
    
    eventsList.innerHTML = filteredEvents.map(event => {
        const eventDate = new Date(event.event_date);
        const eventTime = new Date(`${event.event_date}T${event.event_time}`);
        
        return `
            <div class="event-card">
                <h4>${event.event_name}</h4>
                <div class="event-details">
                    <div>${event.event_description}</div>
                    <div class="event-time">
                        ${eventTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div class="event-fee">
                        ${event.is_free ? 
                            '<span class="event-free">Free</span>' : 
                            `₹${event.entry_fee}`}
                    </div>
                    ${event.location ? `<div>📍 ${event.location}</div>` : ''}
                    ${event.registration_link ? 
                        `<a href="${event.registration_link}" class="register-button" target="_blank">Register Now</a>` : 
                        ''}
                </div>
            </div>
        `;
    }).join('');
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

// Initial load - wait for both DOM and Supabase
document.addEventListener('DOMContentLoaded', () => {
    initializeCalendar();
});
