(function () {
    const TRIPS_API = '/api/v1/trips';
    const BUDGETS_API = '/api/v1/budgets';
    const DEV_USER_ID = 1;

    const tripSelector = document.querySelector('#trip-selector');
    const budgetWorkspace = document.querySelector('#budget-workspace');
    const budgetForm = document.querySelector('#budget-form');
    const budgetIdInput = document.querySelector('#budget-id');
    const totalAmountInput = document.querySelector('#total-amount');
    const allocationFieldsContainer = document.querySelector('#allocation-fields');
    const allocationTotalLabel = document.querySelector('#allocation-total-label');
    const allocationRemainingLabel = document.querySelector('#allocation-remaining-label');
    const budgetFormTitle = document.querySelector('#budget-form-title');
    const saveBudgetButton = document.querySelector('#save-budget-button');
    const cancelEditButton = document.querySelector('#cancel-edit-button');
    const deleteBudgetButton = document.querySelector('#delete-budget-button');
    const budgetOverview = document.querySelector('#budget-overview');
    const budgetAlert = document.querySelector('#budget-alert');
    const budgetListContainer = document.querySelector('#budget-list');
    const budgetCount = document.querySelector('#budget-count');

    let categories = [];
    let trips = [];
    let currentBudget = null;

    let alertTimeout;
    const showAlert = (message, isError) => {
        budgetAlert.textContent = message;
        budgetAlert.hidden = false;
        budgetAlert.classList.toggle('is-error', Boolean(isError));
        clearTimeout(alertTimeout);
        if (!isError) {
            alertTimeout = setTimeout(hideAlert, 5000);
        }
    };

    const hideAlert = () => {
        budgetAlert.hidden = true;
        budgetAlert.textContent = '';
        budgetAlert.classList.remove('is-error');
    };

    const escapeHtml = (value) => String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

    const formatCurrency = (value) => {
        const num = Number(value);

        return '₹' + num.toLocaleString('en-IN', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
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

    // ── Allocation live-totals ──────────────────────────

    const recalcAllocationSummary = () => {
        const total = Number(totalAmountInput.value) || 0;
        let allocated = 0;

        categories.forEach((cat) => {
            const input = document.querySelector(`#alloc-${cat.slug}`);

            if (input) {
                allocated += Number(input.value) || 0;
            }
        });

        const remaining = total - allocated;

        allocationTotalLabel.textContent = `Allocated: ${formatCurrency(allocated)}`;
        allocationRemainingLabel.textContent = `Unallocated: ${formatCurrency(remaining)}`;
        allocationRemainingLabel.classList.toggle('over-budget', remaining < 0);
        allocationRemainingLabel.classList.toggle('under-budget', remaining >= 0);
    };

    // ── Render helpers ──────────────────────────────────

    const buildAllocationFields = () => {
        allocationFieldsContainer.innerHTML = categories.map((cat) => `
            <div class="allocation-field">
                <label for="alloc-${escapeHtml(cat.slug)}">${escapeHtml(cat.name)}</label>
                <input type="number" id="alloc-${escapeHtml(cat.slug)}"
                    data-category-id="${cat.id}"
                    min="0" step="0.01" value="0" placeholder="0">
            </div>
        `).join('');

        allocationFieldsContainer.addEventListener('input', recalcAllocationSummary);
        totalAmountInput.addEventListener('input', recalcAllocationSummary);
    };

    const resetForm = () => {
        budgetForm.reset();
        budgetIdInput.value = '';
        totalAmountInput.value = '';

        categories.forEach((cat) => {
            const input = document.querySelector(`#alloc-${cat.slug}`);

            if (input) {
                input.value = '0';
            }
        });

        budgetFormTitle.textContent = 'Create Budget';
        saveBudgetButton.innerHTML = '<i class="fas fa-save" aria-hidden="true"></i> Create Budget';
        cancelEditButton.hidden = true;
        deleteBudgetButton.hidden = true;
        currentBudget = null;

        recalcAllocationSummary();
    };

    const fillFormWithBudget = (budget) => {
        budgetIdInput.value = budget.id;
        totalAmountInput.value = budget.totalAmount;

        budget.allocations.forEach((alloc) => {
            const input = document.querySelector(`#alloc-${alloc.categorySlug}`);

            if (input) {
                input.value = alloc.allocatedAmount;
            }
        });

        budgetFormTitle.textContent = 'Edit Budget';
        saveBudgetButton.innerHTML = '<i class="fas fa-save" aria-hidden="true"></i> Update Budget';
        cancelEditButton.hidden = false;
        deleteBudgetButton.hidden = false;
        currentBudget = budget;

        recalcAllocationSummary();
    };

    const renderOverview = (budget) => {
        const totalAllocated = budget.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
        const totalSpent = budget.allocations.reduce((sum, a) => sum + a.spentAmount, 0);
        const remaining = budget.totalAmount - totalSpent;

        budgetOverview.classList.remove('empty-state');
        budgetOverview.innerHTML = `
            <div class="budget-overview-grid">
                <div class="budget-stat-card">
                    <span class="stat-label">Total Budget</span>
                    <span class="stat-value accent">${formatCurrency(budget.totalAmount)}</span>
                </div>
                <div class="budget-stat-card">
                    <span class="stat-label">Total Spent</span>
                    <span class="stat-value ${totalSpent > budget.totalAmount ? 'danger' : ''}">${formatCurrency(totalSpent)}</span>
                </div>
                <div class="budget-stat-card">
                    <span class="stat-label">Remaining</span>
                    <span class="stat-value ${remaining < 0 ? 'danger' : 'success'}">${formatCurrency(remaining)}</span>
                </div>
            </div>

            <h3 class="budget-categories-heading">Category Breakdown</h3>
            <div class="budget-category-rows">
                ${budget.allocations.map((alloc) => {
                    const pct = alloc.allocatedAmount > 0
                        ? Math.min((alloc.spentAmount / alloc.allocatedAmount) * 100, 100)
                        : 0;
                    const isOver = alloc.spentAmount > alloc.allocatedAmount;

                    return `
                    <div class="budget-category-row">
                        <div class="cat-header">
                            <span class="cat-name">${escapeHtml(alloc.categoryName)}</span>
                            <span class="cat-amounts">
                                ${formatCurrency(alloc.spentAmount)} / ${formatCurrency(alloc.allocatedAmount)}
                            </span>
                        </div>
                        <div class="budget-bar">
                            <div class="budget-bar-fill ${isOver ? 'over' : ''}"
                                style="width: ${pct.toFixed(1)}%"></div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        `;
    };

    const renderEmptyOverview = () => {
        budgetOverview.classList.add('empty-state');
        budgetOverview.innerHTML = '<p>No budget set for this trip yet.</p>';
    };

    const renderBudgetList = (budgets) => {
        budgetCount.textContent = budgets.length === 1
            ? '1 trip has a budget.'
            : `${budgets.length} trips have budgets.`;

        if (budgets.length === 0) {
            budgetListContainer.innerHTML = '<p class="empty-state">No budgets created yet.</p>';
            return;
        }

        budgetListContainer.innerHTML = budgets.map((b) => `
            <div class="budget-card" data-trip-id="${b.tripId}" tabindex="0"
                role="button" aria-label="View budget for ${escapeHtml(b.destination)}">
                <div class="budget-card__info">
                    <h3>${escapeHtml(b.destination)}</h3>
                    <p>${formatDate(b.startDate)} — ${formatDate(b.endDate)}
                        &middot; ${escapeHtml(b.status)}</p>
                </div>
                <div class="budget-card__stats">
                    <span class="stat-amount">${formatCurrency(b.totalAmount)}</span>
                    <span class="stat-spent">Spent: ${formatCurrency(b.totalSpent)}</span>
                </div>
            </div>
        `).join('');
    };

    // ── Data loaders ────────────────────────────────────

    const loadCategories = async () => {
        const data = await requestJson(`${BUDGETS_API}/categories`);
        categories = data.categories;
        buildAllocationFields();
    };

    const loadTrips = async () => {
        const data = await requestJson(`${TRIPS_API}?userId=${DEV_USER_ID}`);
        trips = data.trips;

        tripSelector.innerHTML = '<option value="">— Choose a trip —</option>' +
            trips.map((t) => `<option value="${t.id}">${escapeHtml(t.destination)} (${formatDate(t.startDate)})</option>`).join('');
    };

    const loadBudgetForTrip = async (tripId) => {
        hideAlert();
        resetForm();

        if (!tripId) {
            budgetWorkspace.hidden = true;
            renderEmptyOverview();
            return;
        }

        budgetWorkspace.hidden = false;

        try {
            const data = await requestJson(`${TRIPS_API}/${tripId}/budget`);
            const budget = data.budget;

            fillFormWithBudget(budget);
            renderOverview(budget);
        } catch (error) {
            if (error.message.includes('not found')) {
                renderEmptyOverview();
                return;
            }
            showAlert(error.message, true);
        }
    };

    const loadBudgetList = async () => {
        try {
            const data = await requestJson(`${BUDGETS_API}?userId=${DEV_USER_ID}`);
            renderBudgetList(data.budgets);
        } catch (error) {
            budgetCount.textContent = 'Unable to load budgets.';
        }
    };

    // ── Form payload ────────────────────────────────────

    const getFormPayload = () => {
        const allocations = categories.map((cat) => {
            const input = document.querySelector(`#alloc-${cat.slug}`);

            return {
                categoryId: cat.id,
                allocatedAmount: Number(input ? input.value : 0)
            };
        });

        return {
            totalAmount: Number(totalAmountInput.value),
            allocations
        };
    };

    // ── Event handlers ──────────────────────────────────

    tripSelector.addEventListener('change', () => {
        loadBudgetForTrip(tripSelector.value);
    });

    budgetForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideAlert();

        const tripId = tripSelector.value;

        if (!tripId) {
            showAlert('Please select a trip first.', true);
            return;
        }

        const payload = getFormPayload();
        const totalAllocated = payload.allocations.reduce((sum, a) => sum + a.allocatedAmount, 0);
        if (totalAllocated > payload.totalAmount) {
            showAlert('Total allocated amount cannot exceed total budget.', true);
            return;
        }

        const originalHtml = saveBudgetButton.innerHTML;
        saveBudgetButton.disabled = true;
        saveBudgetButton.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Saving...';

        try {
            const isEdit = Boolean(budgetIdInput.value);

            if (isEdit) {
                await requestJson(`${TRIPS_API}/${tripId}/budget`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showAlert('Budget updated successfully.');
            } else {
                await requestJson(`${TRIPS_API}/${tripId}/budget`, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                showAlert('Budget created successfully.');
            }

            await loadBudgetForTrip(tripId);
            await loadBudgetList();
        } catch (error) {
            showAlert(error.message, true);
        } finally {
            saveBudgetButton.disabled = false;
            saveBudgetButton.innerHTML = originalHtml;
        }
    });

    cancelEditButton.addEventListener('click', () => {
        hideAlert();

        if (currentBudget) {
            fillFormWithBudget(currentBudget);
        } else {
            resetForm();
        }
    });

    deleteBudgetButton.addEventListener('click', async () => {
        const tripId = tripSelector.value;

        if (!tripId) {
            return;
        }

        const shouldDelete = window.confirm('Delete this budget? All category allocations will be removed.');

        if (!shouldDelete) {
            return;
        }

        hideAlert();

        try {
            await requestJson(`${TRIPS_API}/${tripId}/budget`, {
                method: 'DELETE'
            });
            showAlert('Budget deleted successfully.');
            resetForm();
            renderEmptyOverview();
            await loadBudgetList();
        } catch (error) {
            showAlert(error.message, true);
        }
    });

    budgetListContainer.addEventListener('click', (event) => {
        const card = event.target.closest('.budget-card');

        if (!card) {
            return;
        }

        const tripId = card.dataset.tripId;
        tripSelector.value = tripId;
        loadBudgetForTrip(tripId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ── Initialization ──────────────────────────────────

    const init = async () => {
        try {
            await loadCategories();
            await loadTrips();
            await loadBudgetList();

            const params = new URLSearchParams(window.location.search);
            const preselectedTripId = params.get('tripId');

            if (preselectedTripId) {
                tripSelector.value = preselectedTripId;
                await loadBudgetForTrip(preselectedTripId);
            }
        } catch (error) {
            showAlert(error.message, true);
        }
    };

    init();
}());
