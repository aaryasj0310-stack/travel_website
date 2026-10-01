const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

test('all pages have a single H1, labels, unique IDs and existing local assets', () => {
  for (const file of fs.readdirSync('frontend').filter(p=>p.endsWith('.html'))) {
    const html=fs.readFileSync('frontend/'+file,'utf8');
    assert.equal((html.match(/<h1\b/g)||[]).length,1,file);
    const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
    assert.equal(new Set(ids).size,ids.length,file+' duplicate IDs');
    for(const input of html.matchAll(/<(?:input|select|textarea)\b[^>]*\bid="([^"]+)"[^>]*>/g)) assert.ok(html.includes(`for="${input[1]}"`),file+' '+input[1]+' label');
    for(const reference of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
      if(reference[1].startsWith('http'))continue;
      assert.ok(fs.existsSync(path.join('frontend',reference[1].split(/[?#]/)[0])),file+' '+reference[1]);
    }
    assert.match(html,/class="skip-link"/);
    assert.doesNotMatch(html,/DEV_USER_ID|novalidate|href="#"|style="/);
  }
  const css=fs.readdirSync('frontend/css').map(file=>fs.readFileSync('frontend/css/'+file,'utf8')).join('\n');
  const definitions=new Set([...css.matchAll(/(--[\w-]+)\s*:/g)].map(m=>m[1]));
  for(const token of css.matchAll(/var\((--[\w-]+)/g))assert.ok(definitions.has(token[1]),token[1]);
  assert.match(css,/prefers-reduced-motion/);
});

// Minimal DOM substitute: catches page initialization and rendering errors, not
// browser layout, focus, native form behavior or accessibility-tree problems.
test('operational scripts initialize with data, empty data and request failures', async () => {
  const trip={id:7,userId:1,destination:'Goa <script>',startDate:'2026-10-01',endDate:'2026-10-03',numTravelers:2,status:'upcoming',description:'Beach & food'};
  const categories=['Transportation','Accommodation','Food','Activities','Shopping','Miscellaneous'].map((name,i)=>({id:i+1,name,slug:name.toLowerCase()}));
  const allocations=categories.map(c=>({categoryId:c.id,categoryName:c.name,categorySlug:c.slug,allocatedAmount:'100.00',spentAmount:'0.10',remaining:'99.90',consumedPercent:0,health:'within'}));
  const budget={id:8,tripId:7,totalAmount:'1000.00',allocations};
  const finance={total:'1000.00',allocated:'600.00',unallocated:'400.00',spent:'0.60',remaining:'999.40',consumedPercent:0,perTraveler:'500.00',perDay:'333.33',remainingPerDay:'333.13',remainingDays:3,recordedPerElapsedDay:null,elapsedPercent:0,categories:allocations};
  const overview={trip,trips:[trip],today:'2026-09-30',duration:3,daysUntil:1,finance,activityCount:0,unplannedDays:3,outsideDateCount:0,todayActivities:[],nextActivity:null};
  for(const page of ['trips','dashboard','itinerary','budget','expenses'])for(const state of ['data','empty','error']) {
    const nodes=new Map();
    const element=()=>({value:'',hidden:false,disabled:false,textContent:'',dataset:{},attributes:{},listeners:{},classList:{toggle(){},remove(){},contains(){return false;}},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k];},addEventListener(k,fn){this.listeners[k]=fn;},focus(){},showModal(){},close(){},reset(){},remove(){}});
    const parse=html=>{for(const match of html.matchAll(/\bid="([^"]+)"/g))if(!nodes.has('#'+match[1])){const node=element();Object.defineProperty(node,'innerHTML',{get(){return this.html||'';},set(value){this.html=value;parse(value);}});nodes.set('#'+match[1],node);}};
    parse(fs.readFileSync('frontend/'+page+'.html','utf8'));
    const urls=[];
    const document={body:{dataset:{page}},querySelector:selector=>nodes.get(selector)||null,addEventListener(){}};
    const location={search:'?tripId=7',pathname:'/'+page+'.html',href:'http://localhost/'+page+'.html?tripId=7',assign(){},replace(){}};
    const sandbox={document,location,history:{replaceState(){}},window:{},URL,URLSearchParams,Intl,Date,console,confirm:()=>false,fetch:async url=>{
      urls.push(url);const key=url.split('?')[0];
      const data=key.endsWith('/auth/me')?{user:{id:1,name:'Traveler',email:'test@example.test'},csrfToken:'test'}:
        key.endsWith('/dashboard')?(state==='empty'?{trips:[],trip:null,today:overview.today}:overview):
        key.endsWith('/budgets/categories')?{categories}:key.endsWith('/budget')?{budget}:key.endsWith('/budgets')?{budgets:state==='empty'?[]:[{...budget,totalSpent:'0.60'}]}:
        key.endsWith('/itineraries')?{itineraries:[],trip}:key.endsWith('/expenses')?{expenses:[]}:{trips:state==='empty'?[]:[trip]};
      const ok=state!=='error'||key.endsWith('/auth/me');return {ok,status:ok?200:503,json:async()=>({success:ok,data,message:'Database unavailable'})};
    }};
    vm.createContext(sandbox);vm.runInContext(fs.readFileSync('frontend/js/voyage.js','utf8'),sandbox);sandbox.Voyage=sandbox.window.Voyage;
    await vm.runInContext(fs.readFileSync('frontend/js/'+page+'.js','utf8'),sandbox);
    assert.ok(urls.every(url=>!url.includes('userId=')));
    if(state==='error')assert.equal(nodes.get('#page-alert').hidden,false,page+' error state');
    if(state==='data'){
      const rendered=[...nodes.values()].map(n=>n.innerHTML||'').join('');
      assert.doesNotMatch(rendered,/<script>|undefined|NaN/,page);
      if(page!=='trips')assert.match(rendered,/tripId=7/);
    }
  }
});
