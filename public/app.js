const API="/api";
let map,currentLocation=null,markers=[],routeLine=null,vehicleMarker=null,animationTimer=null;

const icon=emoji=>L.divIcon({className:"emoji-marker",html:`<div style="font-size:26px">${emoji}</div>`,iconSize:[30,30],iconAnchor:[15,15]});

function initMap(){
  map=L.map("map").setView([15.8230,80.3510],13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"&copy; OpenStreetMap contributors"}).addTo(map);
  autoLocate();
}
function clearMarkers(){markers.forEach(m=>map.removeLayer(m));markers=[];}
function markerVehicle(v){
  const e=v.type==="Ambulance"?"🚑":v.type==="Fire Engine"?"🚒":"🚓";
  return L.marker([v.latitude,v.longitude],{icon:icon(e)}).addTo(map)
    .bindPopup(`<b>${e} ${v.vehicle_number}</b><br>${v.type}<br>Status: ${v.status}<br><small>Demo live position</small>`);
}
async function loadMapData(lat,lon){
  clearMarkers();
  const [vehicles,hospitals]=await Promise.all([
    fetch(`${API}/vehicles/nearest?lat=${lat}&lon=${lon}`).then(r=>r.json()),
    fetch(`${API}/hospitals?lat=${lat}&lon=${lon}&radius=10000`).then(r=>r.json())
  ]);
  markers.push(L.marker([lat,lon],{icon:icon("🔴")}).addTo(map).bindPopup("<b>📍 Accident / current location</b>"));
  vehicles.forEach(v=>markers.push(markerVehicle(v)));
  hospitals.forEach(h=>markers.push(L.marker([h.latitude,h.longitude],{icon:icon("🏥")}).addTo(map)
    .bindPopup(`<b>🏥 ${h.name}</b><br>${h.distance_km} km away • ~${h.eta_min} min<br><small>${h.source||"Demo data"}</small>`)));
}
function setLocation(lat,lon){
  currentLocation={lat,lon};
  document.getElementById("lat").value=lat;document.getElementById("lon").value=lon;
  document.getElementById("gpsStatus").textContent=`📍 ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
  map.setView([lat,lon],14);loadMapData(lat,lon);loadVehicles();loadHospitals();
}
function autoLocate(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(
      p=>setLocation(p.coords.latitude,p.coords.longitude),
      ()=>setLocation(15.8230,80.3510),
      {enableHighAccuracy:true,timeout:9000}
    );
  }else setLocation(15.8230,80.3510);
}
document.getElementById("locateBtn").onclick=()=>{
  if(!navigator.geolocation)return alert("Geolocation is not supported.");
  navigator.geolocation.getCurrentPosition(p=>setLocation(p.coords.latitude,p.coords.longitude),
    e=>alert("Location permission failed: "+e.message),{enableHighAccuracy:true,timeout:10000});
};
document.getElementById("demoBtn").onclick=()=>setLocation(15.8230,80.3510);

async function createAccident(){
  const lat=Number(document.getElementById("lat").value),lon=Number(document.getElementById("lon").value);
  const out=document.getElementById("reportResult");
  if(!Number.isFinite(lat)||!Number.isFinite(lon)){out.innerHTML='<div class="error">Use GPS or enter valid coordinates.</div>';return null;}
  try {
    const a=await fetch(`${API}/accidents`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({latitude:lat,longitude:lon,description:document.getElementById("description").value,
        severity:document.getElementById("severity").value,confirmations:Number(document.getElementById("confirmations").value||0),
        photoProvided:document.getElementById("photo").checked})}).then(r=>r.json());
    if(!a || a.error){
      out.innerHTML=`<div class="error">${a?.error || "Failed to create accident report."}</div>`;
      return null;
    }
    out.innerHTML=`<div class="result"><strong>Report #${a.id} created</strong> • Verification: <b>${a.verification_status}</b> (${a.verification_score}/100)</div>`;
    setLocation(lat,lon);loadAccidents();return a;
  }catch(err){
    out.innerHTML=`<div class="error">Error submitting report: ${err.message}</div>`;
    return null;
  }
}
document.getElementById("reportBtn").onclick=createAccident;

