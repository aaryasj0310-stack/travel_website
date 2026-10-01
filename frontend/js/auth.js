(() => {
  const { $, api, notify, busy } = Voyage;
  $('#auth-form').addEventListener('submit', event => {
    event.preventDefault();
    busy(event.currentTarget, async () => {
      try {
        await api(`/auth/${$('#auth-form').dataset.mode}`, { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData($('#auth-form')))) });
        const next = new URLSearchParams(location.search).get('next');
        const safe = next && /^\/?(dashboard|trips|budget|expenses|itinerary|profile)\.html(?:\?[^#]*)?$/.test(next);
        location.assign(safe ? next : 'dashboard.html');
      } catch (error) { notify(error.message, true); }
    });
  });
})();
