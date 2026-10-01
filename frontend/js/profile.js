(() => {
  const { $, ready, api, notify, busy } = Voyage;
  const controls = document.querySelectorAll('form input, form button');
  controls.forEach(control => { control.disabled = true; });
  notify('Loading your account details…');
  ready.then(user => {
    if (!user) return;
    $('#name').value = user.name;
    $('#email').value = user.email;
    controls.forEach(control => { control.disabled = false; });
    notify('');
  });
  for (const [id, path] of [['profile-form', 'profile'], ['password-form', 'password']]) {
    $(`#${id}`).addEventListener('submit', event => {
      event.preventDefault(); const form = event.currentTarget;
      busy(form, async () => {
        try { await api(`/auth/${path}`, { method: 'PUT', body: JSON.stringify(Object.fromEntries(new FormData(form))) }); if (path === 'password') form.reset(); notify(path === 'password' ? 'Password updated. Your session has been renewed.' : 'Your details are up to date.'); }
        catch (error) { notify(error.message, true); }
      });
    });
  }
})();