async function traceVehicle(dispatch){
  if(animationTimer)cancelAnimationFrame(animationTimer);
  if(routeLine)map.removeLayer(routeLine);
  if(vehicleMarker)map.removeLayer(vehicleMarker);

  const route=await fetch(`${API}/route?fromLat=${dispatch.fromLat}&fromLon=${dispatch.fromLon}&toLat=${dispatch.toLat}&toLon=${dispatch.toLon}`).then(r=>r.json());
  const coords=(route.geometry?.coordinates||[]).map(c=>[c[1],c[0]]);
  if(coords.length<2)return;

  routeLine=L.polyline(coords,{weight:5,dashArray:"10 8"}).addTo(map);
  vehicleMarker=L.marker(coords[0],{icon:icon("🚑")}).addTo(map)
    .bindPopup(`<b>🚑 ${dispatch.vehicle_number}</b><br>En route to accident`);

  const box=document.getElementById("tracer");
  box.classList.remove("hidden");
  document.getElementById("traceVehicle").textContent=`🚑 ${dispatch.vehicle_number}`;
  document.getElementById("traceDistance").textContent=`${route.distance_km} km`;
  document.getElementById("traceEta").textContent=`~${route.eta_min} min`;
  document.getElementById("traceStatus").textContent="En route • live demo tracer";

  map.fitBounds(routeLine.getBounds(),{padding:[30,30]});

  let i=0;
  const duration=Math.max(12000,Math.min(30000,routeEtaToMs(route.eta_min)));
  const start=performance.now();
  function tick(now){
    const t=Math.min(1,(now-start)/duration);
    const pos=tweenAlong(coords,t);
    vehicleMarker.setLatLng(pos);
    document.getElementById("traceProgress").style.width=(t*100).toFixed(0)+"%";
    if(t<1)animationTimer=requestAnimationFrame(tick);
    else{
      document.getElementById("traceStatus").textContent="✅ Arrived at accident location";
      vehicleMarker.bindPopup(`<b>🚑 ${dispatch.vehicle_number}</b><br>✅ Arrived at accident`).openPopup();
    }
  }
  animationTimer=requestAnimationFrame(tick);
}
function routeEtaToMs(min){return min*1000;}
function tweenAlong(points,t){
  const idx=(points.length-1)*t,lo=Math.floor(idx),hi=Math.min(points.length-1,lo+1),f=idx-lo;
  return [points[lo][0]+(points[hi][0]-points[lo][0])*f,points[lo][1]+(points[hi][1]-points[lo][1])*f];
}

