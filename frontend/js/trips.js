(function () {
    const API_URL = '/api/v1/trips';
    const DEV_USER_ID = 1;

    const tripForm = document.querySelector('#trip-form');
    const tripIdInput = document.querySelector('#trip-id');
    const destinationInput = document.querySelector('#destination');
    const startDateInput = document.querySelector('#start-date');
    const endDateInput = document.querySelector('#end-date');
    const numTravelersInput = document.querySelector('#num-travelers');
    const statusInput = document.querySelector('#status');
    const descriptionInput = document.querySelector('#description');
    const tripList = document.querySelector('#trip-list');
    const tripCount = document.querySelector('#trip-count');
    const tripDetail = document.querySelector('#trip-detail');
    const tripAlert = document.querySelector('#trip-alert');
    const formTitle = document.querySelector('#trip-form-title');
    const saveTripButton = document.querySelector('#save-trip-button');
    const cancelEditButton = document.querySelector('#cancel-edit-button');
    const newTripButton = document.querySelector('#new-trip-button');

    let trips = [];

    let alertTimeout;
    const showAlert = (message, isError) => {
        tripAlert.textContent = message;
        tripAlert.hidden = false;
        tripAlert.classList.toggle('is-error', Boolean(isError));
        clearTimeout(alertTimeout);
        if (!isError) {
            alertTimeout = setTimeout(hideAlert, 5000);
        }
    };

    const hideAlert = () => {
        tripAlert.hidden = true;
        tripAlert.textContent = '';
        tripAlert.classList.remove('is-error');
    };

    const formatDate = (value) => {
        if (!value) {
            return 'Not set';
        }

        return new Intl.DateTimeFormat('en', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(`${value}T00:00:00`));
    };

    const escapeHtml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

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

    const getFormPayload = () => ({
        userId: DEV_USER_ID,
        destination: destinationInput.value,
        startDate: startDateInput.value,
        endDate: endDateInput.value,
        description: descriptionInput.value,
        numTravelers: Number(numTravelersInput.value),
        status: statusInput.value
    });

    const resetForm = () => {
        tripForm.reset();
        tripIdInput.value = '';
        numTravelersInput.value = '1';
        statusInput.value = 'upcoming';
        formTitle.textContent = 'Create Trip';
        saveTripButton.textContent = 'Create Trip';
        cancelEditButton.hidden = true;
    };

    const renderTripDetail = (trip) => {
        tripDetail.classList.remove('empty-state');
        tripDetail.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span>Destination</span>
                    <strong>${escapeHtml(trip.destination)}</strong>
                </div>
                <div class="detail-item">
                    <span>Dates</span>
                    <strong>${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}</strong>
                </div>
                <div class="detail-item">
                    <span>Travelers</span>
                    <strong>${trip.numTravelers}</strong>
                </div>
                <div class="detail-item">
                    <span>Status</span>
                    <strong>${escapeHtml(trip.status)}</strong>
                </div>
            </div>
            <p class="detail-description">${escapeHtml(trip.description || 'No description added.')}</p>
        `;
    };

    const renderTrips = () => {
        tripCount.textContent = trips.length === 1 ? '1 trip found.' : `${trips.length} trips found.`;

        if (trips.length === 0) {
            tripList.innerHTML = '<p class="empty-state">No trips yet. Create your first trip to get started.</p>';
            tripDetail.textContent = 'No trip selected.';
            tripDetail.classList.add('empty-state');
            return;
        }

        tripList.innerHTML = trips.map((trip) => `
            <article class="trip-card-row" data-trip-id="${trip.id}">
                <div class="trip-card-row__header">
                    <div>
                        <h3>${escapeHtml(trip.destination)}</h3>
                        <p>${escapeHtml(trip.description || 'No description added.')}</p>
                    </div>
                    <span class="trip-status">${escapeHtml(trip.status)}</span>
                </div>
                <p class="trip-meta">
                    ${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}
                    - ${trip.numTravelers} traveler${trip.numTravelers === 1 ? '' : 's'}
                </p>
                <div class="trip-actions">
                    <button class="btn btn-outline" type="button" data-action="view" data-trip-id="${trip.id}">View</button>
                    <button class="btn btn-outline" type="button" data-action="edit" data-trip-id="${trip.id}">Edit</button>
                    <button class="btn btn-danger" type="button" data-action="delete" data-trip-id="${trip.id}">Delete</button>
                </div>
            </article>
        `).join('');
    };

    const loadTrips = async () => {
        const data = await requestJson(`${API_URL}?userId=${DEV_USER_ID}`);
        trips = data.trips;
        renderTrips();
    };

    const loadTripDetail = async (id) => {
        const data = await requestJson(`${API_URL}/${id}`);
        renderTripDetail(data.trip);
    };

    const editTrip = (trip) => {
        tripIdInput.value = trip.id;
        destinationInput.value = trip.destination;
        startDateInput.value = trip.startDate;
        endDateInput.value = trip.endDate;
        numTravelersInput.value = trip.numTravelers;
        statusInput.value = trip.status;
        descriptionInput.value = trip.description || '';
        formTitle.textContent = 'Edit Trip';
        saveTripButton.textContent = 'Update Trip';
        cancelEditButton.hidden = false;
        destinationInput.focus();
    };

    tripForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideAlert();

        const payload = getFormPayload();
        if (payload.startDate && payload.endDate && payload.endDate < payload.startDate) {
            showAlert('End date must be on or after start date.', true);
            return;
        }

        const originalText = saveTripButton.textContent;
        saveTripButton.disabled = true;
        saveTripButton.textContent = 'Saving...';

        try {
            const tripId = tripIdInput.value;

            if (tripId) {
                await requestJson(`${API_URL}/${tripId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showAlert('Trip updated successfully.');
            } else {
                await requestJson(API_URL, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                showAlert('Trip created successfully.');
            }

            resetForm();
            await loadTrips();
        } catch (error) {
            showAlert(error.message, true);
        } finally {
            saveTripButton.disabled = false;
            saveTripButton.textContent = originalText;
        }
    });

    tripList.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) {
            return;
        }

        const tripId = button.dataset.tripId;
        const action = button.dataset.action;
        const trip = trips.find((item) => String(item.id) === String(tripId));

        hideAlert();

        try {
            if (action === 'view') {
                await loadTripDetail(tripId);
            }

            if (action === 'edit' && trip) {
                editTrip(trip);
            }

            if (action === 'delete') {
                const shouldDelete = window.confirm('Delete this trip? This cannot be undone.');
                if (!shouldDelete) {
                    return;
                }

                await requestJson(`${API_URL}/${tripId}`, {
                    method: 'DELETE'
                });
                showAlert('Trip deleted successfully.');
                resetForm();
                await loadTrips();
            }
        } catch (error) {
            showAlert(error.message, true);
        }
    });

    cancelEditButton.addEventListener('click', () => {
        resetForm();
        hideAlert();
    });

    newTripButton.addEventListener('click', () => {
        resetForm();
        hideAlert();
        destinationInput.focus();
    });

    loadTrips().catch((error) => {
        showAlert(error.message, true);
        tripCount.textContent = 'Unable to load trips.';
    });
}());
