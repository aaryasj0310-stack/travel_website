(async()=>{
  const { $,context,api,notify,busy,escape,money,paise,metric,categories,budgetSummary,empty,link }=Voyage;
  let data,budget=null,categoryList=[];
  const totals=()=>{
    const total=paise($('#totalAmount').value), allocated=categoryList.reduce((sum,c)=>sum+paise($('#allocation-'+c.id).value),0);
    $('#allocation-summary').textContent='Allocated '+money(allocated/100)+' · Unallocated '+money((total-allocated)/100);
    $('#allocation-summary').classList.toggle('danger',allocated>total);
  };
  const render=()=>{
    const f=data.finance;
    $('#budget-overview').innerHTML=f?budgetSummary(f)+'<div class="metric-grid">'+metric('Allocated',money(f.allocated))+metric('Unallocated buffer',money(f.unallocated))+metric('Budget / traveler',money(f.perTraveler))+'</div><section class="panel spaced"><h2>Every rupee has a place.</h2><p class="form-note">Recorded spending / planned allocation</p>'+categories(f)+'</section><section class="panel spaced"><h2>Your spending perspective</h2><ul class="budget-insights"><li>'+money(f.perDay)+' planned per trip day.</li><li>'+f.consumedPercent+'% of budget used; '+f.elapsedPercent+'% of calendar days reached.</li><li>'+(f.remainingPerDay===null?'Your trip has finished.':money(f.remainingPerDay)+' remains per remaining calendar day ('+f.remainingDays+' days, including today).')+'</li><li>'+(f.recordedPerElapsedDay===null?'Spending pace starts on departure.':'Recorded spending / elapsed day: '+money(f.recordedPerElapsedDay)+'. Includes pre-trip spending.')+'</li></ul><p class="form-note">These are simple calculations, not forecasts. Booking costs often arrive before travel begins.</p></section>':empty('Give this trip a spending plan.','Start with a total, then make room for each part of your journey.');
  };
  const load=async()=>{
    data=await api('/dashboard?tripId='+data.trip.id);
    budget=data.finance ? (await api('/trips/'+data.trip.id+'/budget')).budget : null;
    $('#totalAmount').value=budget?.totalAmount||'';
    $('#allocation-fields').innerHTML=categoryList.map(c=>'<div class="field"><label for="allocation-'+c.id+'">'+escape(c.name)+'</label><input id="allocation-'+c.id+'" type="number" min="0" max="9999999999.99" step="0.01" inputmode="decimal" required value="'+(budget?.allocations.find(a=>String(a.categoryId)===String(c.id))?.allocatedAmount||'0')+'"></div>').join('');
    $('#delete-budget').hidden=!budget;totals();render();
  };
  $('#budget-form').addEventListener('input',totals);
  $('#budget-form').addEventListener('submit',event=>{
    event.preventDefault();busy(event.currentTarget,async()=>{
      try{const payload={totalAmount:$('#totalAmount').value,allocations:categoryList.map(c=>({categoryId:c.id,allocatedAmount:$('#allocation-'+c.id).value}))};
        await api('/trips/'+data.trip.id+'/budget',{method:budget?'PUT':'POST',body:JSON.stringify(payload)});await load();notify('Your spending plan is saved.');
      }catch(error){notify(error.message,true);}
    });
  });
  $('#delete-budget').addEventListener('click',async()=>{
    if(!confirm('Delete this budget AND all recorded expenses for this trip? This cannot be undone.'))return;
    $('#delete-budget').disabled=true;try{await api('/trips/'+data.trip.id+'/budget',{method:'DELETE'});await load();notify('Budget and its expenses removed.');}catch(error){notify(error.message,true);}finally{$('#delete-budget').disabled=false;}
  });
  try{data=await context();if(!data?.trip)return;notify("Loading your spending plan…");categoryList=(await api('/budgets/categories')).categories;if(categoryList.length!==6)throw new Error('Budget categories are not configured. Ask the project maintainer to run database/categories.sql.');$('#spend-link').href=link('expenses',data.trip.id);await load();$('#budget-workspace').hidden=false;notify('');}
  catch(error){notify(error.message,true);$('#trip-context .loading')?.remove();}
})();