async function activateSOS(){
  const btn=document.getElementById("sosBtn"),dash=document.getElementById("emergencyDashboard");
  btn.disabled=true;btn.textContent="🚨 SOS ACTIVE";
  document.getElementById("severity").value="Critical";
  document.getElementById("description").value="SOS emergency alert";
  document.getElementById("confirmations").value="1";
  dash.classList.remove("hidden");dash.scrollIntoView({behavior:"smooth",block:"start"});

  const submit=async(lat,lon)=>{
    const a=await fetch(`${API}/accidents`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({latitude:lat,longitude:lon,description:"SOS emergency alert",severity:"Critical",confirmations:1,photoProvided:false})}).then(r=>r.json());
    document.getElementById("sosLocation").textContent=`${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    document.getElementById("sosVerification").textContent=`${a.verification_status} (${a.verification_score}/100)`;

    const [vehicles,hospitals]=await Promise.all([
      fetch(`${API}/vehicles/nearest?lat=${lat}&lon=${lon}`).then(r=>r.json()),
      fetch(`${API}/hospitals?lat=${lat}&lon=${lon}&radius=10000`).then(r=>r.json())
    ]);
    const amb=vehicles.find(v=>v.type==="Ambulance"),fire=vehicles.find(v=>v.type==="Fire Engine"),
      pol=vehicles.find(v=>v.type==="Police"),h=hospitals[0];
    const vt=v=>v?`${v.vehicle_number} • ${v.distance_km} km • ~${v.eta_min} min`:"Not available";
    document.getElementById("sosAmbulance").textContent=vt(amb);
    document.getElementById("sosFire").textContent=vt(fire);
    document.getElementById("sosPolice").textContent=vt(pol);
    document.getElementById("sosHospital").textContent=h?`${h.name} • ${h.distance_km} km • ~${h.eta_min} min`:"No hospital found in 10 km";

    if(amb){
      const d=await fetch(`${API}/dispatch`,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({accidentId:a.id,vehicleId:amb.id,vehicleLat:amb.latitude,vehicleLon:amb.longitude})}).then(r=>r.json());
      await traceVehicle(d);
    }
    setLocation(lat,lon);loadAccidents();loadVehicles();loadHospitals();
    btn.disabled=false;btn.textContent="SOS / EMERGENCY";
  };

  if(navigator.geolocation)navigator.geolocation.getCurrentPosition(
    p=>submit(p.coords.latitude,p.coords.longitude),()=>submit(15.8230,80.3510),
    {enableHighAccuracy:true,timeout:8000}
  ); else submit(15.8230,80.3510);
}
document.getElementById("sosBtn").onclick=activateSOS;

async function loadVehicles(){
  const lat=Number(document.getElementById("lat").value)||15.8230,lon=Number(document.getElementById("lon").value)||80.3510;
  let data=[];
  try{
    const res=await fetch(`${API}/vehicles/nearest?lat=${lat}&lon=${lon}`);
    data=await res.json();
  }catch(e){data=[];}
  if(!Array.isArray(data))data=[];
  document.getElementById("vehicles").innerHTML=data.map(v=>{
    const e=v.type==="Ambulance"?"🚑":v.type==="Fire Engine"?"🚒":"🚓";
    return `<div class="item"><div class="item-head"><span>${e} ${v.vehicle_number}</span><span class="tag green">${v.status}</span></div>
    <div class="meta">${v.type} • ${v.distance_km} km away • ETA ~ ${v.eta_min} min • Demo live position</div>
    <button class="small dispatch" data-id="${v.id}" data-lat="${v.latitude}" data-lon="${v.longitude}" style="margin-top:8px">Dispatch & Trace</button></div>`;
  }).join("")||'<div class="meta">No available vehicles found.</div>';

  document.querySelectorAll(".dispatch").forEach(b=>b.onclick=async()=>{
    const accidents=await fetch(`${API}/accidents`).then(r=>r.json()).catch(()=>[]);
    const a=Array.isArray(accidents)?accidents[0]:null;
    if(!a)return alert("Submit an accident report first.");
    const d=await fetch(`${API}/dispatch`,{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({accidentId:a.id,vehicleId:Number(b.dataset.id),vehicleLat:Number(b.dataset.lat),vehicleLon:Number(b.dataset.lon)})}).then(r=>r.json());
    if(d && !d.error) await traceVehicle(d);
    loadVehicles();loadAccidents();
  });
}
async function loadHospitals(){
  const lat=Number(document.getElementById("lat").value)||15.8230,lon=Number(document.getElementById("lon").value)||80.3510;
  let data=[];
  try{
    const res=await fetch(`${API}/hospitals?lat=${lat}&lon=${lon}&radius=10000`);
    data=await res.json();
  }catch(e){data=[];}
  if(!Array.isArray(data))data=[];
  document.getElementById("hospitalSource").textContent=data[0]?.source==="OpenStreetMap"?"Live OpenStreetMap data":"Demo fallback data";
  document.getElementById("hospitals").innerHTML=data.slice(0,8).map(h=>`<div class="item"><div class="item-head"><span>🏥 ${h.name}</span>
  <span class="tag ${h.emergency_available?"green":"red"}">${h.emergency_available?"Emergency Available":"Unavailable"}</span></div>
  <div class="meta">${h.distance_km} km away • ETA ~ ${h.eta_min} min • ${h.phone||""}</div></div>`).join("")
  ||'<div class="meta">No hospitals found within 10 km.</div>';
}
async function loadAccidents(){
  let data=[];
  try{
    const res=await fetch(`${API}/accidents`);
    data=await res.json();
  }catch(e){data=[];}
  if(!Array.isArray(data))data=[];
  document.getElementById("accidents").innerHTML=data.length?`<table><thead><tr><th>ID</th><th>Location</th><th>Severity</th><th>Verification</th><th>Score</th><th>Time</th></tr></thead><tbody>
  ${data.slice(0,15).map(a=>`<tr><td>#${a.id}</td><td>${Number(a.latitude).toFixed(4)}, ${Number(a.longitude).toFixed(4)}</td><td>${a.severity}</td><td>${a.verification_status}</td><td>${a.verification_score}/100</td><td>${a.created_at}</td></tr>`).join("")}</tbody></table>`:'<div class="meta">No accident reports yet.</div>';
}
document.getElementById("refreshVehicles").onclick=loadVehicles;
document.getElementById("refreshHospitals").onclick=loadHospitals;
document.getElementById("refreshAccidents").onclick=loadAccidents;
initMap();loadAccidents();