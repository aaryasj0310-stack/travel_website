(async () => {
  const { $, ready, api, notify, busy, escape, date, money, link, empty, editor, localToday, coverClass } = Voyage;
  let trips = [], budgets = [], editing = null;
  const openEditor = editor();
  const open = trip => { editing = trip?.id || null; $('#trip-form').reset(); if (trip) for (const key of ['destination','startDate','endDate','numTravelers','description']) $('#'+key).value = trip[key] || ''; openEditor(trip ? 'Edit your journey' : 'A new chapter'); };
  $('#new-trip').addEventListener('click', () => open());
  const load = async () => {
    const [tripResult, budgetResult] = await Promise.allSettled([api('/trips'),api('/budgets')]);
    if (tripResult.status === 'rejected') throw tripResult.reason;
    trips = tripResult.value.trips; budgets = budgetResult.status === 'fulfilled' ? budgetResult.value.budgets : [];
    if (budgetResult.status === 'rejected') notify('Your trips loaded, but budget health is temporarily unavailable.', true);
    const today = localToday();
    trips = trips.map(t => ({...t,status:today<t.startDate?'upcoming':today>t.endDate?'completed':'ongoing'}));
    $('#trip-list').innerHTML = trips.length ? ['ongoing','upcoming','completed'].map(status => {
      const items = trips.filter(t=>t.status===status); if (!items.length) return '';
      return '<h2 class="library-group-title">'+({ongoing:'On the road',upcoming:'On the horizon',completed:'In your memories'}[status])+'</h2><div class="trip-library">'+items.map(t=>{
        const b=budgets.find(b=>String(b.tripId)===String(t.id));
        const remaining=b ? Voyage.paise(b.totalAmount)-Voyage.paise(b.totalSpent):null;
        return '<article class="destination-card"><div class="destination-cover '+coverClass(t.destination, status)+'"><span class="tag">'+status+'</span></div><div class="destination-body"><h3>'+escape(t.destination)+'</h3><p>'+date(t.startDate)+' — '+date(t.endDate)+'<br>'+t.numTravelers+' travelers · '+(Math.round((Date.parse(t.endDate)-Date.parse(t.startDate))/86400000)+1)+' days</p><p>'+ (status==='upcoming'?Math.round((Date.parse(t.startDate)-Date.parse(today))/86400000)+' days until departure':status==='ongoing'?'Enjoy the journey.':'A journey worth remembering.')+'</p><p>'+(b?(remaining<0?'Over budget by ':'Budget remaining ')+money(Math.abs(remaining)/100):budgetResult.status==='fulfilled'?'No budget set yet':'Budget unavailable')+'</p><a class="btn btn-primary" href="'+link('dashboard',t.id)+'">Open trip ↗</a><div class="actions"><button class="btn btn-small" data-edit="'+t.id+'">Edit trip</button><button class="btn btn-small btn-danger" data-delete="'+t.id+'">Delete trip</button></div></div></article>';
      }).join('')+'</div>';
    }).join('') : empty('Your first journey starts here.','A new place. A fresh perspective. Start with a destination.','trips.html?create=1','Create a trip','images/cinematic/empty-trips.png');
    $('#trip-list').setAttribute('aria-busy','false');
  };
  $('#trip-list').addEventListener('click',async event=>{
    const button=event.target.closest('button'); if(!button)return;
    if(button.dataset.edit)open(trips.find(t=>String(t.id)===button.dataset.edit));
    if(button.dataset.delete && confirm('Delete this journey and all its activities, budget and expenses? This cannot be undone.')){
      button.disabled=true;
      try{await api('/trips/'+button.dataset.delete,{method:'DELETE'});await load();notify('Journey deleted.');}catch(error){notify(error.message,true);button.disabled=false;}
    }
  });
  $('#trip-form').addEventListener('submit',event=>{
    event.preventDefault(); const form=event.currentTarget;
    busy(form,async()=>{
      try{
        const payload=Object.fromEntries(new FormData(form));
        if(payload.endDate<payload.startDate)throw new Error('Return date must be on or after departure.');
        const result=await api('/trips'+(editing?'/'+editing:''),{method:editing?'PUT':'POST',body:JSON.stringify(payload)});
        $('#editor').close();await load();notify('Your journey is saved.');
        if(!editing)location.assign(link('dashboard',result.trip.id));
      }catch(error){notify(error.message,true,'#form-alert');}
    });
  });
  try{if(!await ready)return;await load();const params=new URLSearchParams(location.search);if(params.has('create'))open();if(params.has('edit')){const trip=trips.find(t=>String(t.id)===params.get('edit'));if(trip)open(trip);else notify('That journey is not available.',true);}}
  catch(error){notify(error.message,true);$('#trip-list').innerHTML=empty('Your journeys could not be loaded.','Refresh the page to try again.');}
  finally{$('#trip-list').setAttribute('aria-busy','false');}
})();
