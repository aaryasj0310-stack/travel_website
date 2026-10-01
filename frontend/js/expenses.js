(async()=>{
  const { $,context,api,notify,busy,escape,money,date,paise,budgetSummary,empty,link,localToday }=Voyage;
  let data,budget,expenses=[],editing=null;
  const reset=()=>{editing=null;$('#expense-form').reset();$('#expenseDate').value=localToday();$('#expense-form-title').textContent='Add an expense';$('#cancel-edit').hidden=true;};
  const render=()=>{
    const selected=$('#category-filter').value;
    const rows=expenses.filter(e=>!selected||String(e.categoryId)===selected);
    const total=rows.reduce((sum,e)=>sum+paise(e.amount),0);
    $('#expense-count').textContent=rows.length+' records · '+money(total/100)+(selected?' in this category':' total recorded');
    $('#expense-list').innerHTML=rows.length?rows.map(e=>'<article class="expense-row"><div><h3>'+escape(e.description||e.categoryName)+'</h3><p>'+escape(e.categoryName)+' · '+date(e.expenseDate)+'</p></div><strong>'+money(e.amount)+'</strong><div class="actions"><button class="btn btn-small" data-edit="'+e.id+'">Edit expense</button><button class="btn btn-small btn-danger" data-delete="'+e.id+'">Delete expense</button></div></article>').join(''):empty(selected?'No expenses in this category.':'No spending recorded yet.','When you spend, capture it here. Your remaining budget updates with every entry.');
  };
  const load=async()=>{
    const [result,overview]=await Promise.all([api('/expenses?tripId='+data.trip.id),api('/dashboard?tripId='+data.trip.id)]);
    expenses=result.expenses;data=overview;$('#expense-summary').innerHTML=budgetSummary(data.finance);$('#entry-balance').textContent=money(data.finance.remaining)+' remaining for this journey.';render();
  };
  $('#category-filter').addEventListener('change',render);$('#cancel-edit').addEventListener('click',reset);
  $('#expense-form').addEventListener('submit',event=>{
    event.preventDefault();busy(event.currentTarget,async()=>{
      try{const payload={...Object.fromEntries(new FormData($('#expense-form'))),budgetId:budget.id};const wasEditing=Boolean(editing);
        await api('/expenses'+(editing?'/'+editing:''),{method:editing?'PUT':'POST',body:JSON.stringify(payload)});
        reset();await load();const category=data.finance.categories.find(c=>String(c.categoryId)===payload.categoryId);
        notify((wasEditing?'Expense updated':'Added '+money(payload.amount))+' · '+category.categoryName+' · '+money(category.remaining)+' remaining in this category.'+(payload.expenseDate<data.trip.startDate||payload.expenseDate>data.trip.endDate?' Recorded outside trip dates.':''));
      }catch(error){notify(error.message,true);}
    });
  });
  $('#expense-list').addEventListener('click',async event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.edit){const e=expenses.find(e=>String(e.id)===b.dataset.edit);editing=e.id;for(const key of ['amount','categoryId','expenseDate','description'])$('#'+key).value=e[key]||'';$('#expense-form-title').textContent='Edit expense';$('#cancel-edit').hidden=false;$('#amount').focus();}
    if(b.dataset.delete&&confirm('Delete this expense? Your available budget will increase by this amount.')){b.disabled=true;try{await api('/expenses/'+b.dataset.delete,{method:'DELETE'});reset();await load();notify('Expense removed. Your budget is up to date.');}catch(error){notify(error.message,true);b.disabled=false;}}
  });
  try{data=await context();if(!data?.trip)return;
    if(!data.finance){$('#expense-summary').innerHTML=empty('First, give this trip a budget.','A spending plan keeps every expense connected to the journey.',link('budget',data.trip.id),'Set your budget');return;}
    notify('Loading your spending journal…');
    budget=(await api('/trips/'+data.trip.id+'/budget')).budget;
    const options=budget.allocations.map(c=>'<option value="'+c.categoryId+'">'+escape(c.categoryName)+'</option>').join('');
    $('#categoryId').innerHTML='<option value="">Choose a category</option>'+options;$('#category-filter').innerHTML='<option value="">All categories</option>'+options;
    reset();await load();$('#expense-workspace').hidden=false;notify('');
  }catch(error){notify(error.message,true);$('#trip-context .loading')?.remove();}
})();
