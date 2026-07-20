(function () {
    const API_URL = '/api/v1/itineraries';
    const TRIPS_API = '/api/v1/trips';
    const DEV_USER_ID = 1;

    const tripSelector = document.querySelector('#trip-selector');
    const itineraryWorkspace = document.querySelector('#itinerary-workspace');
    const itineraryListSection = document.querySelector('#itinerary-list-section');
    const itineraryForm = document.querySelector('#itinerary-form');
    const itineraryIdInput = document.querySelector('#itinerary-id');
    const tripIdInput = document.querySelector('#trip-id');
    
    const titleInput = document.querySelector('#title');
    const locationInput = document.querySelector('#location');
    const dateInput = document.querySelector('#date');
    const startTimeInput = document.querySelector('#start-time');
    const endTimeInput = document.querySelector('#end-time');
    const sequenceOrderInput = document.querySelector('#sequence-order');
    const descriptionInput = document.querySelector('#description');
    
    const itineraryList = document.querySelector('#itinerary-list');
    const itineraryCount = document.querySelector('#itinerary-count');
    const itineraryDetail = document.querySelector('#itinerary-detail');
    const itineraryAlert = document.querySelector('#itinerary-alert');
    const formTitle = document.querySelector('#itinerary-form-title');
    const saveItineraryButton = document.querySelector('#save-itinerary-button');
    const cancelEditButton = document.querySelector('#cancel-edit-button');
    const newItineraryButton = document.querySelector('#new-itinerary-button');

    let trips = [];
    let itineraries = [];
    let selectedTripId = '';

    let alertTimeout;
    const showAlert = (message, isError) => {
        itineraryAlert.textContent = message;
        itineraryAlert.hidden = false;
        itineraryAlert.classList.toggle('is-error', Boolean(isError));
        clearTimeout(alertTimeout);
        if (!isError) {
            alertTimeout = setTimeout(hideAlert, 5000);
        }
    };

    const hideAlert = () => {
        itineraryAlert.hidden = true;
        itineraryAlert.textContent = '';
        itineraryAlert.classList.remove('is-error');
    };

    const escapeHtml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const formatDate = (value) => {
        if (!value) return 'Not set';
        return new Intl.DateTimeFormat('en', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(`${value}T00:00:00`));
    };
    
    const formatTime = (timeString) => {
        if (!timeString) return '';
        const [hourStr, minute] = timeString.split(':');
        let hour = parseInt(hourStr, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${hour}:${minute} ${ampm}`;
    };

    const requestJson = async (url, options = {}) => {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
            const validationMessage = Array.isArray(result.errors) && result.errors.length > 0
                ? result.errors.map((error) => error.message).join(' ')
                : result.message;
            throw new Error(validationMessage || 'Request failed.');
        }

        return result.data;
    };

    const resetForm = () => {
        itineraryForm.reset();
        itineraryIdInput.value = '';
        tripIdInput.value = selectedTripId;
        sequenceOrderInput.value = '0';
        formTitle.textContent = 'Add Activity';
        saveItineraryButton.textContent = 'Add Activity';
        cancelEditButton.hidden = true;
    };

    const fillFormWithItinerary = (itinerary) => {
        itineraryIdInput.value = itinerary.id;
        tripIdInput.value = itinerary.tripId;
        titleInput.value = itinerary.title;
        locationInput.value = itinerary.location;
        dateInput.value = itinerary.date;
        startTimeInput.value = itinerary.startTime;
        endTimeInput.value = itinerary.endTime || '';
        sequenceOrderInput.value = itinerary.sequenceOrder || 0;
        descriptionInput.value = itinerary.description || '';
        formTitle.textContent = 'Edit Activity';
        saveItineraryButton.textContent = 'Update Activity';
        cancelEditButton.hidden = false;
    };

    const renderItineraryDetail = (itinerary) => {
        itineraryDetail.classList.remove('empty-state');
        itineraryDetail.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span>Title</span>
                    <strong>${escapeHtml(itinerary.title)}</strong>
                </div>
                <div class="detail-item">
                    <span>Location</span>
                    <strong>${escapeHtml(itinerary.location)}</strong>
                </div>
                <div class="detail-item">
                    <span>Date</span>
                    <strong>${formatDate(itinerary.date)}</strong>
                </div>
                <div class="detail-item">
                    <span>Time</span>
                    <strong>${formatTime(itinerary.startTime)}${itinerary.endTime ? ' - ' + formatTime(itinerary.endTime) : ''}</strong>
                </div>
            </div>
            <p class="detail-description">${escapeHtml(itinerary.description || 'No description added.')}</p>
        `;
    };

    const renderItineraries = () => {
        itineraryCount.textContent = itineraries.length === 1
            ? '1 activity found.'
            : `${itineraries.length} activities found.`;

        if (itineraries.length === 0) {
            itineraryList.innerHTML = '<p class="empty-state">No activities recorded for this trip yet.</p>';
            itineraryDetail.textContent = 'No activity selected.';
            itineraryDetail.classList.add('empty-state');
            return;
        }

        // Group by Date
        const grouped = itineraries.reduce((acc, item) => {
            if (!acc[item.date]) {
                acc[item.date] = {
                    date: item.date,
                    dayNumber: item.dayNumber,
                    items: []
                };
            }
            acc[item.date].items.push(item);
            return acc;
        }, {});

        const groupList = Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));

        itineraryList.innerHTML = groupList.map((group) => `
            <div class="itinerary-day-group">
                <div class="itinerary-day-header">
                    Day ${group.dayNumber} - ${formatDate(group.date)}
                </div>
                ${group.items.map((itinerary) => `
                    <article class="itinerary-card-row" data-itinerary-id="${itinerary.id}">
                        <div class="itinerary-card-row__header">
                            <div>
                                <h3>${escapeHtml(itinerary.title)}</h3>
                                <p><i class="fas fa-map-marker-alt"></i> ${escapeHtml(itinerary.location)}</p>
                            </div>
                            <div style="text-align: right;">
                                <span class="itinerary-time">${formatTime(itinerary.startTime)}</span>
                                ${itinerary.endTime ? `<br><small class="text-muted">to ${formatTime(itinerary.endTime)}</small>` : ''}
                            </div>
                        </div>
                        <div class="itinerary-actions">
                            <button class="btn btn-outline" type="button" data-action="view" data-itinerary-id="${itinerary.id}">View</button>
                            <button class="btn btn-outline" type="button" data-action="edit" data-itinerary-id="${itinerary.id}">Edit</button>
                            <button class="btn btn-danger" type="button" data-action="delete" data-itinerary-id="${itinerary.id}">Delete</button>
                        </div>
                    </article>
                `).join('')}
            </div>
        `).join('');
    };

    const loadTrips = async () => {
        const data = await requestJson(`${TRIPS_API}?userId=${DEV_USER_ID}`);
        trips = data.trips;

        tripSelector.innerHTML = '<option value="">— Choose a trip —</option>' +
            trips.map((trip) => (
                `<option value="${trip.id}">${escapeHtml(trip.destination)} (${formatDate(trip.startDate)} - ${formatDate(trip.endDate)})</option>`
            )).join('');
    };

    const loadItineraries = async (tripId) => {
        hideAlert();

        if (!tripId) {
            itineraries = [];
            itineraryWorkspace.hidden = true;
            itineraryListSection.hidden = true;
            renderItineraries();
            return;
        }

        itineraryWorkspace.hidden = false;
        itineraryListSection.hidden = false;
        tripIdInput.value = tripId;

        const data = await requestJson(`${TRIPS_API}/${tripId}/itineraries`);
        itineraries = data.itineraries;
        renderItineraries();
    };

    const loadItineraryDetail = async (id) => {
        const data = await requestJson(`${API_URL}/${id}`);
        renderItineraryDetail(data.itinerary);
    };

    tripSelector.addEventListener('change', async (event) => {
        selectedTripId = event.target.value;
        resetForm();
        
        try {
            await loadItineraries(selectedTripId);
        } catch (error) {
            showAlert(error.message, true);
        }
    });

    itineraryForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideAlert();

        if (!selectedTripId) {
            showAlert('Please select a trip first.', true);
            return;
        }

        if (startTimeInput.value && endTimeInput.value && endTimeInput.value < startTimeInput.value) {
            showAlert('End time must be on or after start time.', true);
            return;
        }

        const originalText = saveItineraryButton.textContent;
        saveItineraryButton.disabled = true;
        saveItineraryButton.textContent = 'Saving...';

        try {
            const itineraryId = itineraryIdInput.value;
            const payload = {
                tripId: selectedTripId,
                title: titleInput.value,
                location: locationInput.value,
                date: dateInput.value,
                startTime: startTimeInput.value,
                endTime: endTimeInput.value || null,
                sequenceOrder: sequenceOrderInput.value || 0,
                description: descriptionInput.value || null
            };

            if (itineraryId) {
                await requestJson(`${API_URL}/${itineraryId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showAlert('Activity updated successfully.');
            } else {
                await requestJson(API_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                showAlert('Activity created successfully.');
            }

            resetForm();
            await loadItineraries(selectedTripId);
        } catch (error) {
            showAlert(error.message, true);
        } finally {
            saveItineraryButton.disabled = false;
            saveItineraryButton.textContent = originalText;
        }
    });

    itineraryList.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }

        const itineraryId = button.dataset.itineraryId;
        const action = button.dataset.action;
        const itinerary = itineraries.find((item) => String(item.id) === String(itineraryId));

        hideAlert();

        try {
            if (action === 'view') {
                await loadItineraryDetail(itineraryId);
                // Scroll up on mobile
                if (window.innerWidth <= 768) {
                    itineraryDetail.scrollIntoView({ behavior: 'smooth' });
                }
            }

            if (action === 'edit' && itinerary) {
                fillFormWithItinerary(itinerary);
                titleInput.focus();
                if (window.innerWidth <= 768) {
                    itineraryForm.scrollIntoView({ behavior: 'smooth' });
                }
            }

            if (action === 'delete') {
                const shouldDelete = window.confirm('Delete this activity? This cannot be undone.');
                if (!shouldDelete) {
                    return;
                }

                await requestJson(`${API_URL}/${itineraryId}`, {
                    method: 'DELETE'
                });
                showAlert('Activity deleted successfully.');
                resetForm();
                await loadItineraries(selectedTripId);
            }
        } catch (error) {
            showAlert(error.message, true);
        }
    });

    cancelEditButton.addEventListener('click', () => {
        resetForm();
        hideAlert();
    });

    newItineraryButton.addEventListener('click', () => {
        if (!selectedTripId) {
            showAlert('Please select a trip first before adding an activity.', true);
            tripSelector.focus();
            return;
        }

        resetForm();
        hideAlert();
        titleInput.focus();
    });

    loadTrips().catch((error) => {
        showAlert(error.message, true);
    });

}());
