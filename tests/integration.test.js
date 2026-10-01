// Real HTTP + middleware + controllers + services. In-memory model substitutes
// isolate these checks from MySQL; they do not prove SQL/schema correctness.
process.env.NODE_ENV = 'test';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const app = require('../backend/app');
const database = require('../backend/config/database');
const { paise, decimal } = require('../backend/utils/money');

test('session, ownership, profile, dashboard and CRUD contract regression', async t => {
  let next = 1;
  const users = [], trips = [], budgets = [], activities = [], expenses = [];
  const categoryList = ['Transportation','Accommodation','Food','Activities','Shopping','Miscellaneous'].map((name,index) => ({ id:index+1,name,slug:name.toLowerCase(),displayOrder:index+1 }));
  const model = name => require(`../backend/models/${name}.model`);
  const mock = (name, methods) => { for (const [key, fn] of Object.entries(methods)) t.mock.method(model(name), key, fn); };
  const find = (items,id) => items.find(item=>String(item.id)===String(id)) || null;
  const remove = (items,id) => { const index=items.findIndex(item=>String(item.id)===String(id)); if(index>=0)items.splice(index,1); };
  const total = budgetId => decimal(expenses.filter(e=>e.budgetId===budgetId).reduce((sum,e)=>sum+paise(e.amount),0));
  const detailedBudget = tripId => {
    const b=budgets.find(b=>String(b.tripId)===String(tripId));
    return b ? {...b,allocations:b.allocations.map(a=>({...a,categoryName:categoryList[a.categoryId-1].name,categorySlug:categoryList[a.categoryId-1].slug,spentAmount:decimal(expenses.filter(e=>e.budgetId===b.id&&e.categoryId===a.categoryId).reduce((sum,e)=>sum+paise(e.amount),0))}))} : null;
  };
  mock('user', {
    findById: async id=>find(users,id), findByEmail: async email=>users.find(u=>u.email===email),
    create: async(name,email,password_hash)=>{ if(users.some(u=>u.email===email)){const e=new Error();e.errors=[{code:'ER_DUP_ENTRY'}];throw e;}const user={id:next++,name,email,password_hash};users.push(user);return user;},
    update: async(id,name,email)=>Object.assign(find(users,id),{name,email}), changePassword:async(id,password_hash)=>Object.assign(find(users,id),{password_hash})
  });
  mock('trip', { findById:async id=>find(trips,id),findAllByUserId:async userId=>trips.filter(t=>t.userId===userId),create:async value=>{const trip={id:next++,...value};trips.push(trip);return trip;},update:async(id,value)=>Object.assign(find(trips,id),value),remove:async id=>remove(trips,id) });
  mock('budget-category',{findAllActive:async()=>categoryList});
  mock('budget', {
    findById:async id=>find(budgets,id), findByTripId:async id=>detailedBudget(id), existsForTrip:async id=>Boolean(detailedBudget(id)),
    findAllByUserId:async userId=>budgets.filter(b=>find(trips,b.tripId)?.userId===userId),
    create:async(tripId,totalAmount,allocations)=>{const b={id:next++,tripId,totalAmount,allocations};budgets.push(b);return b.id;},
    update:async(tripId,totalAmount,allocations)=>Object.assign(budgets.find(b=>b.tripId===tripId),{totalAmount,allocations}), remove:async tripId=>remove(budgets,budgets.find(b=>b.tripId===tripId)?.id)
  });
  mock('itinerary', {findAllByTripId:async id=>activities.filter(a=>a.tripId===id).sort((a,b)=>a.date.localeCompare(b.date)||a.startTime.localeCompare(b.startTime)),findById:async id=>find(activities,id),create:async value=>{const a={id:next++,...value};activities.push(a);return a;},update:async(id,value)=>Object.assign(find(activities,id),value),remove:async id=>remove(activities,id)});
  mock('expense', {
    findById:async id=>find(expenses,id),sumByBudgetId:async id=>total(id),categoryExistsForBudget:async(id,category)=>find(budgets,id)?.allocations.some(a=>a.categoryId===category),
    findAll:async filters=>expenses.filter(e=>find(trips,e.tripId)?.userId===filters.userId&&(!filters.tripId||e.tripId===filters.tripId)&&(!filters.budgetId||e.budgetId===filters.budgetId)&&(!filters.categoryId||e.categoryId===filters.categoryId)),
    create:async value=>{const e={id:next++,...value};expenses.push(e);return e;},update:async(id,value)=>{const e=find(expenses,id);Object.assign(e,{categoryId:value.categoryId,amount:value.amount,expenseDate:value.expenseDate,description:value.description});},remove:async id=>remove(expenses,id)
  });
  const server=app.listen(0);const base=`http://127.0.0.1:${server.address().port}`;
  const client=()=>{
    let cookie='',csrf='';
    return async(path,method='GET',body,expected=200,token=true)=>{
      const response=await fetch(base+'/api/v1'+path,{method,headers:{Cookie:cookie,'Content-Type':'application/json',...(token?{'X-CSRF-Token':csrf}:{})},...(body?{body:JSON.stringify(body)}:{})});
      if(response.headers.get('set-cookie'))cookie=response.headers.get('set-cookie').split(';')[0];
      const result=await response.json();assert.equal(response.status,expected,method+' '+path+' '+JSON.stringify(result));assert.equal(result.success,expected<400);
      if(result.data?.csrfToken)csrf=result.data.csrfToken;
      return result.data;
    };
  };
  const alice=client(),bob=client();const testPassword='T'+crypto.randomBytes(12).toString('hex')+'!';const newTestPassword='N'+crypto.randomBytes(12).toString('hex')+'!';const credentials={name:'Voyage QA',email:'qa@example.test',password:testPassword,confirmPassword:testPassword};
  try {
    await alice('/trips?userId=1','GET',null,401);
    await alice('/trips','POST',{},401);
    await alice('/auth/csrf');
    await alice('/auth/register','POST',credentials,403,false);
    const registration=await alice('/auth/register','POST',credentials,201);
    assert.equal(registration.user.password_hash,undefined);
    assert.ok(users[0].password_hash.startsWith('$2'));
    await alice('/auth/register','POST',credentials,400);
    assert.equal((await alice('/auth/me')).user.email,credentials.email);
    const empty=await alice('/dashboard');assert.equal(empty.trip,null);
    const tripPayload={destination:'Goa, India',startDate:'2026-10-01',endDate:'2026-10-03',numTravelers:2,userId:999};
    const {trip}=await alice('/trips','POST',tripPayload,201);assert.equal(trip.userId,registration.user.id);
    await alice('/trips/'+trip.id,'PUT',{...tripPayload,destination:'Goa coast',userId:999});
    assert.equal((await alice('/trips/'+trip.id)).trip.destination,'Goa coast');
    await alice('/trips','POST',{...tripPayload,endDate:'2026-09-01'},400);
    const allocations=categoryList.map(c=>({categoryId:c.id,allocatedAmount:c.id===3?'0.30':'0.00'}));
    const {budget}=await alice('/trips/'+trip.id+'/budget','POST',{totalAmount:'1.00',allocations},201);
    await alice('/trips/'+trip.id+'/budget','PUT',{totalAmount:'1.001',allocations},400);
    await alice('/trips/'+trip.id+'/budget','PUT',{totalAmount:'2.00',allocations});
    const activityPayload={tripId:trip.id,title:'Beach walk',location:'Baga beach',date:tripPayload.startDate,startTime:'09:00',endTime:'10:00'};
    const {itinerary}=await alice('/itineraries','POST',activityPayload,201);
    await alice('/itineraries/'+itinerary.id,'PUT',{...activityPayload,title:'Sunrise walk',tripId:999});
    await alice('/itineraries','POST',{...activityPayload,endTime:'08:00'},400);
    assert.equal((await alice('/trips/'+trip.id+'/itineraries')).itineraries[0].title,'Sunrise walk');
    const expensePayload={budgetId:budget.id,categoryId:3,amount:'0.10',expenseDate:tripPayload.startDate,description:'Tea'};
    const first=await alice('/expenses','POST',expensePayload,201);
    const second=await alice('/expenses','POST',{...expensePayload,amount:'0.20'},201);
    assert.equal(second.summary.totalSpent,'0.30');assert.equal(second.summary.remainingBudget,'1.70');
    const updated=await alice('/expenses/'+first.expense.id,'PUT',{...expensePayload,amount:'2.00',userId:999,tripId:999});
    assert.equal(updated.summary.remainingBudget,'-0.20');
    const dashboard=await alice('/dashboard?tripId='+trip.id);assert.equal(dashboard.finance.spent,'2.20');assert.equal(dashboard.finance.categories[2].health,'over');assert.equal(dashboard.unplannedDays,2);
    await alice('/expenses','POST',{...expensePayload,categoryId:99},400);
    await bob('/auth/csrf');await bob('/auth/register','POST',{...credentials,email:'qa2@example.test'},201);
    for(const path of ['/trips/'+trip.id,'/trips/'+trip.id+'/budget','/trips/'+trip.id+'/itineraries','/expenses/'+first.expense.id,'/itineraries/'+itinerary.id,'/dashboard?tripId='+trip.id,'/expenses?budgetId='+budget.id])await bob(path,'GET',null,404);
    for(const [path,payload]of [['/trips/'+trip.id,tripPayload],['/trips/'+trip.id+'/budget',{totalAmount:'10.00',allocations}],['/expenses/'+first.expense.id,expensePayload],['/itineraries/'+itinerary.id,activityPayload]]){await bob(path,'PUT',payload,404);await bob(path,'DELETE',null,404);}
    await bob('/expenses','POST',expensePayload,404);await bob('/itineraries','POST',activityPayload,404);
    assert.equal((await bob('/trips?userId='+registration.user.id)).trips.length,0);
    assert.equal((await bob('/expenses?userId='+registration.user.id)).expenses.length,0);
    await alice('/auth/profile','PUT',{name:'Updated Traveler',email:'updated@example.test'});
    assert.equal((await alice('/auth/me')).user.name,'Updated Traveler');
    await alice('/auth/password','PUT',{currentPassword:'wrong',newPassword:newTestPassword,confirmPassword:newTestPassword},400);
    await alice('/auth/password','PUT',{currentPassword:credentials.password,newPassword:newTestPassword,confirmPassword:newTestPassword});
    await alice('/expenses/'+first.expense.id,'DELETE');assert.equal((await alice('/dashboard?tripId='+trip.id)).finance.spent,'0.20');
    await alice('/expenses/'+second.expense.id,'DELETE');assert.equal((await alice('/dashboard?tripId='+trip.id)).finance.remaining,'2.00');
    await alice('/itineraries/'+itinerary.id,'DELETE');await alice('/trips/'+trip.id+'/budget','DELETE');await alice('/trips/'+trip.id,'DELETE');
    assert.equal((await alice('/trips')).trips.length,0);
    await alice('/auth/logout','POST');await alice('/auth/me','GET',null,401);
    await alice('/auth/csrf');await alice('/auth/login','POST',{email:'updated@example.test',password:credentials.password},401);
    await alice('/auth/login','POST',{email:'updated@example.test',password:newTestPassword});
    assert.equal((await alice('/auth/me')).user.name,'Updated Traveler');
    const protectedPage=await fetch(base+'/dashboard.html?tripId=123',{redirect:'manual'});assert.equal(protectedPage.status,302);assert.match(protectedPage.headers.get('location'),/login.html\?next=/);
    for(const page of ['/','/login.html','/register.html','/css/variables.css','/js/voyage.js'])assert.equal((await fetch(base+page)).status,200,page);
  } finally { server.closeAllConnections();await new Promise(resolve=>server.close(resolve));await database.pool.end(); }
});
