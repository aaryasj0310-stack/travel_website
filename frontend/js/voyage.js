/* One browser namespace for API, formatting, and the shared journey shell. */
window.Voyage = (() => {
  const $ = (selector) => document.querySelector(selector);
  const escape = (value = '') => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const money = value => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value));
  const date = value => new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
  const paise = value => { const [whole, fraction = ''] = String(value || '0').split('.'); return Number(whole) * 100 + Number(fraction.padEnd(2, '0').slice(0, 2)); };
  const localToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  let csrf = '';
  const api = async (path, options = {}) => {
    const method = options.method || 'GET';
    if (method !== 'GET' && !csrf) csrf = (await api('/auth/csrf')).csrfToken;
    let response;
    try { response = await fetch(path.startsWith('/api/') ? path : `/api/v1${path}`, { ...options, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(method !== 'GET' ? { 'X-CSRF-Token': csrf } : {}), ...options.headers } }); }
    catch { throw new Error('Unable to reach Voyage. Check your connection and try again.'); }
    let result;
    try { result = await response.json(); } catch { throw new Error('Voyage returned an unexpected response. Please try again.'); }
    if (!response.ok || !result.success) {
      if (response.status === 401 && !['auth','landing'].includes(document.body.dataset.page)) location.replace(`login.html?next=${encodeURIComponent(location.pathname + location.search)}`);
      const error = new Error(result.errors?.map(item => item.message).filter(Boolean).join(' ') || result.message || 'Unable to complete this request.');
      error.status = response.status; throw error;
    }
    if (result.data?.csrfToken) csrf = result.data.csrfToken;
    return result.data;
  };
  const notify = (message, error = false, selector = '#page-alert') => {
    const element = $(selector); if (!element) return;
    element.textContent = message; element.hidden = !message; element.classList.toggle('is-error', error);
  };
  const busy = async (form, action) => {
    const button = form.querySelector('[type="submit"]'); const label = button.textContent;
    button.disabled = true; button.textContent = 'Saving…';
    try { await action(); } finally { button.disabled = false; button.textContent = label; }
  };
  const link = (page, id) => `${page}.html?tripId=${encodeURIComponent(id)}`;
  const empty = (title, copy, href, action, image) => `<div class="empty-state ${image ? 'has-media' : ''}">${image ? `<img class="empty-media" src="${escape(image)}" alt="" loading="lazy">` : ''}<h2>${escape(title)}</h2><p>${escape(copy)}</p>${href ? `<a class="btn btn-primary" href="${escape(href)}">${escape(action)}</a>` : ''}</div>`;
  const metric = (label, value, note = '') => `<div class="metric"><span>${escape(label)}</span><strong>${escape(value)}</strong>${note ? `<small>${escape(note)}</small>` : ''}</div>`;
  const categories = finance => finance.categories.map(category => `<div class="category-row ${category.health}"><div class="category-top"><strong>${escape(category.categoryName)}</strong><span>${money(category.spentAmount)} / ${money(category.allocatedAmount)}</span></div><progress value="${Math.min(100, category.consumedPercent ?? (Number(category.spentAmount) > 0 ? 100 : 0))}" max="100" aria-label="${escape(category.categoryName)} allocation consumed"></progress><small>${category.health === 'over' ? `Over allocation by ${money(-Number(category.remaining))}` : `${money(category.remaining)} remaining`}${category.consumedPercent === null ? ' · No allocation' : ` · ${category.consumedPercent}% used`}${category.health === 'near' ? ' · Near allocation' : ''}</small></div>`).join('');
  const budgetSummary = finance => `<div class="budget-hero"><span class="eyebrow">The whole journey · planned budget</span><div class="budget-total">${money(finance.total)}</div><div class="metric-grid">${metric('Recorded spending', money(finance.spent))}${metric(Number(finance.remaining) < 0 ? 'Over budget by' : 'Still available', money(Math.abs(Number(finance.remaining))))}${metric('Budget consumed', `${finance.consumedPercent}%`)}</div>${finance.largestCategory ? `<p>Largest spending category: ${escape(finance.largestCategory.categoryName)} · ${money(finance.largestCategory.spentAmount)}</p>` : ''} </div>`;
  const navigation = user => {
    const page = document.body.dataset.page;
    const links = user ? [['dashboard','Dashboard'],['trips','My trips'],['profile','Account']] : [['index#how-it-works','How it works'],['index#features','Features'],['login','Sign in']];
    $('#nav-links').innerHTML = links.map(([target, text]) => {
      const [file, hash] = target.split('#'); return `<a href="${file}.html${hash ? `#${hash}` : ''}" ${file === page ? 'aria-current="page"' : ''}>${text}</a>`;
    }).join('') + (user ? '<button class="btn btn-small" id="logout">Sign out</button>' : '<a class="btn btn-primary" href="register.html">Start planning ↗</a>');
    $('#logout')?.addEventListener('click', async () => { try { await api('/auth/logout', { method: 'POST' }); location.assign('login.html'); } catch (error) { notify(error.message, true); } });
  };
  $('#nav-toggle')?.addEventListener('click', () => { const open = $('#nav-toggle').getAttribute('aria-expanded') !== 'true'; $('#nav-toggle').setAttribute('aria-expanded', open); $('#nav-links').classList.toggle('is-open', open); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && $('#nav-links')?.classList.contains('is-open')) { $('#nav-toggle').click(); $('#nav-toggle').focus(); } });
  const ready = (async () => {
    if (['auth','landing'].includes(document.body.dataset.page)) { navigation(null); return null; }
    try { const { user } = await api('/auth/me'); navigation(user); return user; }
    catch (error) { navigation(null); notify(error.message, true); return null; }
  })();
  const context = async () => {
    if (!await ready) return null;
    const id = new URLSearchParams(location.search).get('tripId');
    const data = await api(`/dashboard${id ? `?tripId=${encodeURIComponent(id)}` : ''}`);
    const host = $('#trip-context');
    if (!data.trip) { host.innerHTML = empty('Your first journey starts here.', 'Pick a destination. We’ll keep the details together.', 'trips.html?create=1', 'Create a trip', 'images/cinematic/empty-trips.png'); return data; }
    const trip = data.trip;
    const url = new URL(location.href); url.searchParams.set('tripId', trip.id); history.replaceState(null, '', url);
    host.innerHTML = `<div class="field trip-switch"><label for="current-trip">Your journey</label><select id="current-trip">${data.trips.map(item => `<option value="${item.id}" ${String(item.id) === String(trip.id) ? 'selected' : ''}>${escape(item.destination)} · ${date(item.startDate)}</option>`).join('')}</select></div><section class="journey-header" aria-label="Selected trip"><div><span class="eyebrow">${trip.status === 'upcoming' ? `${data.daysUntil} days to departure` : trip.status === 'ongoing' ? 'You’re on your way' : 'A chapter to remember'}</span><h2>${escape(trip.destination)}</h2><p>${date(trip.startDate)} — ${date(trip.endDate)} · ${data.duration} days · ${trip.numTravelers} traveler${Number(trip.numTravelers) === 1 ? '' : 's'}</p></div><span class="tag">${trip.status}</span></section><nav class="trip-tabs" aria-label="Journey views">${[['dashboard','Overview'],['itinerary','Itinerary'],['budget','Budget'],['expenses','Expenses']].map(([page,title]) => `<a href="${link(page, trip.id)}" ${page === document.body.dataset.page ? 'aria-current="page"' : ''}>${title}</a>`).join('')}</nav>`;
    $('#current-trip').addEventListener('change', event => location.assign(link(document.body.dataset.page, event.target.value)));
    return data;
  };
  const editor = () => {
    const dialog = $('#editor'); dialog.setAttribute('aria-labelledby', 'editor-title'); $('#close-editor').addEventListener('click', () => dialog.close());
    return (title) => { $('#editor-title').textContent = title; notify('', false, '#form-alert'); dialog.showModal(); };
  };
  return { $, escape, money, date, paise, localToday, api, notify, busy, link, empty, metric, categories, budgetSummary, ready, context, editor };
})();
