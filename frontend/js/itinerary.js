(async () => {
  const { $, context, api, escape, date, link, notify, busy, editor }=Voyage;
  let data,activities=[],editing=null,dayOffset=0;
  const openEditor=editor();
  const open=(activity,day)=>{
    editing=activity?.id||null;$('#activity-form').reset();
    $('#date').min=data.trip.startDate;$('#date').max=data.trip.endDate;$('#date').value=day||data.trip.startDate;
    if(activity)for(const key of ['title','location','date','startTime','endTime','description'])$('#'+key).value=activity[key]||'';
    openEditor(activity?'Edit this moment':'Add a moment');
  };
  $('#new-activity').addEventListener('click',()=>open());
  const render=()=>{
    const dates=Array.from({length:Math.min(14,data.duration-dayOffset)},(_,index)=>new Date(Date.parse(data.trip.startDate)+(dayOffset+index)*86400000).toISOString().slice(0,10));
    const out=activities.filter(a=>a.date<data.trip.startDate||a.date>data.trip.endDate);
    const dayMarkup=day=>{
      const rows=activities.filter(a=>a.date===day);
      const number=Math.round((Date.parse(day)-Date.parse(data.trip.startDate))/86400000)+1;
      return '<section class="timeline-day" id="day-'+day+'"><div class="day-heading"><span class="day-number">'+(number < 1 || number > data.duration ? '—' : String(number).padStart(2,'0'))+'</span><div><h2>'+date(day)+(day===data.today?' · Today':'')+'</h2><p>'+rows.length+' moments planned</p></div><button class="btn btn-small" data-day="'+day+'">+ Add</button></div>'+ (rows.length?rows.map(a=>'<article class="timeline-activity"><div class="timeline-time">'+escape(a.startTime.slice(0,5))+(a.endTime?'<br><small>— '+escape(a.endTime.slice(0,5))+'</small>':'')+'</div><div class="timeline-content"><h3>'+escape(a.title)+'</h3><p>'+escape(a.location)+'</p>'+(a.description?'<p>'+escape(a.description)+'</p>':'')+'<div class="actions"><button class="btn btn-small" data-edit="'+a.id+'">Edit activity</button><button class="btn btn-small btn-danger" data-delete="'+a.id+'">Delete activity</button></div></div></article>').join(''):'<p class="empty-state">Nothing scheduled yet. Add the first moment, or leave a little room to wander.</p>')+'</section>';
    };
    $('#itinerary-content').innerHTML='<div class="section-header"><div><h2>Your travel days</h2><p>'+activities.length+' activities · times in India</p></div><div class="actions">'+(dayOffset>0?'<button class="btn" data-page="-1">Previous days</button>':'')+(dayOffset+14<data.duration?'<button class="btn" data-page="1">Next days</button>':'')+'</div></div><nav class="day-nav" aria-label="Jump to day">'+dates.map((d,i)=>'<a class="'+(d===data.today?'today':'')+'" href="#day-'+d+'">Day '+(dayOffset+i+1)+'</a>').join('')+'</nav>'+dates.map(dayMarkup).join('')+(out.length?'<div class="notice warning">These activities fall outside the trip dates. Edit them to move them into your journey.</div>'+[...new Set(out.map(a=>a.date))].map(dayMarkup).join(''):'');
    $('#itinerary-content').setAttribute('aria-busy','false');
  };
  const load=async()=>{activities=(await api('/trips/'+data.trip.id+'/itineraries')).itineraries;activities.sort((a,b)=>a.date.localeCompare(b.date)||a.startTime.localeCompare(b.startTime)||a.sequenceOrder-b.sequenceOrder);render();};
  $('#itinerary-content').addEventListener('click',async event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.day)open(null,b.dataset.day);
    if(b.dataset.page){dayOffset+=Number(b.dataset.page)*14;render();}
    if(b.dataset.edit)open(activities.find(a=>String(a.id)===b.dataset.edit));
    if(b.dataset.delete&&confirm('Delete this activity?')){b.disabled=true;try{await api('/itineraries/'+b.dataset.delete,{method:'DELETE'});await load();notify('Activity removed.');}catch(error){notify(error.message,true);b.disabled=false;}}
  });
  $('#activity-form').addEventListener('submit',event=>{
    event.preventDefault();busy(event.currentTarget,async()=>{
      try{const payload={...Object.fromEntries(new FormData($('#activity-form'))),tripId:data.trip.id};
        if(payload.endTime&&payload.endTime<payload.startTime)throw new Error('End time must be on or after start time.');
        await api('/itineraries'+(editing?'/'+editing:''),{method:editing?'PUT':'POST',body:JSON.stringify(payload)});
        $('#editor').close();await load();notify('Your moment is saved.');
      }catch(error){notify(error.message,true,'#form-alert');}
    });
  });
  try{data=await context();if(!data?.trip){$('#itinerary-content').innerHTML='';return;}$('#new-activity').disabled=false;await load();if(new URLSearchParams(location.search).has('add'))open();}
  catch(error){notify(error.message,true);$('#itinerary-content').innerHTML='<p class="empty-state">Your itinerary could not be loaded. Refresh to try again.</p>';$('#trip-context .loading')?.remove();}
  finally{$('#itinerary-content').setAttribute('aria-busy','false');}
})();
