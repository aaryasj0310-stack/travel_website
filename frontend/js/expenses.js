(function () {
    const EXPENSES_API = '/api/v1/expenses';
    const BUDGETS_API = '/api/v1/budgets';
    const DEV_USER_ID = 1;

    const budgetSelector = document.querySelector('#budget-selector');
    const expenseWorkspace = document.querySelector('#expense-workspace');
    const expenseListSection = document.querySelector('#expense-list-section');
    const expenseSummary = document.querySelector('#expense-summary');
    const expenseForm = document.querySelector('#expense-form');
    const expenseIdInput = document.querySelector('#expense-id');
    const budgetIdInput = document.querySelector('#budget-id');
    const categoryInput = document.querySelector('#category-id');
    const categoryFilter = document.querySelector('#category-filter');
    const amountInput = document.querySelector('#amount');
    const expenseDateInput = document.querySelector('#expense-date');
    const descriptionInput = document.querySelector('#description');
    const expenseList = document.querySelector('#expense-list');
    const expenseCount = document.querySelector('#expense-count');
    const expenseDetail = document.querySelector('#expense-detail');
    const expenseAlert = document.querySelector('#expense-alert');
    const formTitle = document.querySelector('#expense-form-title');
    const saveExpenseButton = document.querySelector('#save-expense-button');
    const cancelEditButton = document.querySelector('#cancel-edit-button');
    const newExpenseButton = document.querySelector('#new-expense-button');

    let budgets = [];
    let categories = [];
    let expenses = [];
    let currentSummary = null;
    let selectedBudgetId = '';

    let alertTimeout;
    const showAlert = (message, isError) => {
        expenseAlert.textContent = message;
        expenseAlert.hidden = false;
        expenseAlert.classList.toggle('is-error', Boolean(isError));
        clearTimeout(alertTimeout);
        if (!isError) {
            alertTimeout = setTimeout(hideAlert, 5000);
        }
    };

    const hideAlert = () => {
        expenseAlert.hidden = true;
        expenseAlert.textContent = '';
        expenseAlert.classList.remove('is-error');
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

    const getSelectedBudget = () => budgets.find((budget) => String(budget.id) === String(selectedBudgetId));

    const populateCategoryOptions = (selectElement, includeAllOption) => {
        const options = includeAllOption
            ? '<option value="">All categories</option>'
            : '<option value="">Select a category</option>';

        selectElement.innerHTML = options + categories.map((category) => (
            `<option value="${category.id}">${escapeHtml(category.name)}</option>`
        )).join('');
    };

    const renderSummary = (summary) => {
        if (!summary) {
            expenseSummary.hidden = true;
            expenseSummary.innerHTML = '';
            return;
        }

        currentSummary = summary;
        const remainingClass = summary.remainingBudget < 0 ? 'danger' : 'success';

        expenseSummary.hidden = false;
        expenseSummary.innerHTML = `
            <div class="budget-stat-card">
                <span class="stat-label">Total Budget</span>
                <span class="stat-value accent">${formatCurrency(summary.totalBudget)}</span>
            </div>
            <div class="budget-stat-card">
                <span class="stat-label">Total Spent</span>
                <span class="stat-value">${formatCurrency(summary.totalSpent)}</span>
            </div>
            <div class="budget-stat-card">
                <span class="stat-label">Remaining Budget</span>
                <span class="stat-value ${remainingClass}">${formatCurrency(summary.remainingBudget)}</span>
            </div>
        `;
    };

    const resetForm = () => {
        expenseForm.reset();
        expenseIdInput.value = '';
        budgetIdInput.value = selectedBudgetId;
        formTitle.textContent = 'Create Expense';
        saveExpenseButton.textContent = 'Create Expense';
        cancelEditButton.hidden = true;
    };

    const fillFormWithExpense = (expense) => {
        expenseIdInput.value = expense.id;
        budgetIdInput.value = expense.budgetId;
        categoryInput.value = expense.categoryId;
        amountInput.value = expense.amount;
        expenseDateInput.value = expense.expenseDate;
        descriptionInput.value = expense.description || '';
        formTitle.textContent = 'Edit Expense';
        saveExpenseButton.textContent = 'Update Expense';
        cancelEditButton.hidden = false;
    };

    const renderExpenseDetail = (expense) => {
        expenseDetail.classList.remove('empty-state');
        expenseDetail.innerHTML = `
            <div class="detail-grid">
                <div class="detail-item">
                    <span>Category</span>
                    <strong>${escapeHtml(expense.categoryName)}</strong>
                </div>
                <div class="detail-item">
                    <span>Amount</span>
                    <strong>${formatCurrency(expense.amount)}</strong>
                </div>
                <div class="detail-item">
                    <span>Date</span>
                    <strong>${formatDate(expense.expenseDate)}</strong>
                </div>
                <div class="detail-item">
                    <span>Budget ID</span>
                    <strong>${expense.budgetId}</strong>
                </div>
            </div>
            <p class="detail-description">${escapeHtml(expense.description || 'No description added.')}</p>
        `;
    };

    const renderExpenses = () => {
        const filteredCategoryId = categoryFilter.value;
        const visibleExpenses = filteredCategoryId
            ? expenses.filter((expense) => String(expense.categoryId) === String(filteredCategoryId))
            : expenses;

        expenseCount.textContent = visibleExpenses.length === 1
            ? '1 expense found.'
            : `${visibleExpenses.length} expenses found.`;

        if (visibleExpenses.length === 0) {
            expenseList.innerHTML = '<p class="empty-state">No expenses recorded for this budget yet.</p>';
            expenseDetail.textContent = 'No expense selected.';
            expenseDetail.classList.add('empty-state');
            return;
        }

        expenseList.innerHTML = visibleExpenses.map((expense) => `
            <article class="expense-card-row" data-expense-id="${expense.id}">
                <div class="expense-card-row__header">
                    <div>
                        <h3>${escapeHtml(expense.description || expense.categoryName)}</h3>
                        <p><span class="expense-category-badge">${escapeHtml(expense.categoryName)}</span></p>
                    </div>
                    <span class="expense-amount">${formatCurrency(expense.amount)}</span>
                </div>
                <p class="expense-meta">${formatDate(expense.expenseDate)}</p>
                <div class="expense-actions">
                    <button class="btn btn-outline" type="button" data-action="view" data-expense-id="${expense.id}">View</button>
                    <button class="btn btn-outline" type="button" data-action="edit" data-expense-id="${expense.id}">Edit</button>
                    <button class="btn btn-danger" type="button" data-action="delete" data-expense-id="${expense.id}">Delete</button>
                </div>
            </article>
        `).join('');
    };

    const loadBudgets = async () => {
        const data = await requestJson(`${BUDGETS_API}?userId=${DEV_USER_ID}`);
        budgets = data.budgets;

        budgetSelector.innerHTML = '<option value="">— Choose a budget —</option>' +
            budgets.map((budget) => (
                `<option value="${budget.id}">${escapeHtml(budget.destination)} (${formatDate(budget.startDate)}) — ${formatCurrency(budget.totalAmount)}</option>`
            )).join('');
    };

    const loadCategories = async () => {
        const data = await requestJson(`${BUDGETS_API}/categories`);
        categories = data.categories;
        populateCategoryOptions(categoryInput, false);
        populateCategoryOptions(categoryFilter, true);
    };

    const loadExpenses = async (budgetId) => {
        hideAlert();

        if (!budgetId) {
            expenses = [];
            currentSummary = null;
            expenseWorkspace.hidden = true;
            expenseListSection.hidden = true;
            renderSummary(null);
            renderExpenses();
            return;
        }

        expenseWorkspace.hidden = false;
        expenseListSection.hidden = false;
        budgetIdInput.value = budgetId;

        const data = await requestJson(`${EXPENSES_API}?budgetId=${budgetId}&userId=${DEV_USER_ID}`);
        expenses = data.expenses;
        renderSummary(data.summary);
        renderExpenses();
    };

    const loadExpenseDetail = async (expenseId) => {
        const data = await requestJson(`${EXPENSES_API}/${expenseId}`);
        renderExpenseDetail(data.expense);
        renderSummary(data.summary);
    };

    const getFormPayload = () => ({
        budgetId: Number(budgetIdInput.value),
        categoryId: Number(categoryInput.value),
        amount: Number(amountInput.value),
        expenseDate: expenseDateInput.value,
        description: descriptionInput.value
    });

    budgetSelector.addEventListener('change', () => {
        selectedBudgetId = budgetSelector.value;
        resetForm();
        loadExpenses(selectedBudgetId).catch((error) => {
            showAlert(error.message, true);
        });
    });

    categoryFilter.addEventListener('change', () => {
        renderExpenses();
    });

    expenseForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideAlert();

        if (!selectedBudgetId) {
            showAlert('Please select a budget first.', true);
            return;
        }

        const originalText = saveExpenseButton.textContent;
        saveExpenseButton.disabled = true;
        saveExpenseButton.textContent = 'Saving...';

        try {
            const expenseId = expenseIdInput.value;
            const payload = getFormPayload();

            if (expenseId) {
                const data = await requestJson(`${EXPENSES_API}/${expenseId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
                showAlert('Expense updated successfully.');
                renderSummary(data.summary);
            } else {
                const data = await requestJson(EXPENSES_API, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                showAlert('Expense created successfully.');
                renderSummary(data.summary);
            }

            resetForm();
            await loadExpenses(selectedBudgetId);
        } catch (error) {
            showAlert(error.message, true);
        } finally {
            saveExpenseButton.disabled = false;
            saveExpenseButton.textContent = originalText;
        }
    });

    expenseList.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');

        if (!button) {
            return;
        }

        const expenseId = button.dataset.expenseId;
        const action = button.dataset.action;
        const expense = expenses.find((item) => String(item.id) === String(expenseId));

        hideAlert();

        try {
            if (action === 'view') {
                await loadExpenseDetail(expenseId);
            }

            if (action === 'edit' && expense) {
                fillFormWithExpense(expense);
            }

            if (action === 'delete') {
                const shouldDelete = window.confirm('Delete this expense? This cannot be undone.');

                if (!shouldDelete) {
                    return;
                }

                const data = await requestJson(`${EXPENSES_API}/${expenseId}`, {
                    method: 'DELETE'
                });
                showAlert('Expense deleted successfully.');
                renderSummary(data.summary);
                resetForm();
                await loadExpenses(selectedBudgetId);
            }
        } catch (error) {
            showAlert(error.message, true);
        }
    });

    cancelEditButton.addEventListener('click', () => {
        resetForm();
        hideAlert();
    });

    newExpenseButton.addEventListener('click', () => {
        if (!selectedBudgetId) {
            showAlert('Please select a budget first.', true);
            return;
        }

        resetForm();
        hideAlert();
        categoryInput.focus();
    });

    const init = async () => {
        try {
            await loadCategories();
            await loadBudgets();

            const params = new URLSearchParams(window.location.search);
            const preselectedBudgetId = params.get('budgetId');

            if (preselectedBudgetId) {
                budgetSelector.value = preselectedBudgetId;
                selectedBudgetId = preselectedBudgetId;
                await loadExpenses(preselectedBudgetId);
            }
        } catch (error) {
            showAlert(error.message, true);
        }
    };

    init();
}());
