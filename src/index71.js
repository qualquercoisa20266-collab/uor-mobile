const GAME_VERSION = '2.1';
const JSON_HEADERS = { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' };
const COOKIE = 'uor_session';
const SESSION_DAYS = 30;
const RANKS = [
  ['soldado','Soldado',0],['cabo','Cabo',20],['terceiro_sargento','Terceiro Sargento',40],['segundo_sargento','Segundo Sargento',70],['primeiro_sargento','Primeiro Sargento',100],['aspirante','Aspirante',150],['segundo_tenente','Segundo Tenente',200],['primeiro_tenente','Primeiro Tenente',300],['capitao','Capitão',400],['major','Major',550],['coronel','Coronel',700],['tenente_coronel','Tenente Coronel',900],['general_brigada','General de Brigada',1100],['general_divisao','General de Divisão',1400],['general_exercito','General de Exército',1800],['marechal','Marechal',2500]
];
const COLORS = ['crimson','azure','forest','brass','violet','ash'];
const COLOR_LABELS = {crimson:'Carmesim',azure:'Azul-real',forest:'Floresta',brass:'Bronze',violet:'Violeta',ash:'Cinza-aço'};
const CONTINENTS = {NA:{name:'América do Norte',bonus:5},SA:{name:'América do Sul',bonus:2},EU:{name:'Europa',bonus:4},AF:{name:'África',bonus:3},AS:{name:'Ásia',bonus:7},OC:{name:'Oceania',bonus:2}};
const TERRITORIES = [
 ['alaska','Alasca','NA'],['mackenzie','Mackenzie','NA'],['vancouver','Vancouver','NA'],['ottawa','Ottawa','NA'],['labrador','Labrador','NA'],['california','Califórnia','NA'],['nova_york','Nova York','NA'],['mexico','México','NA'],['groelandia','Groelândia','NA'],
 ['colombia_venezuela','Colômbia/Venezuela','SA'],['brasil','Brasil','SA'],['peru_bolivia_chile','Peru/Bolívia/Chile','SA'],['argentina_uruguai','Argentina/Uruguai','SA'],
 ['islandia','Islândia','EU'],['inglaterra','Inglaterra','EU'],['suecia','Suécia','EU'],['alemanha','Alemanha','EU'],['franca','França','EU'],['espanha','Espanha','EU'],['italia','Itália','EU'],['polonia','Polônia','EU'],['moscou','Moscou','EU'],
 ['argelia','Argélia','AF'],['libia','Líbia','AF'],['egito','Egito','AF'],['nigeria','Nigéria','AF'],['sudao','Sudão','AF'],['congo','Congo','AF'],['tanzania','Tanzânia','AF'],['africa_sul','África do Sul','AF'],['madagascar','Madagascar','AF'],
 ['dudinka','Dudinka','AS'],['omsk','Omsk','AS'],['siberia','Sibéria','AS'],['vladivostok','Vladivostok','AS'],['mongolia','Mongólia','AS'],['tchita','Tchita','AS'],['aral','Aral','AS'],['china','China','AS'],['oriente_medio','Oriente Médio','AS'],['india','Índia','AS'],['vietna','Vietnã','AS'],['japao','Japão','AS'],
 ['sumatra','Sumatra','OC'],['borneu','Bornéu','OC'],['nova_guine','Nova Guiné','OC'],['australia','Austrália','OC']
].map(([id,name,continent])=>({id,name,continent}));
const T = Object.fromEntries(TERRITORIES.map(t=>[t.id,t]));
const ADJ = {
 colombia_venezuela:['brasil','peru_bolivia_chile','mexico'],peru_bolivia_chile:['colombia_venezuela','brasil','argentina_uruguai'],brasil:['colombia_venezuela','peru_bolivia_chile','argentina_uruguai','nigeria'],argentina_uruguai:['peru_bolivia_chile','brasil'],
 alaska:['mackenzie','vladivostok','vancouver'],mackenzie:['alaska','vancouver','ottawa','groelandia'],vancouver:['mackenzie','ottawa','california','alaska'],ottawa:['mackenzie','vancouver','labrador','nova_york','california'],labrador:['ottawa','nova_york','groelandia'],groelandia:['labrador','islandia','mackenzie'],california:['vancouver','nova_york','mexico','ottawa'],nova_york:['ottawa','labrador','california','mexico'],mexico:['california','nova_york','colombia_venezuela'],
 islandia:['groelandia','inglaterra'],inglaterra:['islandia','suecia','alemanha','franca'],suecia:['inglaterra','alemanha','polonia','moscou'],alemanha:['inglaterra','suecia','franca','polonia','italia'],franca:['inglaterra','alemanha','espanha','italia'],espanha:['franca','italia'],italia:['franca','polonia','alemanha','espanha','oriente_medio','argelia'],polonia:['suecia','alemanha','italia','moscou','oriente_medio'],moscou:['suecia','polonia','omsk','aral','oriente_medio'],
 argelia:['libia','nigeria','italia'],libia:['argelia','egito','nigeria','sudao'],egito:['libia','sudao','oriente_medio'],nigeria:['brasil','argelia','libia','sudao','congo'],sudao:['libia','egito','nigeria','congo','tanzania'],congo:['nigeria','sudao','tanzania','africa_sul'],tanzania:['sudao','congo','africa_sul','madagascar'],africa_sul:['congo','tanzania','madagascar'],madagascar:['tanzania','africa_sul'],
 dudinka:['omsk','mongolia','siberia'],omsk:['dudinka','mongolia','aral','moscou'],siberia:['dudinka','tchita','vladivostok','mongolia'],vladivostok:['siberia','tchita','japao','alaska'],tchita:['siberia','vladivostok','mongolia','china'],mongolia:['omsk','siberia','tchita','aral','china','dudinka'],aral:['omsk','mongolia','china','oriente_medio','moscou','india'],china:['mongolia','tchita','aral','india','vietna','japao'],oriente_medio:['moscou','aral','india','egito','polonia','italia'],india:['oriente_medio','aral','china','vietna','sumatra'],vietna:['china','india','borneu'],japao:['vladivostok','china'],
 australia:['sumatra','borneu','nova_guine'],nova_guine:['australia','borneu'],borneu:['nova_guine','vietna','australia'],sumatra:['australia','india']
};
const OBJECTIVE_POOL = [
 {type:'territories',count:24,text:'Conquistar 24 territórios quaisquer.'},
 {type:'continents',list:['AS','AF'],text:'Dominar por completo a Ásia e a África.'},{type:'continents',list:['AS','SA'],text:'Dominar por completo a Ásia e a América do Sul.'},{type:'continents',list:['NA','AF'],text:'Dominar por completo a América do Norte e a África.'},{type:'continents',list:['NA','OC'],text:'Dominar por completo a América do Norte e a Oceania.'},
 {type:'continents_any_extra',list:['EU','OC'],extra:1,text:'Dominar a Europa, a Oceania e mais um continente qualquer.'},{type:'continents_any_extra',list:['EU','SA'],extra:1,text:'Dominar a Europa, a América do Sul e mais um continente qualquer.'},{type:'continents_any_extra',list:['NA','AS'],extra:1,text:'Dominar a América do Norte, a Ásia e mais um continente qualquer.'},{type:'eliminate',text:'Destruir por completo o exército {COLOR}.'}
];
const STARTING_ARMIES = {2:40,3:35,4:30,5:25,6:20};
const CARD_SYMBOLS = ['espada','castelo','cavalo','aviao'];
const TRADE_VALUES = [4,6,8,10,12,15];
const AIR = 'aviao';
const DISCONNECT_GRACE_MS = 10*60*1000;
const EMERGENCY_AI_TICK_MS = 1500;
const DESERTER_SUSPENSION_MS = [60*60*1000, 2*60*60*1000, 6*60*60*1000];

function now(){return Date.now();}
function uuid(){return crypto.randomUUID();}
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...extra}});}
function parseCookie(req,name){const s=req.headers.get('Cookie')||'';for(const p of s.split(';')){const [k,...v]=p.trim().split('=');if(k===name)return decodeURIComponent(v.join('='));}return null;}
function cookie(name,value,maxAge){return `${name}=${encodeURIComponent(value)}; ${maxAge==null?'':`Max-Age=${maxAge}; `}Path=/; HttpOnly; Secure; SameSite=Lax`}
function clearCookie(name){return `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`}
function b64(buf){return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function ub64(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
async function sha256(s){return b64(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));}
async function hashPassword(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),{name:'PBKDF2'},false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:ub64(salt),iterations:100000,hash:'SHA-256'},key,256);return b64(bits);}
function rankFor(points){let idx=0;for(let i=0;i<RANKS.length;i++)if(points>=RANKS[i][2])idx=i;const r=RANKS[idx],next=RANKS[idx+1];return {id:r[0],name:r[1],min:r[2],next:next?{id:next[0],name:next[1],min:next[2]}:null,progress:next?Math.max(0,Math.min(100,((points-r[2])/(next[2]-r[2]))*100)):100};}
async function body(req){try{return await req.json()}catch{return {}}}
let moderationSchemaPromise=null;
async function ensureModerationSchema(env){
  if(!moderationSchemaPromise){
    moderationSchemaPromise=(async()=>{
      try{await env.DB.prepare('SELECT role FROM users LIMIT 1').first();}
      catch{try{await env.DB.prepare("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'PLAYER'").run();}catch(e){if(!String(e?.message||e).toLowerCase().includes('duplicate column'))throw e;}}
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_mutes (user_id TEXT PRIMARY KEY, muted_by TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL)`).run();
      try{await env.DB.prepare('SELECT system FROM chat_messages LIMIT 1').first();}
      catch{try{await env.DB.prepare('ALTER TABLE chat_messages ADD COLUMN system INTEGER NOT NULL DEFAULT 0').run();}catch(e){if(!String(e?.message||e).toLowerCase().includes('duplicate column'))throw e;}}
      await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_user_mutes_expires ON user_mutes(expires_at)').run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS player_discipline (user_id TEXT PRIMARY KEY, desertion_count INTEGER NOT NULL DEFAULT 0, updated_at INTEGER NOT NULL)`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS player_suspensions (user_id TEXT PRIMARY KEY, reason TEXT NOT NULL DEFAULT 'deserção', created_at INTEGER NOT NULL, suspended_until INTEGER NOT NULL, desertion_count INTEGER NOT NULL DEFAULT 1, source TEXT NOT NULL DEFAULT 'system')`).run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS desertion_records (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, room_id TEXT NOT NULL, created_at INTEGER NOT NULL, desertion_count INTEGER NOT NULL)`).run();
      await env.DB.prepare('CREATE UNIQUE INDEX IF NOT EXISTS idx_desertion_records_user_room ON desertion_records(user_id,room_id)').run();
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS admin_audit_log (id INTEGER PRIMARY KEY AUTOINCREMENT, admin_user_id TEXT NOT NULL, target_user_id TEXT, action TEXT NOT NULL, details TEXT, created_at INTEGER NOT NULL)`).run();
      await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_player_suspensions_until ON player_suspensions(suspended_until)').run();
      await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_admin_audit_created ON admin_audit_log(created_at)').run();
    })().catch(e=>{moderationSchemaPromise=null;throw e;});
  }
  return moderationSchemaPromise;
}
function normalizeRole(role){const r=String(role||'PLAYER').toUpperCase();return r==='ADMIN'||r==='STAFF'?r:'PLAYER';}
async function getActiveSuspension(env,userId){
  await ensureModerationSchema(env);
  const row=await env.DB.prepare('SELECT user_id,reason,created_at,suspended_until,desertion_count,source FROM player_suspensions WHERE user_id=?').bind(userId).first();
  if(!row)return null;
  const until=Number(row.suspended_until||0),ts=now();
  if(until<=ts){await env.DB.prepare('DELETE FROM player_suspensions WHERE user_id=?').bind(userId).run();return null;}
  return {userId:row.user_id,reason:String(row.reason||'deserção'),createdAt:Number(row.created_at||0),suspendedUntil:until,desertionCount:Number(row.desertion_count||1),source:String(row.source||'system'),remainingMs:until-ts};
}
async function assertNotSuspended(env,userId){const suspension=await getActiveSuspension(env,userId);if(!suspension)return null;return json({ok:false,error:`Você está suspenso por deserção. Tempo restante: ${Math.max(1,Math.ceil(suspension.remainingMs/60000))} minuto(s).`,suspension},403);}
async function recordAdminAudit(env,admin,target,action,details){await ensureModerationSchema(env);await env.DB.prepare('INSERT INTO admin_audit_log(admin_user_id,target_user_id,action,details,created_at) VALUES(?,?,?,?,?)').bind(admin?.id||'',target?.id||null,action,details||null,now()).run();}
async function recordDesertionSuspension(env,userId,roomId,source='system'){
  await ensureModerationSchema(env);
  const existing=await env.DB.prepare('SELECT id,desertion_count,created_at FROM desertion_records WHERE user_id=? AND room_id=?').bind(userId,roomId).first();
  if(existing){const current=await getActiveSuspension(env,userId);if(current)return current;const duration=DESERTER_SUSPENSION_MS[Math.min(Math.max(Number(existing.desertion_count||1)-1,0),DESERTER_SUSPENSION_MS.length-1)];return {userId,reason:'deserção',createdAt:Number(existing.created_at||now()),suspendedUntil:0,desertionCount:Number(existing.desertion_count||1),source,remainingMs:0,durationMs:duration};}
  const ts=now();
  const d=await env.DB.prepare('SELECT desertion_count FROM player_discipline WHERE user_id=?').bind(userId).first();
  const count=Math.max(1,Number(d?.desertion_count||0)+1);
  const duration=DESERTER_SUSPENSION_MS[Math.min(count-1,DESERTER_SUSPENSION_MS.length-1)];
  const until=ts+duration;
  await env.DB.prepare('INSERT INTO player_discipline(user_id,desertion_count,updated_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET desertion_count=excluded.desertion_count,updated_at=excluded.updated_at').bind(userId,count,ts).run();
  await env.DB.prepare('INSERT INTO desertion_records(id,user_id,room_id,created_at,desertion_count) VALUES(?,?,?,?,?)').bind(uuid(),userId,roomId,ts,count).run();
  await env.DB.prepare('INSERT INTO player_suspensions(user_id,reason,created_at,suspended_until,desertion_count,source) VALUES(?,?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET reason=excluded.reason,created_at=excluded.created_at,suspended_until=excluded.suspended_until,desertion_count=excluded.desertion_count,source=excluded.source').bind(userId,'deserção',ts,until,count,source).run();
  return {userId,reason:'deserção',createdAt:ts,suspendedUntil:until,desertionCount:count,source,remainingMs:duration,durationMs:duration};
}
function isStaffOrAdmin(user){return user?.role==='STAFF'||user?.role==='ADMIN';}
function isAdmin(user){return user?.role==='ADMIN';}
async function getActiveMute(env,userId){
  await ensureModerationSchema(env);
  const row=await env.DB.prepare('SELECT user_id,muted_by,created_at,expires_at FROM user_mutes WHERE user_id=?').bind(userId).first();
  if(!row)return null;
  if(Number(row.expires_at)<=now()){await env.DB.prepare('DELETE FROM user_mutes WHERE user_id=?').bind(userId).run();return null;}
  return {userId:row.user_id,mutedBy:row.muted_by,createdAt:Number(row.created_at),expiresAt:Number(row.expires_at)};
}
async function requireModerator(req,env){const user=await authUser(req,env);if(!user)return null;return isStaffOrAdmin(user)?user:null;}
function internalHeaders(env,userId){return {'content-type':'application/json','x-uor-user':userId,'x-uor-internal-key':String(env.UOR_ADMIN_KEY||'')};}
async function authUser(req,env){await ensureModerationSchema(env);const token=parseCookie(req,COOKIE);if(!token)return null;const th=await sha256(token);const row=await env.DB.prepare(`SELECT u.id,u.nick,u.login,u.role,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?`).bind(th,now()).first();if(row)row.role=normalizeRole(row.role);return row||null;}
async function createSession(env,userId){const token=crypto.getRandomValues(new Uint8Array(32));const raw=b64(token);const th=await sha256(raw),ts=now(),exp=ts+SESSION_DAYS*86400000;await env.DB.prepare('INSERT INTO sessions(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)').bind(uuid(),userId,th,ts,exp).run();return raw;}
function validNick(v){return /^[\p{L}0-9 _-]{3,24}$/u.test(v);}
function validLogin(v){return /^[a-zA-Z0-9._-]{3,24}$/.test(v);}
function passwordScore(p){let n=0;if(p.length>=8)n++;if(/[A-Z]/.test(p))n++;if(/[a-z]/.test(p))n++;if(/[0-9]/.test(p))n++;if(/[^A-Za-z0-9]/.test(p))n++;return n;}
async function rateBlocked(env,login){const cutoff=now()-15*60000;const r=await env.DB.prepare('SELECT COUNT(*) c FROM auth_attempts WHERE login=? AND success=0 AND created_at>?').bind(login,cutoff).first();return Number(r?.c||0)>=7;}
async function logAttempt(env,login,success){await env.DB.prepare('INSERT INTO auth_attempts(login,success,created_at) VALUES(?,?,?)').bind(login,success?1:0,now()).run();}

async function apiAuthRegister(req,env){
  try{
    await ensureModerationSchema(env);
    const b=await body(req);
    const nick=String(b.nick||'').trim();
    const login=String(b.login||'').trim().toLowerCase();
    const password=String(b.password||'');
    const confirm=String(b.confirmPassword??b.password2??'');
    if(!validNick(nick))return json({ok:false,error:'Nick inválido. Use 3 a 24 caracteres.'},400);
    if(!validLogin(login))return json({ok:false,error:'Login inválido.'},400);
    if(password.length<8||passwordScore(password)<4)return json({ok:false,error:'Senha fraca. Use pelo menos 8 caracteres, com maiúscula, minúscula, número e símbolo.'},400);
    if(password!==confirm)return json({ok:false,error:'As senhas não coincidem.'},400);
    const exists=await env.DB.prepare('SELECT id FROM users WHERE login=? OR nick=?').bind(login,nick).first();
    if(exists)return json({ok:false,error:'Login ou nick já está em uso.'},409);
    const id=uuid(),salt=b64(crypto.getRandomValues(new Uint8Array(16))),ph=await hashPassword(password,salt),ts=now();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO users(id,nick,login,password_salt,password_hash,created_at) VALUES(?,?,?,?,?,?)').bind(id,nick,login,salt,ph,ts),
      env.DB.prepare('INSERT INTO user_stats(user_id) VALUES(?)').bind(id)
    ]);
    const token=await createSession(env,id);
    return json({ok:true,user:{id,nick,login,role:'PLAYER'},session:true},200,{'set-cookie':cookie(COOKIE,token)});
  }catch(e){
    return json({ok:false,error:'Não foi possível criar a conta no servidor.',detail:String(e?.message||e)},500);
  }
}
async function apiAuthLogin(req,env){await ensureModerationSchema(env);const b=await body(req),login=String(b.login||'').trim().toLowerCase(),password=String(b.password||'');if(!validLogin(login))return json({ok:false,error:'Login inválido.'},400);if(await rateBlocked(env,login))return json({ok:false,error:'Muitas tentativas. Aguarde 15 minutos.'},429);const u=await env.DB.prepare('SELECT * FROM users WHERE login=?').bind(login).first();if(!u){await logAttempt(env,login,false);return json({ok:false,error:'Login ou senha incorretos.'},401);}const ph=await hashPassword(password,u.password_salt);if(ph!==u.password_hash){await logAttempt(env,login,false);return json({ok:false,error:'Login ou senha incorretos.'},401);}await logAttempt(env,login,true);await env.DB.prepare('DELETE FROM sessions WHERE user_id=? AND expires_at<?').bind(u.id,now()).run();await env.DB.prepare('UPDATE users SET last_login_at=? WHERE id=?').bind(now(),u.id).run();const token=await createSession(env,u.id);return json({ok:true,user:{id:u.id,nick:u.nick,login:u.login,role:normalizeRole(u.role)}},200,{'set-cookie':cookie(COOKIE,token)});}
async function apiAuthMe(req,env){const u=await authUser(req,env);return u?json({ok:true,user:{id:u.id,nick:u.nick,login:u.login,role:normalizeRole(u.role)}}):json({ok:false,error:'Não autenticado.'},401);}
async function apiAuthLogout(req,env){const token=parseCookie(req,COOKIE);if(token){const th=await sha256(token);await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(th).run();}return json({ok:true},200,{'set-cookie':clearCookie(COOKIE)});}

async function getRoomDO(env,id){return env.UOR_ROOM.get(env.UOR_ROOM.idFromName(id));}
async function apiRooms(req,env){const staleBefore=now()-30*60*1000;await env.DB.prepare('DELETE FROM rooms WHERE game_active=0 AND updated_at<?').bind(staleBefore).run();const rows=await env.DB.prepare('SELECT id,name,max_players,host_user_id,players_json,game_active,updated_at,created_at FROM rooms ORDER BY updated_at DESC LIMIT 100').all();const list=rows.results||[];const parsed=list.map(r=>{let players=[];try{players=JSON.parse(r.players_json||'[]')}catch{}return {raw:r,players};});const ids=[...new Set(parsed.flatMap(x=>x.players.map(p=>p&&p.id).filter(Boolean)))];const roleMap=new Map();if(ids.length){const ph=ids.map(()=>'?').join(',');const rr=await env.DB.prepare(`SELECT id,role FROM users WHERE id IN (${ph})`).bind(...ids).all();for(const x of rr.results||[])roleMap.set(x.id,normalizeRole(x.role));}return json({ok:true,rooms:parsed.map(({raw:r,players})=>({id:r.id,name:r.name,maxPlayers:r.max_players,hostConnId:r.host_user_id,players:players.map(p=>({...p,role:roleMap.get(p.id)||normalizeRole(p.role)})),gameActive:!!r.game_active,updatedAt:r.updated_at,createdAt:r.created_at}))});}
async function apiCreateRoom(req,env,user){const blocked=await assertNotSuspended(env,user.id);if(blocked)return blocked;const b=await body(req),color=COLORS.includes(b.color)?b.color:COLORS[0],name=`Sala do General ${user.nick} — ${COLOR_LABELS[color]||color}`,max=6;const existing=await env.DB.prepare('SELECT id FROM rooms WHERE players_json LIKE ?').bind(`%${user.id}%`).first();if(existing)return json({ok:false,error:'Você já está em uma sala.'},409);const st=await env.DB.prepare('SELECT points FROM user_stats WHERE user_id=?').bind(user.id).first();const rankId=rankFor(Number(st?.points||0)).id;const id=uuid(),ts=now(),player={id:user.id,connId:user.id,name:user.nick,color,rankId,role:normalizeRole(user.role),ready:true,eliminated:false};await env.DB.prepare('INSERT INTO rooms(id,name,max_players,host_user_id,players_json,updated_at,created_at) VALUES(?,?,?,?,?,?,?)').bind(id,name,max,user.id,JSON.stringify([player]),ts,ts).run();const d=await getRoomDO(env,id);await d.fetch(new Request('https://uor-room/internal/init',{method:'POST',headers:{'content-type':'application/json','x-uor-user':user.id},body:JSON.stringify({id,name,maxPlayers:max,hostConnId:user.id,players:[player]})}));return json({ok:true,room:{id,name,maxPlayers:max,hostConnId:user.id,players:[player],gameActive:false,updatedAt:ts}});}
async function apiJoinRoom(req,env,user,roomId){const blocked=await assertNotSuspended(env,user.id);if(blocked)return blocked;const b=await body(req),color=COLORS.includes(b.color)?b.color:COLORS[0],st=await env.DB.prepare('SELECT points FROM user_stats WHERE user_id=?').bind(user.id).first(),rankId=rankFor(Number(st?.points||0)).id,d=await getRoomDO(env,roomId);const r=await d.fetch(new Request('https://uor-room/internal/join',{method:'POST',headers:{'content-type':'application/json','x-uor-user':user.id},body:JSON.stringify({userId:user.id,name:user.nick,color,rankId,role:normalizeRole(user.role)})}));if(!r.ok)return r;const data=await r.json();await syncRoomRow(env,roomId,data.room);return json({ok:true,room:data.room,assignedColor:data.assignedColor||color});}
async function apiLeaveRoom(req,env,user,roomId){const d=await getRoomDO(env,roomId);const r=await d.fetch(new Request('https://uor-room/internal/leave',{method:'POST',headers:{'content-type':'application/json','x-uor-user':user.id},body:'{}'}));if(!r.ok)return r;const data=await r.json();if(data.deleted){await env.DB.prepare('DELETE FROM rooms WHERE id=?').bind(roomId).run();}else await syncRoomRow(env,roomId,data.room);return json({ok:true});}
async function apiAbandonRoom(req,env,user,roomId){
  const blocked=await assertNotSuspended(env,user.id);if(blocked)return blocked;
  const d=await getRoomDO(env,roomId);
  const r=await d.fetch(new Request('https://uor-room/internal/abandon',{method:'POST',headers:internalHeaders(env,user.id),body:'{}'}));
  if(!r.ok)return r;
  const data=await r.json();
  if(data.room)await syncRoomRow(env,roomId,data.room);
  return json({ok:true,abandoned:true,nick:data.nick,suspension:data.suspension||null});
}
async function apiReconnectRoom(req,env,user){
  const blocked=await assertNotSuspended(env,user.id);if(blocked)return blocked;
  const rows=await env.DB.prepare('SELECT id, name, max_players, host_user_id, players_json, game_active, updated_at, created_at FROM rooms WHERE game_active=1 AND players_json LIKE ? ORDER BY updated_at DESC LIMIT 20').bind(`%${user.id}%`).all();
  for(const raw of rows.results||[]){
    const d=await getRoomDO(env,raw.id);
    try{
      const r=await d.fetch(new Request('https://uor-room/internal/reconnect-status',{method:'POST',headers:internalHeaders(env,user.id),body:'{}'}));
      if(r.ok){const data=await r.json();if(data.match) return json({ok:true,match:data.match});}
    }catch{}
  }
  return json({ok:true,match:null});
}
async function apiAdminSuspensions(req,env,user){
  if(!isStaffOrAdmin(user))return json({ok:false,error:'Sem permissão.'},403);
  await ensureModerationSchema(env);
  await env.DB.prepare('DELETE FROM player_suspensions WHERE suspended_until<=?').bind(now()).run();
  const rows=await env.DB.prepare(`SELECT s.user_id,s.reason,s.created_at,s.suspended_until,s.desertion_count,s.source,u.nick,u.role FROM player_suspensions s JOIN users u ON u.id=s.user_id WHERE s.suspended_until>? ORDER BY s.suspended_until ASC,u.nick COLLATE NOCASE`).bind(now()).all();
  return json({ok:true,suspensions:(rows.results||[]).map(x=>({userId:x.user_id,nick:x.nick,role:normalizeRole(x.role),reason:String(x.reason||'deserção'),createdAt:Number(x.created_at||0),suspendedUntil:Number(x.suspended_until||0),remainingMs:Math.max(0,Number(x.suspended_until||0)-now()),desertionCount:Number(x.desertion_count||1),source:String(x.source||'system'),canRemove:isAdmin(user)}))});
}
async function apiAdminRemoveSuspension(req,env,user){
  if(!isAdmin(user))return json({ok:false,error:'Somente ADMIN pode remover suspensões.'},403);
  const b=await body(req),targetId=String(b.userId||'').trim();if(!targetId)return json({ok:false,error:'Jogador não informado.'},400);
  await ensureModerationSchema(env);
  const target=await env.DB.prepare('SELECT id,nick,role FROM users WHERE id=?').bind(targetId).first();if(!target)return json({ok:false,error:'Jogador não encontrado.'},404);
  const current=await getActiveSuspension(env,targetId);if(!current)return json({ok:false,error:'Este jogador não está suspenso.'},404);
  await env.DB.prepare('DELETE FROM player_suspensions WHERE user_id=?').bind(targetId).run();
  await recordAdminAudit(env,user,target,'suspension_removed',`Suspensão removida por ${user.nick} de ${target.nick}. Deserções acumuladas: ${current.desertionCount}.`);
  return json({ok:true,userId:targetId,nick:target.nick,removedBy:user.nick,desertionCount:current.desertionCount});
}
async function syncRoomRow(env,roomId,room){await env.DB.prepare('UPDATE rooms SET name=?,max_players=?,host_user_id=?,players_json=?,game_active=?,updated_at=? WHERE id=?').bind(room.name||'Sala',room.maxPlayers||4,room.hostConnId||room.players?.[0]?.id||null,JSON.stringify(room.players||[]),room.gameActive?1:0,now(),roomId).run();}
async function apiPublicRoles(req,env,user){const url=new URL(req.url),ids=[...new Set(String(url.searchParams.get('ids')||'').split(',').map(x=>x.trim()).filter(Boolean))].slice(0,100);if(!ids.length)return json({ok:true,roles:[]});const ph=ids.map(()=>'?').join(',');const rows=await env.DB.prepare(`SELECT id,role FROM users WHERE id IN (${ph})`).bind(...ids).all();return json({ok:true,roles:(rows.results||[]).map(x=>({id:x.id,role:normalizeRole(x.role)}))});}
async function apiChat(req,env,user){
  await ensureModerationSchema(env);
  if(req.method==='GET'){
    const rows=await env.DB.prepare('SELECT c.nick name,c.color,c.text,c.ts,c.system,s.points,u.role FROM chat_messages c LEFT JOIN user_stats s ON s.user_id=c.user_id LEFT JOIN users u ON u.id=c.user_id ORDER BY c.id DESC LIMIT 200').all();
    return json({ok:true,chat:(rows.results||[]).reverse().map(x=>({...x,system:!!x.system,rankId:rankFor(Number(x.points||0)).id,role:normalizeRole(x.role)}))});
  }
  const mute=await getActiveMute(env,user.id);if(mute)return json({ok:false,error:`Você está silenciado por mais ${Math.max(1,Math.ceil((mute.expiresAt-now())/60000))} minuto(s).`},403);
  const b=await body(req),text=String(b.text||'').trim().slice(0,400);if(!text)return json({ok:false,error:'Mensagem vazia.'},400);
  const st=await env.DB.prepare('SELECT points FROM user_stats WHERE user_id=?').bind(user.id).first();const entry={name:user.nick,color:COLORS.includes(b.color)?b.color:COLORS[0],rankId:rankFor(Number(st?.points||0)).id,role:normalizeRole(user.role),text,ts:now(),system:false};
  await env.DB.prepare('INSERT INTO chat_messages(user_id,nick,color,text,ts) VALUES(?,?,?,?,?)').bind(user.id,user.nick,entry.color,text,entry.ts).run();await env.DB.prepare('DELETE FROM chat_messages WHERE id NOT IN (SELECT id FROM chat_messages ORDER BY id DESC LIMIT 200)').run();return json({ok:true,entry});
}

async function addGlobalSystemMessage(env,text,actor){
  await ensureModerationSchema(env);
  const st=await env.DB.prepare('SELECT points FROM user_stats WHERE user_id=?').bind(actor?.id||'').first();
  const color=COLORS[0],ts=now(),rankId=rankFor(Number(st?.points||0)).id;
  await env.DB.prepare('INSERT INTO chat_messages(user_id,nick,color,text,ts,system) VALUES(?,?,?,?,?,1)').bind(actor?.id||'',actor?.nick||'Sistema',color,text,ts).run();
  await env.DB.prepare('DELETE FROM chat_messages WHERE id NOT IN (SELECT id FROM chat_messages ORDER BY id DESC LIMIT 200)').run();
  return {name:'Sistema',color,rankId,text,ts,system:true};
}
async function apiModerationMute(req,env,user){
  if(!isStaffOrAdmin(user))return json({ok:false,error:'Sem permissão.'},403);
  const b=await body(req),targetId=String(b.userId||'').trim();if(!targetId||targetId===user.id)return json({ok:false,error:'Jogador inválido.'},400);
  await ensureModerationSchema(env);
  const target=await env.DB.prepare('SELECT id,nick,role FROM users WHERE id=?').bind(targetId).first();if(!target)return json({ok:false,error:'Jogador não encontrado.'},404);
  if(target.role==='ADMIN' && user.role!=='ADMIN')return json({ok:false,error:'STAFF não pode silenciar uma conta ADMIN.'},403);
  const ts=now(),expires=ts+30*60*1000;
  await env.DB.prepare('INSERT INTO user_mutes(user_id,muted_by,created_at,expires_at) VALUES(?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET muted_by=excluded.muted_by,created_at=excluded.created_at,expires_at=excluded.expires_at').bind(targetId,user.id,ts,expires).run();
  const text=`${target.nick} foi silenciado por 30 minutos.`;const system=await addGlobalSystemMessage(env,text,user);
  const rooms=await env.DB.prepare('SELECT id FROM rooms WHERE players_json LIKE ? LIMIT 20').bind(`%${targetId}%`).all();
  for(const r of rooms.results||[]){try{const d=await getRoomDO(env,r.id);await d.fetch(new Request('https://uor-room/internal/moderation-event',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({kind:'mute',targetId,targetNick:target.nick,expiresAt:expires})}));}catch{}}
  return json({ok:true,userId:targetId,nick:target.nick,mutedUntil:expires,system});
}
async function apiModerationUnmute(req,env,user){
  if(!isStaffOrAdmin(user))return json({ok:false,error:'Sem permissão.'},403);
  const b=await body(req),targetId=String(b.userId||'').trim();if(!targetId||targetId===user.id)return json({ok:false,error:'Jogador inválido.'},400);
  await ensureModerationSchema(env);
  const target=await env.DB.prepare('SELECT id,nick,role FROM users WHERE id=?').bind(targetId).first();if(!target)return json({ok:false,error:'Jogador não encontrado.'},404);
  if(target.role==='ADMIN' && user.role!=='ADMIN')return json({ok:false,error:'STAFF não pode remover silêncio de uma conta ADMIN.'},403);
  await env.DB.prepare('DELETE FROM user_mutes WHERE user_id=?').bind(targetId).run();
  const text=`O silêncio de ${target.nick} foi removido.`;const system=await addGlobalSystemMessage(env,text,user);
  const rooms=await env.DB.prepare('SELECT id FROM rooms WHERE players_json LIKE ? LIMIT 20').bind(`%${targetId}%`).all();
  for(const r of rooms.results||[]){try{const d=await getRoomDO(env,r.id);await d.fetch(new Request('https://uor-room/internal/moderation-event',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({kind:'unmute',targetId,targetNick:target.nick})}));}catch{}}
  return json({ok:true,userId:targetId,nick:target.nick,mutedUntil:null,system});
}
async function apiModerationStatus(req,env,user){
  if(!isStaffOrAdmin(user))return json({ok:false,error:'Sem permissão.'},403);
  const url=new URL(req.url),targetId=String(url.searchParams.get('userId')||'').trim();if(!targetId)return json({ok:false,error:'Jogador inválido.'},400);
  const target=await env.DB.prepare('SELECT id,nick,role FROM users WHERE id=?').bind(targetId).first();if(!target)return json({ok:false,error:'Jogador não encontrado.'},404);
  const mute=await getActiveMute(env,targetId);return json({ok:true,user:{id:target.id,nick:target.nick,role:normalizeRole(target.role)},muted:!!mute,mutedUntil:mute?.expiresAt||null});
}
async function apiAdminUsers(req,env,user){
  if(!isAdmin(user))return json({ok:false,error:'Somente ADMIN pode gerenciar cargos.'},403);
  const url=new URL(req.url),q=String(url.searchParams.get('q')||'').trim().toLowerCase(),limit=Math.max(1,Math.min(100,Number(url.searchParams.get('limit')||100)));
  const rows=q?await env.DB.prepare('SELECT id,nick,login,role,created_at,last_login_at FROM users WHERE lower(nick) LIKE ? OR lower(login) LIKE ? ORDER BY nick COLLATE NOCASE LIMIT ?').bind(`%${q}%`,`%${q}%`,limit).all():await env.DB.prepare('SELECT id,nick,login,role,created_at,last_login_at FROM users ORDER BY nick COLLATE NOCASE LIMIT ?').bind(limit).all();
  return json({ok:true,users:(rows.results||[]).map(x=>({id:x.id,nick:x.nick,login:x.login,role:normalizeRole(x.role),createdAt:Number(x.created_at||0),lastLoginAt:Number(x.last_login_at||0)}))});
}
async function apiAdminSetRole(req,env,user){
  if(!isAdmin(user))return json({ok:false,error:'Somente ADMIN pode alterar cargos.'},403);
  const b=await body(req),targetId=String(b.userId||'').trim(),role=String(b.role||'').trim().toUpperCase();if(!targetId)return json({ok:false,error:'Conta não informada.'},400);
  if(!['PLAYER','STAFF','ADMIN'].includes(role))return json({ok:false,error:'Cargo inválido.'},400);
  if(targetId===user.id&&role!=='ADMIN')return json({ok:false,error:'O ADMIN não pode remover o próprio cargo por este painel.'},400);
  const target=await env.DB.prepare('SELECT id,nick,login FROM users WHERE id=?').bind(targetId).first();if(!target)return json({ok:false,error:'Conta não encontrada.'},404);
  await env.DB.prepare('UPDATE users SET role=? WHERE id=?').bind(role,targetId).run();
  const rooms=await env.DB.prepare('SELECT id FROM rooms WHERE players_json LIKE ? LIMIT 20').bind(`%${targetId}%`).all();
  for(const r of rooms.results||[]){try{const d=await getRoomDO(env,r.id);await d.fetch(new Request('https://uor-room/internal/user-role-updated',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({targetId,role})}));}catch{}}
  try{const d=await getRoomDO(env,'__uor_lobby_presence__');await d.fetch(new Request('https://uor-room/internal/user-role-updated',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({targetId,role})}));}catch{}
  return json({ok:true,user:{id:target.id,nick:target.nick,login:target.login,role}});
}
async function apiAdminBootstrapRole(req,env){
  await ensureModerationSchema(env);
  const key=String(env.UOR_ADMIN_KEY||'');if(!key)return json({ok:false,error:'UOR_ADMIN_KEY não configurada no Worker.'},503);
  if(req.headers.get('x-uor-admin-key')!==key)return json({ok:false,error:'Chave de administração inválida.'},403);
  const b=await body(req),login=String(b.login||'').trim().toLowerCase(),role=String(b.role||'ADMIN').trim().toUpperCase();if(!login||!['PLAYER','STAFF','ADMIN'].includes(role))return json({ok:false,error:'Informe login e cargo válidos.'},400);
  const target=await env.DB.prepare('SELECT id,nick,login FROM users WHERE login=?').bind(login).first();if(!target)return json({ok:false,error:'Conta não encontrada.'},404);
  await env.DB.prepare('UPDATE users SET role=? WHERE id=?').bind(role,target.id).run();
  return json({ok:true,user:{id:target.id,nick:target.nick,login:target.login,role}});
}

async function apiProfile(req,env,user){const s=await env.DB.prepare('SELECT * FROM user_stats WHERE user_id=?').bind(user.id).first();const r=rankFor(Number(s?.points||0));const pos=await env.DB.prepare('SELECT COUNT(*) c FROM user_stats WHERE points>?').bind(Number(s?.points||0)).first();const ach=await env.DB.prepare('SELECT a.id,a.name,a.description,ua.unlocked_at FROM user_achievements ua JOIN achievements a ON a.id=ua.achievement_id WHERE ua.user_id=? ORDER BY ua.unlocked_at').bind(user.id).all();return json({ok:true,user:{id:user.id,nick:user.nick,login:user.login,role:normalizeRole(user.role)},stats:{points:Number(s?.points||0),games:Number(s?.games||0),wins:Number(s?.wins||0),losses:Number(s?.losses||0),abandons:Number(s?.abandons||0),winStreak:Number(s?.win_streak||0),bestStreak:Number(s?.best_streak||0),totalConquests:Number(s?.total_conquests||0),totalArmiesDestroyed:Number(s?.total_armies_destroyed||0),totalTurns:Number(s?.total_turns||0)},rank:r,rankingPosition:Number(pos?.c||0)+1,achievements:ach.results||[]});}
async function apiRanking(req,env){const url=new URL(req.url),limit=Math.max(1,Math.min(100,Number(url.searchParams.get('limit')||50)));const rows=await env.DB.prepare(`SELECT u.id,u.nick,u.role,s.points,s.games,s.wins,s.win_streak FROM user_stats s JOIN users u ON u.id=s.user_id ORDER BY s.points DESC,s.wins DESC,s.games ASC,u.created_at ASC LIMIT ?`).bind(limit).all();return json({ok:true,ranking:(rows.results||[]).map((x,i)=>({position:i+1,id:x.id,nick:x.nick,role:normalizeRole(x.role),points:Number(x.points),games:Number(x.games),wins:Number(x.wins),winStreak:Number(x.win_streak),rank:rankFor(Number(x.points))}))});}
async function apiPublicProfile(req,env,viewerId){const url=new URL(req.url),userId=String(url.searchParams.get('userId')||'').trim();if(!userId)return json({ok:false,error:'General não informado.'},400);const row=await env.DB.prepare('SELECT u.id,u.nick,u.role,s.points,s.games,s.wins,s.losses,s.abandons,s.win_streak,s.best_streak,s.total_conquests,s.total_armies_destroyed,s.total_turns FROM users u JOIN user_stats s ON s.user_id=u.id WHERE u.id=?').bind(userId).first();if(!row)return json({ok:false,error:'General não encontrado.'},404);const r=rankFor(Number(row.points||0));const pos=await env.DB.prepare('SELECT COUNT(*) c FROM user_stats WHERE points>?').bind(Number(row.points||0)).first();const ach=await env.DB.prepare('SELECT a.id,a.name,a.description,ua.unlocked_at FROM user_achievements ua JOIN achievements a ON a.id=ua.achievement_id WHERE ua.user_id=? ORDER BY ua.unlocked_at').bind(userId).all();return json({ok:true,user:{id:row.id,nick:row.nick,login:null,role:normalizeRole(row.role)},stats:{points:Number(row.points||0),games:Number(row.games||0),wins:Number(row.wins||0),losses:Number(row.losses||0),abandons:Number(row.abandons||0),winStreak:Number(row.win_streak||0),bestStreak:Number(row.best_streak||0),totalConquests:Number(row.total_conquests||0),totalArmiesDestroyed:Number(row.total_armies_destroyed||0),totalTurns:Number(row.total_turns||0)},rank:r,rankingPosition:Number(pos?.c||0)+1,achievements:ach.results||[]});}
async function apiPublicHistory(req,env,viewerId){const url=new URL(req.url),userId=String(url.searchParams.get('userId')||'').trim(),limit=Math.max(1,Math.min(50,Number(url.searchParams.get('limit')||20)));if(!userId)return json({ok:false,error:'General não informado.'},400);const exists=await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(userId).first();if(!exists)return json({ok:false,error:'General não encontrado.'},404);const rows=await env.DB.prepare('SELECT result,finished_at,players_count,opponent_names,points_delta,rank_after,room_name FROM match_history WHERE user_id=? ORDER BY finished_at DESC LIMIT ?').bind(userId,limit).all();return json({ok:true,history:(rows.results||[]).map(h=>({...h,playersCount:h.players_count,opponentNames:JSON.parse(h.opponent_names||'[]'),pointsDelta:h.points_delta,rankAfter:h.rank_after,finishedAt:h.finished_at,roomName:h.room_name}))});}
async function apiHistory(req,env,user){const url=new URL(req.url),limit=Math.max(1,Math.min(100,Number(url.searchParams.get('limit')||50)));const rows=await env.DB.prepare('SELECT * FROM match_history WHERE user_id=? ORDER BY finished_at DESC LIMIT ?').bind(user.id,limit).all();return json({ok:true,history:(rows.results||[]).map(h=>({...h,playersCount:h.players_count,opponentNames:JSON.parse(h.opponent_names||'[]'),pointsDelta:h.points_delta,rankAfter:h.rank_after,finishedAt:h.finished_at,roomName:h.room_name}))});}

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function roll(n){return Array.from({length:n},()=>1+Math.floor(Math.random()*6));}
function adjacent(a,b){return !!ADJ[a]?.includes(b);}
function reinforcementPlan(state,userId){const owned=TERRITORIES.filter(t=>state.territories[t.id].owner===userId);const free=Math.max(3,Math.floor(owned.length/3));const bonuses={};for(const [cid,c] of Object.entries(CONTINENTS)){const ts=TERRITORIES.filter(t=>t.continent===cid);if(ts.length&&ts.every(t=>state.territories[t.id].owner===userId))bonuses[cid]=c.bonus;}return {free,bonuses};}
function reinforcements(state,userId){const plan=reinforcementPlan(state,userId);return plan.free+Object.values(plan.bonuses).reduce((s,n)=>s+n,0);}
function beginReinforcementPhase(state,userId){const plan=reinforcementPlan(state,userId);state.continentBonusRemaining=structuredClone(plan.bonuses);state.pendingFreeReinforcements=plan.free;const bonusTotal=Object.values(plan.bonuses).reduce((s,n)=>s+n,0);state.reinforcementStage=bonusTotal>0?'continent':'free';state.reinforcementsRemaining=bonusTotal>0?bonusTotal:plan.free;if(bonusTotal===0)state.pendingFreeReinforcements=0;state.reinforcementOwnerId=userId;return state;}
function ensureReinforcementState(state,userId){if(state.phase!=='reforco')return state;if(!Object.prototype.hasOwnProperty.call(state,'continentBonusRemaining')||!Object.prototype.hasOwnProperty.call(state,'reinforcementStage'))beginReinforcementPhase(state,userId);return state;}
function finishContinentBonusStage(state){const remaining=Object.values(state.continentBonusRemaining||{}).reduce((s,n)=>s+Math.max(0,Number(n)||0),0);if(remaining>0)return false;state.reinforcementStage='free';state.reinforcementsRemaining=Math.max(0,Number(state.pendingFreeReinforcements)||0);state.pendingFreeReinforcements=0;return true;}
function continentOwned(state,userId,cid){return TERRITORIES.filter(t=>t.continent===cid).every(t=>state.territories[t.id].owner===userId);}
function objectiveWinner(state,p){const owned=TERRITORIES.filter(t=>state.territories[t.id].owner===p.id).length,o=state.objectives[p.id];if(owned===TERRITORIES.length)return true;if(!o)return false;if(o.type==='territories')return owned>=Number(o.count||24);if(o.type==='continents')return o.list.every(cid=>continentOwned(state,p.id,cid));if(o.type==='continents_any_extra')return o.list.every(cid=>continentOwned(state,p.id,cid))&&Object.keys(CONTINENTS).filter(cid=>!o.list.includes(cid)).filter(cid=>continentOwned(state,p.id,cid)).length>=o.extra;if(o.type==='eliminate'){const target=state.players.find(x=>x.color===o.targetColor);return !!target?.eliminated;}return false;}
function normalizeObjectives(state){
 const players=state.players||[],allow24=players.length>3;
 state.version=GAME_VERSION;
 for(const p of players){
  const o=state.objectives?.[p.id];
  if(!o)continue;
  if(o.type==='territories'&&Number(o.count)===18){
   if(allow24){o.count=24;o.text='Conquistar 24 territórios quaisquer.';}
   else {
    const fallback=OBJECTIVE_POOL.filter(x=>x.type!=='territories');
    state.objectives[p.id]=structuredClone(fallback[Math.floor(Math.random()*fallback.length)]);
   }
  }
  if(o.type==='territories'&&Number(o.count)===24&&!allow24){
   const fallback=OBJECTIVE_POOL.filter(x=>x.type!=='territories');
   state.objectives[p.id]=structuredClone(fallback[Math.floor(Math.random()*fallback.length)]);
  }
 }
 return state;
}
function checkWinner(state){normalizeObjectives(state);const active=state.players.filter(p=>!p.eliminated);if(active.length===1)return active[0].id;for(const p of active)if(objectiveWinner(state,p))return p.id;return null;}
function checkElims(state){for(const p of state.players){if(p.eliminated)continue;if(!TERRITORIES.some(t=>state.territories[t.id].owner===p.id)){p.eliminated=true;const h=state.hands[p.id]||[];state.discardPile.push(...h);state.hands[p.id]=[];state.log.push(`${p.name} foi eliminado da batalha.`);}}}
function stateSafeObjectivePool(players){return players.length>3?OBJECTIVE_POOL.slice():OBJECTIVE_POOL.filter(o=>o.type!=='territories');}
function makeObjective(state,p,source){let pool=Array.isArray(source)&&source.length?source:OBJECTIVE_POOL.slice();if(!pool.length)pool=OBJECTIVE_POOL.slice();let o=structuredClone(pool[Math.floor(Math.random()*pool.length)]);if(o.type==='eliminate'){const targets=state.players.filter(x=>x.id!==p.id&&x.color);const target=targets[Math.floor(Math.random()*Math.max(1,targets.length))];o.targetColor=target?.color||'';o.text=o.text.replace('{COLOR}',target?.name||'General');}return o;}
function initGame(room){const players=room.players.map(p=>({...p,id:p.id,connId:p.id,eliminated:false,conqueredThisTurn:false,connected:true,disconnectAt:null,reconnectUntil:null,aiControlled:false,abandoned:false,desertedAt:null,desertionReason:null}));const ids=shuffle(TERRITORIES.map(t=>t.id));const terr={};ids.forEach((tid,i)=>terr[tid]={owner:players[i%players.length].id,armies:1});const setup={};const start=STARTING_ARMIES[players.length]||20;for(const p of players){const owned=Object.values(terr).filter(x=>x.owner===p.id).length;setup[p.id]=Math.max(0,start-owned);}const objectivePool=stateSafeObjectivePool(players);const objectiveDeck=shuffle(objectivePool.slice());const objectives={};players.forEach((p,i)=>objectives[p.id]=makeObjective({players},p,[objectiveDeck[i%objectiveDeck.length]]));const state={version:GAME_VERSION,roomId:room.id,roomName:room.name,maxPlayers:room.maxPlayers,hostConnId:room.hostConnId,players,territories:terr,turnIndex:0,turnNumber:1,phase:'setup',setupRemaining:setup,reinforcementsRemaining:0,reinforcementStage:'free',continentBonusRemaining:{},pendingFreeReinforcements:0,objectives,deck:[],discardPile:[],hands:{},airAttackCards:{},airAttackPending:null,cardTradeCount:0,usedFortifyTerritories:[],fortifyLockedTerritories:[],pendingConquestTransfer:null,lastAttackAt:{},lastCombat:null,playerStats:Object.fromEntries(players.map(p=>[p.id,{conquests:0,armiesDestroyed:0}])),log:['Distribuição inicial iniciada.'],winner:null,resultRecorded:false,startedAt:now(),updatedAt:now()};for(const p of players)state.hands[p.id]=[];state.deck=shuffle(TERRITORIES.map(t=>({id:`card_${t.id}`,territoryId:t.id,name:t.name,symbol:null})));return state;}
function drawCard(state,id){const hand=state.hands?.[id]||[];if(hand.length>=5)return null;if(!state.deck.length){if(!state.discardPile.length)return null;state.deck=shuffle(state.discardPile.splice(0));}const c=state.deck.pop();const hasAir=Number(state.airAttackCards?.[id]||0)>0 || hand.some(x=>x.symbol===AIR);c.symbol=(!hasAir && Math.random()<0.20)?AIR:CARD_SYMBOLS[Math.floor(Math.random()*3)];state.hands[id]=hand;state.hands[id].push(c);return c;}
function validSet(cards){if(cards.length!==3)return false;const s=cards.map(c=>c.symbol);return s.every(x=>x===s[0])||new Set(s).size===3;}
function tradeValue(state){const n=Number(state.cardTradeCount||0);return n<6?TRADE_VALUES[n]:15+(n-5)*5;}
function advanceSetup(state){if(Object.values(state.setupRemaining).every(v=>v<=0)){state.phase='ataque';state.turnIndex=0;state.log.push('Distribuição concluída — começa a fase de ataque!');return;}for(let i=1;i<=state.players.length;i++){const idx=(state.turnIndex+i)%state.players.length;if((state.setupRemaining[state.players[idx].id]||0)>0){state.turnIndex=idx;break;}}}
function endTurn(state){const p=state.players[state.turnIndex];if(p?.conqueredThisTurn){drawCard(state,p.id);p.conqueredThisTurn=false;}state.usedFortifyTerritories=[];state.fortifyLockedTerritories=[];let idx=state.turnIndex;for(let i=1;i<=state.players.length;i++){const n=(idx+i)%state.players.length;if(!state.players[n].eliminated){idx=n;break;}}if(idx<=state.turnIndex)state.turnNumber++;state.turnIndex=idx;const cp=state.players[idx];state.phase=state.turnNumber===1?'ataque':'reforco';if(state.phase==='reforco'){beginReinforcementPhase(state,cp.id);}else{state.reinforcementStage='free';state.continentBonusRemaining={};state.pendingFreeReinforcements=0;state.reinforcementsRemaining=0;}state.log.push(`Vez de ${cp.name}.`);}
function resolveAttackCombat(state,p,fromId,toId,requestedDice){
 const t=state.territories,from=t[fromId],to=t[toId];
 if(!from||!to||from.owner!==p.id||to.owner===p.id||!adjacent(fromId,toId)||from.armies<2)return null;
 const maxDice=Math.min(3,from.armies-1);
 const dice=Math.max(1,Math.min(Number(requestedDice)||maxDice,maxDice));
 const defDice=Math.min(3,to.armies);
 const ar=roll(dice).sort((x,y)=>y-x),dr=roll(defDice).sort((x,y)=>y-x);
 let al=0,dl=0;
 for(let i=0;i<Math.min(ar.length,dr.length);i++)ar[i]>dr[i]?dl++:al++;
 from.armies=Math.max(1,from.armies-al);
 const before=to.armies,after=Math.max(0,before-dl),conquered=after===0;
 to.armies=conquered?0:Math.max(1,after);
 return {fromId,toId,atkRolls:ar,defRolls:dr,atkLoss:al,defLoss:dl,conquered,dice,ts:now()};
}

function finalizeAirAttack(state){
 const pending=state?.airAttackPending;
 if(!pending)return null;
 const attacker=state.players?.find(p=>p.id===pending.attackerId);
 const to=state.territories?.[pending.toId];
 if(!attacker||!to){
  state.airAttackPending=null;
  return null;
 }
 const destroyed=Math.max(0,Number(pending.destroyed)||0);
 state.playerStats=state.playerStats||{};
 state.playerStats[attacker.id]=state.playerStats[attacker.id]||{conquests:0,armiesDestroyed:0};
 state.playerStats[attacker.id].armiesDestroyed+=destroyed;
 state.playerStats[attacker.id].conquests+=1;
 to.owner=attacker.id;
 to.armies=1;
 attacker.conqueredThisTurn=true;
 state.airAttackCards=state.airAttackCards||{};
 state.airAttackCards[attacker.id]=Math.max(0,(state.airAttackCards[attacker.id]||0)-1);
 state.pendingConquestTransfer=null;
 state.lastCombat={fromId:pending.fromId||null,toId:pending.toId,atkRolls:[],defRolls:[],atkLoss:0,defLoss:0,conquered:true,airAttack:true,ts:now()};
 state.airAttackPending=null;
 state.log.push(`${attacker.name} lançou um Ataque Aéreo contra ${T[pending.toId].name}: todos os inimigos foram eliminados — território conquistado!`);
 checkElims(state);
 return state;
}

function applyAction(state,a){if(state.airAttackPending)return null;const p=state.players[state.turnIndex];if(!p||p.id!==a.byConnId||p.eliminated)return null;const t=state.territories;
 if(a.kind==='setupPlace'){if(state.phase!=='setup')return null;const rem=state.setupRemaining[p.id]||0,x=t[a.territoryId];if(!x||x.owner!==p.id||rem<=0)return null;const n=Math.max(1,Math.min(Number(a.amount)||1,rem));x.armies+=n;state.setupRemaining[p.id]-=n;if(state.setupRemaining[p.id]===0)advanceSetup(state);return state;}
 if(a.kind==='reinforce'){if(state.phase!=='reforco')return null;ensureReinforcementState(state,p.id);if(state.reinforcementsRemaining<=0)return null;const x=t[a.territoryId];if(!x||x.owner!==p.id)return null;if((state.reinforcementStage||'free')==='continent'){const meta=TERRITORIES.find(z=>z.id===a.territoryId);const cid=meta?.continent;const available=Number(state.continentBonusRemaining?.[cid]||0);if(!cid||available<=0)return null;const n=Math.max(1,Math.min(Number(a.amount)||1,available,state.reinforcementsRemaining));x.armies+=n;state.continentBonusRemaining[cid]=available-n;state.reinforcementsRemaining-=n;finishContinentBonusStage(state);return state;}const n=Math.max(1,Math.min(Number(a.amount)||1,state.reinforcementsRemaining));x.armies+=n;state.reinforcementsRemaining-=n;return state;}
 if(a.kind==='endReinforcePhase'){if(state.phase!=='reforco')return null;if((state.reinforcementStage||'free')==='continent')finishContinentBonusStage(state);if(state.reinforcementStage!=='free'||state.reinforcementsRemaining>0)return null;state.phase='ataque';return state;}
 if(a.kind==='attack'){if(state.phase!=='ataque'||state.pendingConquestTransfer)return null;const from=t[a.fromId],to=t[a.toId];if(!from||!to||from.owner!==p.id||to.owner===p.id||!adjacent(a.fromId,a.toId)||from.armies<2)return null;const last=state.lastAttackAt[p.id]||0;if(now()-last<1000)return null;state.lastAttackAt[p.id]=now();const combat=resolveAttackCombat(state,p,a.fromId,a.toId,a.dice);if(!combat)return null;state.playerStats[p.id].armiesDestroyed+=combat.defLoss;if(combat.conquered){state.playerStats[p.id].conquests++;to.owner=p.id;to.armies=0;p.conqueredThisTurn=true;state.pendingConquestTransfer={fromId:a.fromId,toId:a.toId,maxTransfer:combat.dice};}state.lastCombat=combat;state.log.push(`${p.name} atacou ${T[a.toId].name}: ${combat.atkRolls.join(',')} x ${combat.defRolls.join(',')}${combat.conquered?' — território conquistado!':''}`);checkElims(state);return state;}
 if(a.kind==='unitedAttack'){
  if(state.phase!=='ataque'||state.pendingConquestTransfer)return null;
  const targetId=a.toId,target=t[targetId],fromIds=Array.isArray(a.fromIds)?[...new Set(a.fromIds)]:[];
  if(!target||target.owner===p.id||fromIds.length<2)return null;
  const last=state.lastAttackAt[p.id]||0;if(now()-last<1000)return null;
  for(const fromId of fromIds){const from=t[fromId];if(!from||from.owner!==p.id||from.armies<2||!adjacent(fromId,targetId))return null;}
  state.lastAttackAt[p.id]=now();
  const combats=[];
  for(const fromId of fromIds){
    if(target.owner===p.id)break;
    const from=t[fromId];
    if(!from||from.armies<2)continue;
    const combat=resolveAttackCombat(state,p,fromId,targetId,Math.min(3,from.armies-1));
    if(!combat)continue;
    state.playerStats[p.id].armiesDestroyed+=combat.defLoss;
    combats.push(combat);
    if(combat.conquered){
      state.playerStats[p.id].conquests++;
      target.owner=p.id;target.armies=0;p.conqueredThisTurn=true;
      state.pendingConquestTransfer={fromId,toId:targetId,maxTransfer:combat.dice};
      break;
    }
  }
  if(!combats.length)return null;
  state.lastUnitedCombats=combats;
  state.lastCombat={...combats[combats.length-1],unitedAttack:true};
  state.log.push(`${p.name} realizou um Ataque Unido contra ${T[targetId].name} com ${combats.length} país(es).${state.pendingConquestTransfer?' — território conquistado!':''}`);
  checkElims(state);
  return state;
 }
 if(a.kind==='conquestTransfer'){if(state.phase!=='ataque')return null;const q=state.pendingConquestTransfer;if(!q||q.fromId!==a.fromId||q.toId!==a.toId)return null;const from=t[q.fromId],to=t[q.toId];if(!from||!to||from.owner!==p.id||to.owner!==p.id)return null;const max=Math.min(Number(q.maxTransfer)||1,Math.max(0,from.armies-1));const requested=Number(a.amount);if(!Number.isFinite(requested)||requested<1)return null;const n=Math.max(1,Math.min(Math.floor(requested),max));if(n>max||from.armies-n<1)return null;from.armies-=n;to.armies+=n;state.pendingConquestTransfer=null;state.lastCombat={...(state.lastCombat||{}),conquestTransfer:n,conquestTransferOnly:true,ts:now()};return state;}
 if(a.kind==='airAttack'){if(state.phase!=='ataque'||state.pendingConquestTransfer||state.airAttackPending||(state.airAttackCards[p.id]||0)<=0)return null;const to=t[a.toId];if(!to||to.owner===p.id)return null;const last=state.lastAttackAt[p.id]||0;if(now()-last<1000)return null;state.lastAttackAt[p.id]=now();const destroyed=Number(to.armies||0),fromId=TERRITORIES.find(x=>t[x.id].owner===p.id&&x.id!==a.toId)?.id||null;state.airAttackPending={attackerId:p.id,toId:a.toId,fromId,startedAt:now(),destroyed};return state;}
 if(a.kind==='endAttackPhase'){if(state.phase!=='ataque'||state.pendingConquestTransfer)return null;state.phase='fortificacao';state.usedFortifyTerritories=[];state.fortifyLockedTerritories=[];return state;}
 if(a.kind==='fortify'){if(state.phase!=='fortificacao')return null;const from=t[a.fromId],to=t[a.toId];if(!from||!to||from.owner!==p.id||to.owner!==p.id||!adjacent(a.fromId,a.toId)||from.armies<2)return null;const locked=state.fortifyLockedTerritories||[];if(locked.includes(a.fromId))return null;const n=Math.max(1,Math.min(Number(a.amount)||1,from.armies-1));from.armies-=n;to.armies+=n;if(!locked.includes(a.toId))locked.push(a.toId);state.fortifyLockedTerritories=locked;return state;}
 if(a.kind==='endTurn'){if(state.phase!=='fortificacao'&&state.phase!=='ataque')return null;if(state.pendingConquestTransfer)return null;endTurn(state);return state;}
 if(a.kind==='exchangeCards'){if(state.phase!=='reforco')return null;const hand=state.hands[p.id]||[],ids=Array.isArray(a.cardIds)?a.cardIds:[];if(ids.length===1){const card=hand.find(c=>c.id===ids[0]);if(!card||card.symbol!==AIR)return null;if(Number(state.airAttackCards?.[p.id]||0)>=1)return null;state.hands[p.id]=hand.filter(c=>c.id!==card.id);state.airAttackCards[p.id]=1;state.lastCardExchange={by:p.id,cards:[card],reward:0,airAttackCreated:1,ts:now()};state.log.push(`${p.name} guardou um Ataque Aéreo nos Veículos de Combate.`);return state;}if(ids.length!==3||new Set(ids).size!==3)return null;const cards=ids.map(id=>hand.find(c=>c.id===id));if(cards.some(x=>!x)||!validSet(cards)||cards.some(c=>c.symbol===AIR))return null;state.hands[p.id]=hand.filter(c=>!ids.includes(c.id));state.discardPile.push(...cards);const reward=tradeValue(state);state.cardTradeCount++;if((state.reinforcementStage||'free')==='continent')state.pendingFreeReinforcements=(Number(state.pendingFreeReinforcements)||0)+reward;else state.reinforcementsRemaining+=reward;for(const c of cards){if(t[c.territoryId]?.owner===p.id)t[c.territoryId].armies+=2;}state.lastCardExchange={by:p.id,cards,reward,ts:now()};return state;}
 return null;}

async function recordResults(env,state){if(state.resultRecorded||(!state.winner&&!state.annulled))return;state.resultRecorded=true;const ts=now();const winner=state.winner;for(const p of state.players){const result=state.annulled?'annulled':p.abandoned?'abandon':p.id===winner?'win':'loss';const delta=result==='win'?10:result==='abandon'?-6:result==='loss'?-3:0;const st=await env.DB.prepare('SELECT * FROM user_stats WHERE user_id=?').bind(p.id).first();if(!st)continue;let streak=Number(st.win_streak||0),best=Number(st.best_streak||0);streak=result==='win'?streak+1:0;best=Math.max(best,streak);const points=Math.max(0,Number(st.points||0)+delta);const rank=rankFor(points);const gamesAdd=result==='annulled'?0:1,winsAdd=result==='win'?1:0,lossesAdd=result==='loss'?1:0,abandonsAdd=result==='abandon'?1:0;await env.DB.prepare('UPDATE user_stats SET points=?,games=games+?,wins=wins+?,losses=losses+?,abandons=abandons+?,win_streak=?,best_streak=?,total_conquests=total_conquests+?,total_armies_destroyed=total_armies_destroyed+?,total_turns=total_turns+? WHERE user_id=?').bind(points,gamesAdd,winsAdd,lossesAdd,abandonsAdd,streak,best,Number(state.playerStats[p.id]?.conquests||0),Number(state.playerStats[p.id]?.armiesDestroyed||0),Number(state.turnNumber||0),p.id).run();const opponents=state.players.filter(x=>x.id!==p.id).map(x=>x.name);await env.DB.prepare('INSERT INTO match_history(id,user_id,room_id,room_name,result,finished_at,players_count,opponent_names,points_delta,rank_after) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(uuid(),p.id,state.roomId,state.roomName,result,ts,state.players.length,JSON.stringify(opponents),delta,rank.name).run();}
 const checks=await env.DB.prepare('SELECT u.id,s.* FROM user_stats s JOIN users u ON u.id=s.user_id WHERE s.user_id IN ('+state.players.map(()=>'?').join(',')+')').bind(...state.players.map(p=>p.id)).all();for(const s of checks.results||[]){const wins=Number(s.wins),games=Number(s.games),points=Number(s.points),ach=[];if(games>=1)ach.push('first_battle');if(wins>=1)ach.push('first_victory');if(wins>=5)ach.push('five_victories');if(wins>=10)ach.push('ten_victories');if(Number(s.win_streak)>=3)ach.push('streak_three');if(points>=100)ach.push('hundred_points');if(points>=1000)ach.push('thousand_points');if(rankFor(points).id==='marechal')ach.push('marshal');for(const a of ach)await env.DB.prepare('INSERT OR IGNORE INTO user_achievements(user_id,achievement_id,unlocked_at) VALUES(?,?,?)').bind(s.id,a,ts).run();}}

export class UORRoom {
 constructor(state,env){this.state=state;this.env=env;this.sockets=new Map();this.spectators=new Set();this.presenceSockets=new Map();this.presenceUsers=new Map();this.state.blockConcurrencyWhile(async()=>{this.room=await this.state.storage.get('room')||null;this.game=await this.state.storage.get('game')||null;if(this.game){normalizeObjectives(this.game);for(const p of this.game.players||[]){if(typeof p.connected!=='boolean')p.connected=true;if(p.abandoned==null)p.abandoned=false;if(p.aiControlled==null)p.aiControlled=false;if(p.disconnectAt==null)p.disconnectAt=null;if(p.reconnectUntil==null)p.reconnectUntil=null;}if(this.game.phase==='reforco'&&(!Object.prototype.hasOwnProperty.call(this.game,'continentBonusRemaining')||!Object.prototype.hasOwnProperty.call(this.game,'reinforcementStage'))){const cp=this.game.players?.[this.game.turnIndex];if(cp)beginReinforcementPhase(this.game,cp.id);}await this.state.storage.put('game',this.game);}await this.scheduleAutomationAlarm();});}
 async persist(){if(this.room==null)await this.state.storage.delete('room');else await this.state.storage.put('room',this.room);if(this.game==null)await this.state.storage.delete('game');else await this.state.storage.put('game',this.game);}
 async roomForPublic(){return this.room?{id:this.room.id,name:this.room.name,maxPlayers:this.room.maxPlayers,hostConnId:this.room.hostConnId,players:this.room.players,gameActive:!!this.game,version:GAME_VERSION,updatedAt:now()}:null;}
 async scheduleAutomationAlarm(){
  if(!this.game||this.game.winner)return;
  const candidates=[];
  if(this.game.airAttackPending?.resolveAt)candidates.push(Number(this.game.airAttackPending.resolveAt));
  for(const p of this.game.players||[]){if(p&&p.reconnectUntil&&!p.abandoned&&!p.eliminated)candidates.push(Number(p.reconnectUntil));}
  const cp=this.game.players?.[this.game.turnIndex];
  if(cp?.aiControlled&&!cp.eliminated&&!this.game.winner)candidates.push(now()+EMERGENCY_AI_TICK_MS);
  if(!candidates.length)return;
  const at=Math.max(now()+250,Math.min(...candidates.filter(Number.isFinite)));
  try{await this.state.storage.setAlarm(at);}catch{}
 }
 async processDisconnectDeadlines(){
  if(!this.game)return false;
  let changed=false;
  const ts=now();
  for(const p of this.game.players||[]){
    if(!p||p.abandoned||p.eliminated||!p.reconnectUntil)continue;
    if(p.connected)continue;
    if(Number(p.reconnectUntil)>ts)continue;
    const suspension=await recordDesertionSuspension(this.env,p.id,this.game.roomId,'disconnect_timeout');
    p.abandoned=true;p.desertedAt=ts;p.disconnectAt=null;p.reconnectUntil=null;p.aiControlled=true;p.connected=false;p.desertionReason='deserção';p.suspensionUntil=suspension?.suspendedUntil||null;p.desertionCount=suspension?.desertionCount||1;
    if(this.sockets.get(p.id)){try{this.sockets.get(p.id).close(4001,'desertion')}catch{}this.sockets.delete(p.id);}
    this.room.players=(this.room.players||[]).filter(x=>x.id!==p.id);
    if(this.room.hostConnId===p.id){const nextRoom=this.room.players.find(x=>x.id!==p.id);this.room.hostConnId=nextRoom?.id||null;}
    const nextHost=this.game.players.find(x=>x.id!==p.id&&!x.eliminated&&!x.abandoned&&(x.connected||this.sockets.has(x.id)))||this.game.players.find(x=>x.id!==p.id&&!x.eliminated&&!x.abandoned);
    if(this.game.hostConnId===p.id)this.game.hostConnId=nextHost?.id||null;
    this.game.log.push(`⚠️ ${p.name} ficou 10 minutos desconectado e desertou. 🤖 IA assumiu até o fim. Suspensão: ${p.desertionCount===1?'1 hora':p.desertionCount===2?'2 horas':'6 horas'}.`);
    changed=true;
  }
  if(changed){this.game.winner=checkWinner(this.game);if(this.game.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);await this.persist();if(this.room)await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'room_state',room:await this.roomForPublic()});this.broadcast({type:'game_state_sync',state:this.game});}
  return changed;
 }
 async finalizeAbandonment(uid,source='manual'){if(!this.game||this.game.winner)return {ok:false,status:409,error:'A partida já terminou.'};const p=this.game.players.find(x=>x.id===uid);if(!p||p.abandoned)return {ok:false,status:409,error:'Esta partida não está mais disponível para você.'};if(p.eliminated)return {ok:false,status:409,error:'Seu general já foi eliminado.'};const suspension=await recordDesertionSuspension(this.env,uid,this.game.roomId,source);const ts=now();p.abandoned=true;p.desertedAt=ts;p.disconnectAt=null;p.reconnectUntil=null;p.aiControlled=true;p.connected=false;p.desertionReason='deserção';p.suspensionUntil=suspension?.suspendedUntil||null;p.desertionCount=suspension?.desertionCount||1;if(this.sockets.get(uid)){try{this.sockets.get(uid).close(4001,'abandon')}catch{}this.sockets.delete(uid);}this.room.players=(this.room.players||[]).filter(x=>x.id!==uid);if(this.room.hostConnId===uid){const nextRoom=this.room.players[0];this.room.hostConnId=nextRoom?.id||null;}const nextHost=this.game.players.find(x=>x.id!==uid&&!x.eliminated&&!x.abandoned&&(x.connected||this.sockets.has(x.id)))||this.game.players.find(x=>x.id!==uid&&!x.eliminated&&!x.abandoned);if(this.game.hostConnId===uid)this.game.hostConnId=nextHost?.id||null;this.game.log.push(`⚠️ ${p.name} abandonou a partida. 🤖 IA assumiu até o fim.`);this.game.winner=checkWinner(this.game);if(this.game.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);await this.persist();if(this.room)await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'room_state',room:await this.roomForPublic()});this.broadcast({type:'game_state_sync',state:this.game});await this.scheduleAutomationAlarm();return {ok:true,status:200,nick:p.name,suspension};}
 chooseEmergencyAIAction(){
  if(!this.game||this.game.winner)return null;
  const p=this.game.players?.[this.game.turnIndex];if(!p||!p.aiControlled||p.eliminated)return null;const t=this.game.territories;
  if(this.game.phase==='setup'){
    const rem=Number(this.game.setupRemaining?.[p.id]||0);if(rem<=0){advanceSetup(this.game);return {__advanced:true};}
    const owned=TERRITORIES.filter(x=>t[x.id]?.owner===p.id).sort((a,b)=>Number(t[a.id].armies||0)-Number(t[b.id].armies||0));
    const target=owned[0];return target?{kind:'setupPlace',territoryId:target.id,amount:Math.min(3,rem)}:null;
  }
  if(this.game.phase==='reforco'){
    ensureReinforcementState(this.game,p.id);if(Number(this.game.reinforcementsRemaining||0)<=0)return {kind:'endReinforcePhase'};
    const candidates=TERRITORIES.filter(x=>t[x.id]?.owner===p.id).map(x=>{const threat=(ADJ[x.id]||[]).reduce((n,id)=>n+(t[id]?.owner!==p.id?1:0),0);return {x,score:threat*100-Number(t[x.id]?.armies||0)};}).sort((a,b)=>b.score-a.score);const target=candidates[0]?.x;return target?{kind:'reinforce',territoryId:target.id,amount:Math.min(3,Number(this.game.reinforcementsRemaining||1))}:null;
  }
  if(this.game.phase==='ataque'){
    if(this.game.pendingConquestTransfer)return {kind:'conquestTransfer',fromId:this.game.pendingConquestTransfer.fromId,toId:this.game.pendingConquestTransfer.toId,amount:Math.max(1,Math.min(Number(this.game.pendingConquestTransfer.maxTransfer||1),2))};
    const attacks=[];for(const fromMeta of TERRITORIES){const from=t[fromMeta.id];if(!from||from.owner!==p.id||Number(from.armies||0)<3)continue;for(const toId of ADJ[fromMeta.id]||[]){const to=t[toId];if(!to||to.owner===p.id)continue;const advantage=Number(from.armies||0)-Number(to.armies||0);if(advantage>=2)attacks.push({fromId:fromMeta.id,toId,advantage,fromArmies:Number(from.armies||0)});}}attacks.sort((a,b)=>b.advantage-a.advantage||b.fromArmies-a.fromArmies);if(attacks[0])return {kind:'attack',fromId:attacks[0].fromId,toId:attacks[0].toId,dice:Math.min(3,Math.max(1,attacks[0].fromArmies-1))};return {kind:'endAttackPhase'};
  }
  if(this.game.phase==='fortificacao'){
    const moves=[];for(const fromMeta of TERRITORIES){const from=t[fromMeta.id];if(!from||from.owner!==p.id||Number(from.armies||0)<2)continue;for(const toId of ADJ[fromMeta.id]||[]){const to=t[toId];if(!to||to.owner!==p.id)continue;if(Number(from.armies||0)>Number(to.armies||0)+1)moves.push({fromId:fromMeta.id,toId,targetArmies:Number(to.armies||0),sourceArmies:Number(from.armies||0)});}}moves.sort((a,b)=>a.targetArmies-b.targetArmies||b.sourceArmies-a.sourceArmies);if(moves[0])return {kind:'fortify',fromId:moves[0].fromId,toId:moves[0].toId,amount:1};return {kind:'endTurn'};
  }
  return null;
 }
 async runEmergencyAI(){
  if(!this.game||this.game.winner)return false;
  await this.processDisconnectDeadlines();
  if(!this.game||this.game.winner)return false;
  const p=this.game.players?.[this.game.turnIndex];if(!p||!p.aiControlled||p.eliminated)return false;
  const a=this.chooseEmergencyAIAction();if(!a)return false;if(a.__advanced){this.game.winner=checkWinner(this.game);await this.persist();this.broadcast({type:'game_state_sync',state:this.game});await this.scheduleAutomationAlarm();return true;}
  const next=applyAction(this.game,{...a,byConnId:p.id});if(!next)return false;this.game=next;this.game.winner=checkWinner(this.game);if(this.game.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);await this.persist();this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});await this.scheduleAutomationAlarm();return true;
 }
 publicGameStateForSpectator(state){if(!state)return state;const safe=structuredClone(state);delete safe.hands;delete safe.objectives;delete safe.reconnectCodes;delete safe.deck;delete safe.discardPile;delete safe.airAttackCards;delete safe.lastAttackAt;return safe;}
 broadcast(msg){for(const [uid,ws] of this.sockets.entries()){try{const spectator=this.spectators.has(uid);let out=msg;if(spectator&&msg?.type==='game_state_sync'&&msg.state)out={...msg,state:this.publicGameStateForSpectator(msg.state)};else if(spectator&&msg?.type==='room_relay'&&msg.payload?.type==='game_state_sync'&&msg.payload.state)out={...msg,payload:{...msg.payload,state:this.publicGameStateForSpectator(msg.payload.state)}};ws.send(JSON.stringify(out));}catch{}}}
 broadcastPresence(){const users=[...this.presenceUsers.values()].sort((a,b)=>a.nick.localeCompare(b.nick,'pt-BR',{sensitivity:'base'}));const raw=JSON.stringify({type:'presence_snapshot',users});for(const set of this.presenceSockets.values())for(const ws of set)try{ws.send(raw)}catch{}}
 async presenceSocketClosed(uid,ws){const set=this.presenceSockets.get(uid);if(!set||!set.has(ws))return;set.delete(ws);if(set.size===0){this.presenceSockets.delete(uid);this.presenceUsers.delete(uid);this.broadcastPresence();}}
 async fetch(req){const url=new URL(req.url),path=url.pathname;
  if(path==='/ws/lobby'){if(req.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});const uid=req.headers.get('x-uor-user');const nick=String(req.headers.get('x-uor-name')||'General').slice(0,24);const color=String(req.headers.get('x-uor-color')||'crimson');if(!uid)return new Response('Unauthorized',{status:401});const st=await this.env.DB.prepare('SELECT points,role FROM user_stats s JOIN users u ON u.id=s.user_id WHERE s.user_id=?').bind(uid).first();const rankId=rankFor(Number(st?.points||0)).id;const role=normalizeRole(st?.role);const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();let set=this.presenceSockets.get(uid);if(!set){set=new Set();this.presenceSockets.set(uid,set);}set.add(server);this.presenceUsers.set(uid,{id:uid,nick,color,rankId,role});server.addEventListener('close',()=>{this.presenceSocketClosed(uid,server)});server.addEventListener('error',()=>{this.presenceSocketClosed(uid,server)});server.send(JSON.stringify({type:'presence_snapshot',users:[...this.presenceUsers.values()].sort((a,b)=>a.nick.localeCompare(b.nick,'pt-BR',{sensitivity:'base'}))}));this.broadcastPresence();return new Response(null,{status:101,webSocket:client});}
  if(path.endsWith('/internal/user-role-updated')){const internalKey=String(this.env.UOR_ADMIN_KEY||'');if(!internalKey||req.headers.get('x-uor-internal-key')!==internalKey)return json({ok:false,error:'Internal key inválida.'},403);const actorId=req.headers.get('x-uor-user');const actor=actorId?await this.env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(actorId).first():null;if(!actor||!isStaffOrAdmin(actor))return json({ok:false,error:'Sem permissão.'},403);const b=await body(req),targetId=String(b.targetId||'').trim(),role=normalizeRole(b.role);if(this.room?.players)for(const p of this.room.players)if(p.id===targetId)p.role=role;if(this.game?.players)for(const p of this.game.players)if(p.id===targetId)p.role=role;if(this.room||this.game){await this.persist();if(this.room)this.broadcast({type:'room_state',room:await this.roomForPublic()});if(this.game)this.broadcast({type:'game_state_sync',state:this.game});}const presenceSet=this.presenceSockets.get(targetId);if(presenceSet)for(const ws of presenceSet)try{ws.send(JSON.stringify({type:'role_updated',role}));}catch{}const roomWs=this.sockets.get(targetId);if(roomWs)try{roomWs.send(JSON.stringify({type:'role_updated',role}));}catch{}if(!this.room&&!this.game){const u=this.presenceUsers.get(targetId);if(u)u.role=role;this.broadcastPresence();}return json({ok:true});}
  if(path.endsWith('/internal/moderation-event')){const internalKey=String(this.env.UOR_ADMIN_KEY||'');if(!internalKey||req.headers.get('x-uor-internal-key')!==internalKey)return json({ok:false,error:'Internal key inválida.'},403);const actorId=req.headers.get('x-uor-user');const actor=actorId?await this.env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(actorId).first():null;if(!actor||!isStaffOrAdmin(actor))return json({ok:false,error:'Sem permissão.'},403);const b=await body(req);const targetId=String(b.targetId||'').trim();if(!targetId)return json({ok:false,error:'Jogador inválido.'},400);const targetNick=String(b.targetNick||'General').slice(0,24);const kind=b.kind==='unmute'?'unmute':'mute';const text=kind==='mute'?`${targetNick} foi silenciado por 30 minutos.`:`O silêncio de ${targetNick} foi removido.`;this.broadcast({type:'room_relay',roomId:this.room?.id,payload:{type:'moderation_system',entry:{name:'Sistema',text,ts:now(),system:true}}});return json({ok:true});}
  if(path.endsWith('/internal/reconnect-status')){const internalKey=String(this.env.UOR_ADMIN_KEY||'');if(!internalKey||req.headers.get('x-uor-internal-key')!==internalKey)return json({ok:false,error:'Internal key inválida.'},403);const uid=req.headers.get('x-uor-user');await this.processDisconnectDeadlines();const p=this.game?.players?.find(x=>x.id===uid);if(!p||p.abandoned||p.eliminated||this.game?.winner||!this.room?.players?.some(x=>x.id===uid))return json({ok:true,match:null});return json({ok:true,match:{roomId:this.room.id,room:await this.roomForPublic(),player:{id:p.id,color:p.color,reconnectUntil:p.reconnectUntil||null,aiControlled:!!p.aiControlled}}});}
  if(path.endsWith('/internal/abandon')){const internalKey=String(this.env.UOR_ADMIN_KEY||'');if(!internalKey||req.headers.get('x-uor-internal-key')!==internalKey)return json({ok:false,error:'Internal key inválida.'},403);const uid=req.headers.get('x-uor-user');const result=await this.finalizeAbandonment(uid,'manual');if(!result.ok)return json({ok:false,error:result.error},result.status||409);return json({ok:true,nick:result.nick,suspension:result.suspension,room:await this.roomForPublic()});}
  if(path.endsWith('/internal/init')){const b=await body(req);this.room={...b,hostConnId:b.hostConnId||b.players?.[0]?.id||null};await this.persist();await this.scheduleAutomationAlarm();return json({ok:true});}
  if(path.endsWith('/internal/join')){if(this.game)return json({ok:false,error:'A partida já começou.'},409);const b=await body(req),uid=b.userId;if(!this.room)return json({ok:false,error:'Sala inexistente.'},404);if(this.room.players.some(p=>p.id===uid))return json({ok:true,room:await this.roomForPublic(),assignedColor:this.room.players.find(p=>p.id===uid).color});if(this.room.players.length>=this.room.maxPlayers)return json({ok:false,error:'Sala cheia, general.'},409);const used=this.room.players.map(p=>p.color),color=COLORS.includes(b.color)&&!used.includes(b.color)?b.color:COLORS.find(c=>!used.includes(c))||COLORS[0];this.room.players.push({id:uid,connId:uid,name:String(b.name||'General').slice(0,24),color,rankId:String(b.rankId||'soldado'),role:normalizeRole(b.role),ready:false,eliminated:false});await this.persist();this.broadcast({type:'room_state',room:await this.roomForPublic()});return json({ok:true,room:await this.roomForPublic(),assignedColor:color});}
  if(path.endsWith('/internal/leave')){const uid=req.headers.get('x-uor-user');if(this.game&&!this.game.winner)return json({ok:false,error:'Uma partida em andamento deve ser abandonada explicitamente.'},409);if(!this.room)return json({ok:true,deleted:true});this.sockets.get(uid)?.close(1000,'leave');this.sockets.delete(uid);this.room.players=this.room.players.filter(p=>p.id!==uid);if(!this.room.players.length){this.room=null;this.game=null;await this.persist();return json({ok:true,deleted:true});}if(this.room.hostConnId===uid)this.room.hostConnId=this.room.players[0].id;if(this.game)this.game.players.find(p=>p.id===uid)&&(this.game.players.find(p=>p.id===uid).eliminated=true);await this.persist();this.broadcast({type:'room_state',room:await this.roomForPublic()});return json({ok:true,room:await this.roomForPublic()});}
  if(path==='/ws' || path.startsWith('/ws')){if(req.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});const uid=req.headers.get('x-uor-user');if(!uid||!this.room)return new Response('Unauthorized',{status:401});await this.processDisconnectDeadlines();const isSpectator=req.headers.get('x-uor-spectator')==='1';if(isSpectator){const u=await this.env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(uid).first();if(!u||!isStaffOrAdmin(u))return new Response('Acesso de espectador permitido apenas para STAFF/ADMIN.',{status:403});if(this.game?.players?.some(p=>p.id===uid||p.connId===uid))return new Response('Este cargo já participa desta partida.',{status:409});if(this.sockets.has(uid)&&!this.spectators.has(uid))return new Response('Conta já conectada como jogador nesta sala.',{status:409});this.spectators.add(uid);}else{const suspension=await getActiveSuspension(this.env,uid);if(suspension)return new Response(`Você está suspenso por deserção. Tempo restante: ${Math.max(1,Math.ceil(suspension.remainingMs/60000))} minuto(s).`,{status:403});const isRoomPlayer=!!this.room?.players?.some(p=>p.id===uid||p.connId===uid);const gp=this.game?.players?.find(p=>p.id===uid||p.connId===uid);if(!isRoomPlayer)return new Response(gp?.abandoned?'Esta partida foi abandonada por você e não aceita reconexão.':'Você não participa desta sala.',{status:403});if(this.game&&(this.game.winner||gp?.eliminated||gp?.abandoned))return new Response('Esta partida não aceita reconexão para este general.',{status:409});if(this.sockets.has(uid)&&!this.spectators.has(uid)){try{this.sockets.get(uid).close(4000,'replaced')}catch{}this.sockets.delete(uid);}this.spectators.delete(uid);if(gp){gp.connected=true;gp.disconnectAt=null;gp.reconnectUntil=null;gp.aiControlled=false;gp.reconnectedAt=now();}}
    const publicRoom=await this.roomForPublic();const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();this.sockets.set(uid,server);server.addEventListener('message',e=>this.onMessage(uid,server,e));server.addEventListener('close',()=>this.onClose(uid,server));server.send(JSON.stringify({type:'room_state',room:publicRoom}));if(this.game){const state=isSpectator?this.publicGameStateForSpectator(this.game):this.game;server.send(JSON.stringify(isSpectator?{type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state}}:{type:'game_state_sync',state}));}await this.persist();if(this.game){this.broadcast({type:'game_state_sync',state:this.game});}await this.scheduleAutomationAlarm();return new Response(null,{status:101,webSocket:client});}
  return json({ok:false,error:'Not found'},404);
 }
 async onClose(uid,ws){if(this.sockets.get(uid)!==ws)return;this.sockets.delete(uid);if(this.spectators.has(uid)){this.spectators.delete(uid);return;}if(!this.room)return;if(!this.game){this.room.players=this.room.players.filter(p=>p.id!==uid);if(!this.room.players.length){const rid=this.room.id;this.room=null;await this.persist();await this.env.DB.prepare('DELETE FROM rooms WHERE id=?').bind(rid).run();return;}if(this.room.hostConnId===uid)this.room.hostConnId=this.room.players[0].id;await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'room_state',room:await this.roomForPublic()});return;}const p=this.game.players.find(x=>x.id===uid);if(!p||p.eliminated||p.abandoned)return;p.connected=false;p.disconnectAt=now();p.reconnectUntil=p.disconnectAt+DISCONNECT_GRACE_MS;p.aiControlled=true;this.game.log.push(`🔴 ${p.name} ficou desconectado. 🤖 IA controlando por 10 minutos.`);if(this.game.hostConnId===uid){const next=this.game.players.find(x=>!x.eliminated&&!x.abandoned&&(x.connected||this.sockets.has(x.id)))||this.game.players.find(x=>!x.eliminated&&!x.abandoned&&x.id!==uid);if(next){this.game.hostConnId=next.id;this.room.hostConnId=next.id;this.game.log.push(`${next.name} assumiu o comando da batalha.`);}}await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'room_state',room:await this.roomForPublic()});this.broadcast({type:'game_state_sync',state:this.game});await this.scheduleAutomationAlarm();}
 async resolveAirAttack(){
  if(!this.game?.airAttackPending)return false;
  const resolved=finalizeAirAttack(this.game);
  if(!resolved)return false;
  this.game.winner=checkWinner(this.game);
  if(this.game.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);
  await this.persist();
  this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});
  return true;
 }
 async alarm(){
  await this.processDisconnectDeadlines();
  await this.resolveAirAttack();
  await this.runEmergencyAI();
  await this.processDisconnectDeadlines();
  await this.scheduleAutomationAlarm();
 }
 async onMessage(uid,ws,e){let m;try{m=JSON.parse(e.data)}catch{return}if(!m?.type)return;const isSpectator=this.spectators.has(uid);if(isSpectator&&m.type!=='sync_request'&&m.type!=='game_chat'){ws.send(JSON.stringify({type:'room_relay',roomId:this.room?.id,payload:{type:'spectator_action_rejected',reason:'Modo espectador: ações de jogo estão bloqueadas.'}}));return;}if(m.type==='sync_request'){if(this.game){normalizeObjectives(this.game);if(this.game.phase==='reforco'&&(!Object.prototype.hasOwnProperty.call(this.game,'continentBonusRemaining')||!Object.prototype.hasOwnProperty.call(this.game,'reinforcementStage'))){const cp=this.game.players?.[this.game.turnIndex];if(cp)beginReinforcementPhase(this.game,cp.id);}await this.persist();ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:isSpectator?this.publicGameStateForSpectator(this.game):this.game}}));}else if(this.room)ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'room_state',room:await this.roomForPublic()}}));return;}if(m.type==='room_chat'){const muted=await getActiveMute(this.env,uid);if(muted){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'chat_rejected',reason:`Você está silenciado por mais ${Math.max(1,Math.ceil((muted.expiresAt-now())/60000))} minuto(s).`}}));return;}const rp=this.room.players.find(p=>p.id===uid);const entry={name:rp?.name||'General',color:rp?.color||COLORS[0],rankId:rp?.rankId||'soldado',role:normalizeRole(rp?.role),text:String(m.entry?.text||'').trim().slice(0,400),ts:now()};if(!entry.text)return;this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'room_chat',entry}});return;}
  if(m.type==='game_chat'){if(!this.game)return;const muted=await getActiveMute(this.env,uid);if(muted){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'chat_rejected',reason:`Você está silenciado por mais ${Math.max(1,Math.ceil((muted.expiresAt-now())/60000))} minuto(s).`}}));return;}const text=String(m.entry?.text||'').trim().slice(0,400);if(!text)return;if(isSpectator){const u=await this.env.DB.prepare('SELECT u.id,u.nick,u.role,s.points FROM users u JOIN user_stats s ON s.user_id=u.id WHERE u.id=?').bind(uid).first();if(!u||!isStaffOrAdmin(u))return;const entry={name:u.nick,color:COLORS[0],rankId:rankFor(Number(u.points||0)).id,role:normalizeRole(u.role),text,ts:now(),spectator:true};this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_chat',entry}});return;}const p=this.game.players.find(x=>x.id===uid);if(!p||p.eliminated)return;const entry={name:p.name,color:p.color,rankId:p.rankId||'soldado',role:normalizeRole(p.role),text,ts:now()};this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_chat',entry}});return;}
  if(m.type==='room_ready'){if(this.game||!this.room||uid===this.room.hostConnId)return;const p=this.room.players.find(x=>x.id===uid);if(!p)return;p.ready=!p.ready;await this.persist();this.broadcast({type:'room_state',room:await this.roomForPublic()});await syncRoomRow(this.env,this.room.id,await this.roomForPublic());return;}
  if(m.type==='start_game'){const othersReady=this.room?.players?.length>=2&&this.room.players.filter(p=>p.id!==this.room.hostConnId).every(p=>p.ready===true);if(uid!==this.room.hostConnId||!othersReady||this.game)return;this.game=initGame(this.room);this.room.gameActive=true;await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_start',state:this.game}});return;}
  if(m.type==='air_attack_request'){if(!this.game)return;const a={...(m.action||{}),byConnId:uid};const next=applyAction(this.game,a);if(!next){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'Ataque aéreo recusado pelo servidor.'}}));return;}this.game=next;const resolveDelay=Math.max(4000,Math.min(16000,Number(a.visualImpactMs)||6000));const pendingRef=this.game.airAttackPending;pendingRef.resolveAt=Date.now()+resolveDelay;await this.persist();const visualTs=now();this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'air_attack_visual',action:a,ts:visualTs}});this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});
   const resolvePromise=new Promise(resolve=>setTimeout(resolve,resolveDelay)).then(async()=>{if(this.game?.airAttackPending!==pendingRef)return;await this.resolveAirAttack();});
   if(typeof this.state.waitUntil==='function')this.state.waitUntil(resolvePromise);
   try{await this.state.storage.setAlarm(pendingRef.resolveAt);}catch{}
   return;}
  if(m.type==='game_action'){if(!this.game)return;const a={...(m.action||{}),byConnId:uid};const next=applyAction(this.game,a);if(!next){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'Ação recusada pelo servidor. Confira a fase, o alvo e aguarde a sincronização.'}}));return;}this.game=next;this.game.winner=checkWinner(this.game);if(this.game.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);await this.persist();this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});await this.scheduleAutomationAlarm();}
 }
}

async function route(req,env){try{return await routeInner(req,env);}catch(e){return json({ok:false,error:'Erro interno do servidor.',detail:String(e?.message||e)},500);}}
async function routeInner(req,env){const url=new URL(req.url),p=url.pathname;if(p==='/api/admin/bootstrap-role'&&req.method==='POST')return apiAdminBootstrapRole(req,env);if(p==='/api/auth/me')return apiAuthMe(req,env);if(p==='/api/auth/register'&&req.method==='POST')return apiAuthRegister(req,env);if(p==='/api/auth/login'&&req.method==='POST')return apiAuthLogin(req,env);if(p==='/api/auth/logout'&&req.method==='POST')return apiAuthLogout(req,env);const user=await authUser(req,env);if(!user)return json({ok:false,error:'Faça login para continuar.'},401);
 if(p==='/api/profile')return apiProfile(req,env,user);if(p==='/api/public-profile')return apiPublicProfile(req,env,user.id);if(p==='/api/public-roles'&&req.method==='GET')return apiPublicRoles(req,env,user);if(p==='/api/ranking')return apiRanking(req,env);if(p==='/api/history')return apiHistory(req,env,user);if(p==='/api/public-history')return apiPublicHistory(req,env,user.id);if(p==='/api/chat')return apiChat(req,env,user);if(p==='/api/moderation/mute'&&req.method==='POST')return apiModerationMute(req,env,user);if(p==='/api/moderation/unmute'&&req.method==='POST')return apiModerationUnmute(req,env,user);if(p==='/api/moderation/status'&&req.method==='GET')return apiModerationStatus(req,env,user);if(p==='/api/admin/users'&&req.method==='GET')return apiAdminUsers(req,env,user);if(p==='/api/admin/role'&&req.method==='POST')return apiAdminSetRole(req,env,user);if(p==='/api/admin/suspensions'&&req.method==='GET')return apiAdminSuspensions(req,env,user);if(p==='/api/admin/suspensions/remove'&&req.method==='POST')return apiAdminRemoveSuspension(req,env,user);if(p==='/api/rooms/reconnect'&&req.method==='GET')return apiReconnectRoom(req,env,user);if(p==='/api/rooms'&&req.method==='GET')return apiRooms(req,env);if(p==='/api/rooms'&&req.method==='POST')return apiCreateRoom(req,env,user);let m=p.match(/^\/api\/rooms\/([^/]+)\/(join|leave|abandon)$/);if(m&&req.method==='POST'){if(m[2]==='join')return apiJoinRoom(req,env,user,m[1]);if(m[2]==='abandon')return apiAbandonRoom(req,env,user,m[1]);return apiLeaveRoom(req,env,user,m[1]);}return json({ok:false,error:'Endpoint não encontrado.'},404);}

export default {async fetch(req,env,ctx){const url=new URL(req.url);if(url.pathname==='/ws/lobby'){const user=await authUser(req,env);if(!user)return new Response('Unauthorized',{status:401});const d=await getRoomDO(env,'__uor_lobby_presence__');const headers=new Headers(req.headers);headers.set('x-uor-user',user.id);headers.set('x-uor-name',user.nick);headers.set('x-uor-color',COLORS[0]);return d.fetch(new Request(req,{headers}));}if(url.pathname.startsWith('/ws/rooms/')){const user=await authUser(req,env);if(!user)return new Response('Unauthorized',{status:401});const id=decodeURIComponent(url.pathname.split('/').pop());const d=await getRoomDO(env,id);const headers=new Headers(req.headers);headers.set('x-uor-user',user.id);const spectator=new URL(req.url).searchParams.get('spectator')==='1';if(spectator){if(!isStaffOrAdmin(user))return new Response('Apenas STAFF/ADMIN pode assistir partidas.',{status:403});if(req.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});headers.set('x-uor-spectator','1');}return d.fetch(new Request(req,{headers}));}if(url.pathname.startsWith('/api/'))return route(req,env);return env.ASSETS.fetch(req);}};
