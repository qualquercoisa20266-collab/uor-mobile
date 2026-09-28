const GAME_VERSION = '2.2';
const RECONNECT_GRACE_MS = 5*60*1000;
const CONNECTION_WATCHDOG_MS = 15000;
const HEARTBEAT_ALARM_MS = 7000;
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
      await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_kicks (user_id TEXT PRIMARY KEY, kicked_by TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL DEFAULT 0, duration_minutes INTEGER NOT NULL DEFAULT 0)`).run();
      await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_user_kicks_expires ON user_kicks(expires_at)').run();
      try{await env.DB.prepare('SELECT system FROM chat_messages LIMIT 1').first();}
      catch{try{await env.DB.prepare('ALTER TABLE chat_messages ADD COLUMN system INTEGER NOT NULL DEFAULT 0').run();}catch(e){if(!String(e?.message||e).toLowerCase().includes('duplicate column'))throw e;}}
      await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_user_mutes_expires ON user_mutes(expires_at)').run();
    })().catch(e=>{moderationSchemaPromise=null;throw e;});
  }
  return moderationSchemaPromise;
}
async function ensureDesertionSchema(env){
  await ensureModerationSchema(env);
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_suspensions (user_id TEXT PRIMARY KEY, reason TEXT NOT NULL, created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL, level INTEGER NOT NULL DEFAULT 1)`).run();
  await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_user_suspensions_expires ON user_suspensions(expires_at)').run();
}
async function getActiveSuspension(env,userId){
  await ensureDesertionSchema(env);
  const row=await env.DB.prepare('SELECT user_id,reason,created_at,expires_at,level FROM user_suspensions WHERE user_id=?').bind(userId).first();
  if(!row)return null;
  if(Number(row.expires_at)<=now()){await env.DB.prepare('DELETE FROM user_suspensions WHERE user_id=?').bind(userId).run();return null;}
  return {userId:row.user_id,reason:row.reason,createdAt:Number(row.created_at),expiresAt:Number(row.expires_at),level:Number(row.level||1)};
}
async function applyDesertionSuspension(env,userId){
  await ensureDesertionSchema(env);
  const st=await env.DB.prepare('SELECT abandons FROM user_stats WHERE user_id=?').bind(userId).first();
  const prior=Number(st?.abandons||0);
  const level=prior+1;
  const hours=level===1?1:(level===2?2:6);
  const ts=now(),expires=ts+hours*60*60*1000;
  await env.DB.prepare('INSERT OR REPLACE INTO user_suspensions(user_id,reason,created_at,expires_at,level) VALUES(?,?,?,?,?)').bind(userId,'deserção',ts,expires,level).run();
  return {level,expiresAt:expires,hours};
}
function normalizeRole(role){const r=String(role||'PLAYER').toUpperCase();return r==='ADMIN'||r==='STAFF'?r:'PLAYER';}
function isStaffOrAdmin(user){return user?.role==='STAFF'||user?.role==='ADMIN';}
function isAdmin(user){return user?.role==='ADMIN';}
async function getActiveMute(env,userId){
  await ensureModerationSchema(env);
  const row=await env.DB.prepare('SELECT user_id,muted_by,created_at,expires_at FROM user_mutes WHERE user_id=?').bind(userId).first();
  if(!row)return null;
  if(Number(row.expires_at)<=now()){await env.DB.prepare('DELETE FROM user_mutes WHERE user_id=?').bind(userId).run();return null;}
  return {userId:row.user_id,mutedBy:row.muted_by,createdAt:Number(row.created_at),expiresAt:Number(row.expires_at)};
}
async function getActiveKick(env,userId){
  await ensureModerationSchema(env);
  const row=await env.DB.prepare(`SELECT k.user_id,k.kicked_by,k.created_at,k.expires_at,k.duration_minutes,u.nick AS actor_nick,u.role AS actor_role FROM user_kicks k LEFT JOIN users u ON u.id=k.kicked_by WHERE k.user_id=?`).bind(userId).first();
  if(!row)return null;
  const exp=Number(row.expires_at||0);
  if(exp<=0)return null;
  if(exp<=now()){await env.DB.prepare('DELETE FROM user_kicks WHERE user_id=?').bind(userId).run();return null;}
  return {userId:row.user_id,kickedBy:row.kicked_by,actorNick:row.actor_nick||'membro da equipe',actorRole:normalizeRole(row.actor_role),createdAt:Number(row.created_at||0),expiresAt:exp,durationMinutes:Number(row.duration_minutes||0)};
}
function formatMsClock(ms){
  let sec=Math.max(0,Math.ceil(Number(ms||0)/1000));
  const h=Math.floor(sec/3600);sec%=3600;
  const m=Math.floor(sec/60);sec%=60;
  return h>0?`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
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
async function apiAuthLogin(req,env){await ensureModerationSchema(env);const b=await body(req),login=String(b.login||'').trim().toLowerCase(),password=String(b.password||'');if(!validLogin(login))return json({ok:false,error:'Login inválido.'},400);if(await rateBlocked(env,login))return json({ok:false,error:'Muitas tentativas. Aguarde 15 minutos.'},429);const u=await env.DB.prepare('SELECT * FROM users WHERE login=?').bind(login).first();if(!u){await logAttempt(env,login,false);return json({ok:false,error:'Login ou senha incorretos.'},401);}const ph=await hashPassword(password,u.password_salt);if(ph!==u.password_hash){await logAttempt(env,login,false);return json({ok:false,error:'Login ou senha incorretos.'},401);}const kick=await getActiveKick(env,u.id);if(kick){const remaining=formatMsClock(kick.expiresAt-now());return json({ok:false,code:'KICKED',error:`Você foi removido da sessão por ${kick.actorRole} ${kick.actorNick}. Kick temporário de ${kick.durationMinutes} min. Você poderá retornar em ${remaining}.`,kickUntil:kick.expiresAt,remainingMs:Math.max(0,kick.expiresAt-now())},403);}await logAttempt(env,login,true);await env.DB.prepare('DELETE FROM sessions WHERE user_id=? AND expires_at<?').bind(u.id,now()).run();await env.DB.prepare('UPDATE users SET last_login_at=? WHERE id=?').bind(now(),u.id).run();const token=await createSession(env,u.id);return json({ok:true,user:{id:u.id,nick:u.nick,login:u.login,role:normalizeRole(u.role)}},200,{'set-cookie':cookie(COOKIE,token)});}
async function apiAuthMe(req,env){const u=await authUser(req,env);return u?json({ok:true,user:{id:u.id,nick:u.nick,login:u.login,role:normalizeRole(u.role)}}):json({ok:false,error:'Não autenticado.'},401);}
async function apiAuthLogout(req,env){const token=parseCookie(req,COOKIE);if(token){const th=await sha256(token);await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(th).run();}return json({ok:true},200,{'set-cookie':clearCookie(COOKIE)});}

async function getRoomDO(env,id){return env.UOR_ROOM.get(env.UOR_ROOM.idFromName(id));}
async function apiRooms(req,env){const staleBefore=now()-30*60*1000;await env.DB.prepare('DELETE FROM rooms WHERE game_active=0 AND updated_at<?').bind(staleBefore).run();const rows=await env.DB.prepare('SELECT id,name,max_players,host_user_id,players_json,game_active,updated_at,created_at FROM rooms ORDER BY updated_at DESC LIMIT 100').all();return json({ok:true,rooms:(rows.results||[]).map(roomPublic)});}
function roomPublic(r){let players=[];try{players=JSON.parse(r.players_json||'[]')}catch{}return {id:r.id,name:r.name,maxPlayers:r.max_players,hostConnId:r.host_user_id,players,gameActive:!!r.game_active,updatedAt:r.updated_at,createdAt:r.created_at};}
async function apiCreateRoom(req,env,user){const suspension=await getActiveSuspension(env,user.id);if(suspension)return json({ok:false,error:`Você está suspenso por deserção até ${new Date(suspension.expiresAt).toLocaleString('pt-BR')}.`},403);const b=await body(req),color=COLORS.includes(b.color)?b.color:COLORS[0],name=`Sala do General ${user.nick} — ${COLOR_LABELS[color]||color}`,max=6;const existing=await env.DB.prepare('SELECT id FROM rooms WHERE players_json LIKE ?').bind(`%${user.id}%`).first();if(existing)return json({ok:false,error:'Você já está em uma sala.'},409);const st=await env.DB.prepare('SELECT points FROM user_stats WHERE user_id=?').bind(user.id).first();const rankId=rankFor(Number(st?.points||0)).id;const id=uuid(),ts=now(),player={id:user.id,connId:user.id,name:user.nick,color,rankId,role:normalizeRole(user.role),ready:true,eliminated:false};await env.DB.prepare('INSERT INTO rooms(id,name,max_players,host_user_id,players_json,updated_at,created_at) VALUES(?,?,?,?,?,?,?)').bind(id,name,max,user.id,JSON.stringify([player]),ts,ts).run();const d=await getRoomDO(env,id);await d.fetch(new Request('https://uor-room/internal/init',{method:'POST',headers:{'content-type':'application/json','x-uor-user':user.id},body:JSON.stringify({id,name,maxPlayers:max,hostConnId:user.id,players:[player]})}));return json({ok:true,room:{id,name,maxPlayers:max,hostConnId:user.id,players:[player],gameActive:false,updatedAt:ts}});}
async function apiJoinRoom(req,env,user,roomId){const suspension=await getActiveSuspension(env,user.id);if(suspension)return json({ok:false,error:`Você está suspenso por deserção até ${new Date(suspension.expiresAt).toLocaleString('pt-BR')}.`},403);const b=await body(req),color=COLORS.includes(b.color)?b.color:COLORS[0],st=await env.DB.prepare('SELECT points FROM user_stats WHERE user_id=?').bind(user.id).first(),rankId=rankFor(Number(st?.points||0)).id,d=await getRoomDO(env,roomId);const r=await d.fetch(new Request('https://uor-room/internal/join',{method:'POST',headers:{'content-type':'application/json','x-uor-user':user.id},body:JSON.stringify({userId:user.id,name:user.nick,color,rankId,role:normalizeRole(user.role)})}));if(!r.ok)return r;const data=await r.json();await syncRoomRow(env,roomId,data.room);return json({ok:true,room:data.room,assignedColor:data.assignedColor||color});}
async function apiActiveMatch(req,env,user){
  const rows=await env.DB.prepare('SELECT id,name,max_players,host_user_id,players_json,game_active,updated_at,created_at FROM rooms WHERE game_active=1 ORDER BY updated_at DESC LIMIT 100').all();
  for(const r of rows.results||[]){let players=[];try{players=JSON.parse(r.players_json||'[]')}catch{};if(!players.some(p=>p.id===user.id))continue;const d=await getRoomDO(env,r.id);const rr=await d.fetch(new Request('https://uor-room/internal/status',{method:'POST',headers:internalHeaders(env,user.id),body:'{}'}));if(!rr.ok)continue;const data=await rr.json();if(data.active&&data.player&&!data.player.abandoned)return json({ok:true,match:data});}
  return json({ok:true,match:null});
}
async function apiReconnectRoom(req,env,user,roomId){
  const suspension=await getActiveSuspension(env,user.id);if(suspension)return json({ok:false,error:`Você está suspenso por deserção até ${new Date(suspension.expiresAt).toLocaleString('pt-BR')}.`},403);
  const d=await getRoomDO(env,roomId);
  const r=await d.fetch(new Request('https://uor-room/internal/reconnect',{method:'POST',headers:internalHeaders(env,user.id),body:'{}'}));
  if(!r.ok)return r;
  const data=await r.json();
  if(data.room)await syncRoomRow(env,roomId,data.room);
  return json({ok:true,room:data.room,state:data.state});
}
async function apiLeaveRoom(req,env,user,roomId){const d=await getRoomDO(env,roomId);const r=await d.fetch(new Request('https://uor-room/internal/leave',{method:'POST',headers:internalHeaders(env,user.id),body:'{}'}));if(!r.ok)return r;const data=await r.json();if(data.deleted){await env.DB.prepare('DELETE FROM rooms WHERE id=?').bind(roomId).run();}else if(data.room)await syncRoomRow(env,roomId,data.room);return json({ok:true,abandoned:!!data.abandoned,suspension:data.suspension||null});}
async function syncRoomRow(env,roomId,room){await env.DB.prepare('UPDATE rooms SET name=?,max_players=?,host_user_id=?,players_json=?,game_active=?,updated_at=? WHERE id=?').bind(room.name||'Sala',room.maxPlayers||4,room.hostConnId||room.players?.[0]?.id||null,JSON.stringify(room.players||[]),room.gameActive?1:0,now(),roomId).run();}
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
async function apiModerationKick(req,env,user){
  if(!isStaffOrAdmin(user))return json({ok:false,error:'Sem permissão.'},403);
  const b=await body(req),targetId=String(b.userId||'').trim();
  if(!targetId||targetId===user.id)return json({ok:false,error:'Jogador inválido.'},400);
  await ensureModerationSchema(env);
  const target=await env.DB.prepare('SELECT id,nick,role FROM users WHERE id=?').bind(targetId).first();
  if(!target)return json({ok:false,error:'Jogador não encontrado.'},404);
  if(target.role==='ADMIN'&&user.role!=='ADMIN')return json({ok:false,error:'STAFF não pode expulsar uma conta ADMIN.'},403);
  const allowed=[0,5,10,20,30];
  const minutes=allowed.includes(Number(b.minutes))?Number(b.minutes):0;
  const ts=now(),expires=minutes>0?ts+minutes*60*1000:0;
  if(minutes>0){
    await env.DB.prepare('INSERT INTO user_kicks(user_id,kicked_by,created_at,expires_at,duration_minutes) VALUES(?,?,?,?,?) ON CONFLICT(user_id) DO UPDATE SET kicked_by=excluded.kicked_by,created_at=excluded.created_at,expires_at=excluded.expires_at,duration_minutes=excluded.duration_minutes').bind(targetId,user.id,ts,expires,minutes).run();
  }else{
    await env.DB.prepare('DELETE FROM user_kicks WHERE user_id=?').bind(targetId).run();
  }
  await env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(targetId).run();
  const actorLabel=`${user.role} ${user.nick}`;
  const text=minutes>0?`⏱ ${target.nick} recebeu Kick de ${minutes} minutos por ${actorLabel}.`:`👢 ${target.nick} foi removido da sessão por ${actorLabel}.`;
  const system=await addGlobalSystemMessage(env,text,user);
  let delivered=0;
  const rooms=await env.DB.prepare('SELECT id FROM rooms WHERE players_json LIKE ? LIMIT 50').bind(`%${targetId}%`).all();
  for(const r of rooms.results||[]){try{const d=await getRoomDO(env,r.id);const rr=await d.fetch(new Request('https://uor-room/internal/kick',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({targetId,targetNick:target.nick,actorNick:user.nick,actorRole:user.role,minutes,expiresAt:expires})}));if(rr.ok){const x=await rr.json();delivered+=Number(x.delivered||0);}}catch{}}
  try{const d=await getRoomDO(env,'__uor_lobby_presence__');const rr=await d.fetch(new Request('https://uor-room/internal/kick',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({targetId,targetNick:target.nick,actorNick:user.nick,actorRole:user.role,minutes,expiresAt:expires})}));if(rr.ok){const x=await rr.json();delivered+=Number(x.delivered||0);}}catch{}
  return json({ok:true,userId:targetId,nick:target.nick,minutes,kickUntil:expires,system,delivered});
}
async function apiModerationStatus(req,env,user){
  if(!isStaffOrAdmin(user))return json({ok:false,error:'Sem permissão.'},403);
  const url=new URL(req.url),targetId=String(url.searchParams.get('userId')||'').trim();if(!targetId)return json({ok:false,error:'Jogador inválido.'},400);
  const target=await env.DB.prepare('SELECT id,nick,role FROM users WHERE id=?').bind(targetId).first();if(!target)return json({ok:false,error:'Jogador não encontrado.'},404);
  const mute=await getActiveMute(env,targetId);return json({ok:true,user:{id:target.id,nick:target.nick,role:normalizeRole(target.role)},muted:!!mute,mutedUntil:mute?.expiresAt||null});
}
async function apiAdminUsers(req,env,user){
  if(!isAdmin(user))return json({ok:false,error:'Somente ADMIN pode gerenciar cargos.'},403);
  await ensureDesertionSchema(env);
  const url=new URL(req.url),q=String(url.searchParams.get('q')||'').trim().toLowerCase(),limit=Math.max(1,Math.min(100,Number(url.searchParams.get('limit')||100))),ts=now();
  const sql=`SELECT u.id,u.nick,u.login,u.role,u.created_at,u.last_login_at,us.expires_at AS suspension_expires_at,us.level AS suspension_level FROM users u LEFT JOIN user_suspensions us ON us.user_id=u.id AND us.expires_at>? WHERE ${q?'(lower(u.nick) LIKE ? OR lower(u.login) LIKE ?)':'1=1'} ORDER BY u.nick COLLATE NOCASE LIMIT ?`;
  const rows=q?await env.DB.prepare(sql).bind(ts,`%${q}%`,`%${q}%`,limit).all():await env.DB.prepare(sql).bind(ts,limit).all();
  return json({ok:true,users:(rows.results||[]).map(x=>({id:x.id,nick:x.nick,login:x.login,role:normalizeRole(x.role),createdAt:Number(x.created_at||0),lastLoginAt:Number(x.last_login_at||0),suspendedUntil:Number(x.suspension_expires_at||0),suspensionLevel:Number(x.suspension_level||0)}))});
}
async function apiAdminRemoveSuspension(req,env,user){
  if(!isAdmin(user))return json({ok:false,error:'Somente ADMIN pode remover suspensões.'},403);
  await ensureDesertionSchema(env);
  const b=await body(req),targetId=String(b.userId||'').trim();
  if(!targetId||targetId===user.id)return json({ok:false,error:'Jogador inválido.'},400);
  const target=await env.DB.prepare('SELECT id,nick FROM users WHERE id=?').bind(targetId).first();
  if(!target)return json({ok:false,error:'Conta não encontrada.'},404);
  await env.DB.prepare('DELETE FROM user_suspensions WHERE user_id=?').bind(targetId).run();
  return json({ok:true,user:{id:target.id,nick:target.nick},suspensionRemoved:true});
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
function initGame(room){const players=room.players.map(p=>({...p,id:p.id,connId:p.id,eliminated:false,conqueredThisTurn:false}));const ids=shuffle(TERRITORIES.map(t=>t.id));const terr={};ids.forEach((tid,i)=>terr[tid]={owner:players[i%players.length].id,armies:1});const setup={};const start=STARTING_ARMIES[players.length]||20;for(const p of players){const owned=Object.values(terr).filter(x=>x.owner===p.id).length;setup[p.id]=Math.max(0,start-owned);}const objectivePool=stateSafeObjectivePool(players);const objectiveDeck=shuffle(objectivePool.slice());const objectives={};players.forEach((p,i)=>objectives[p.id]=makeObjective({players},p,[objectiveDeck[i%objectiveDeck.length]]));const state={version:GAME_VERSION,roomId:room.id,roomName:room.name,maxPlayers:room.maxPlayers,hostConnId:room.hostConnId,players,territories:terr,turnIndex:0,turnNumber:1,phase:'setup',setupRemaining:setup,reinforcementsRemaining:0,reinforcementStage:'free',continentBonusRemaining:{},pendingFreeReinforcements:0,objectives,deck:[],discardPile:[],hands:{},airAttackCards:{},airAttackPending:null,cardTradeCount:0,usedFortifyTerritories:[],fortifyLockedTerritories:[],pendingConquestTransfer:null,lastAttackAt:{},lastCombat:null,playerStats:Object.fromEntries(players.map(p=>[p.id,{conquests:0,armiesDestroyed:0}])),log:['Distribuição inicial iniciada.'],winner:null,resultRecorded:false,startedAt:now(),updatedAt:now()};for(const p of players)state.hands[p.id]=[];state.deck=shuffle(TERRITORIES.map(t=>({id:`card_${t.id}`,territoryId:t.id,name:t.name,symbol:null})));return state;}
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
  const totalAvailable=fromIds.reduce((sum,id)=>sum+Math.max(0,(t[id]?.armies||0)-1),0);
  if(totalAvailable<1)return null;
  const dice=Math.min(3,totalAvailable);
  const defDice=Math.min(3,target.armies);if(defDice<1)return null;
  state.lastAttackAt[p.id]=now();
  const atkRolls=roll(dice).sort((x,y)=>y-x),defRolls=roll(defDice).sort((x,y)=>y-x);
  let atkLoss=0,defLoss=0;
  for(let i=0;i<Math.min(atkRolls.length,defRolls.length);i++){if(atkRolls[i]>defRolls[i])defLoss++;else atkLoss++;}
  const atkLossBySource={};let remainingLoss=atkLoss;
  for(const fromId of fromIds){
    const from=t[fromId],capacity=Math.max(0,(from.armies||0)-1),loss=Math.min(capacity,remainingLoss);
    if(loss>0)from.armies-=loss;atkLossBySource[fromId]=loss;remainingLoss-=loss;if(remainingLoss<=0)break;
  }
  if(remainingLoss>0)return null;
  const before=target.armies,after=Math.max(0,before-defLoss),conquered=after===0;target.armies=conquered?0:Math.max(1,after);
  state.playerStats[p.id].armiesDestroyed+=defLoss;
  if(conquered){state.playerStats[p.id].conquests++;target.owner=p.id;target.armies=0;p.conqueredThisTurn=true;state.pendingConquestTransfer={fromId:fromIds[0],fromIds,toId:targetId,maxTransfer:dice};}
  const combat={fromId:fromIds[0],fromIds,toId:targetId,atkRolls,defRolls,atkLoss,defLoss,atkLossBySource,conquered,dice,unitedAttack:true,ts:now()};
  state.lastUnitedCombats=[combat];state.lastCombat=combat;
  state.log.push(`${p.name} realizou um Ataque Unido contra ${T[targetId].name} com ${fromIds.length} país(es): ${fromIds.map(id=>T[id].name).join(', ')}${conquered?' — território conquistado!':''}`);
  checkElims(state);return state;
 }
 if(a.kind==='conquestTransfer'){
  if(state.phase!=='ataque')return null;const q=state.pendingConquestTransfer;if(!q||q.fromId!==a.fromId||q.toId!==a.toId)return null;
  const to=t[q.toId];if(!to||to.owner!==p.id)return null;
  const sourceIds=Array.isArray(q.fromIds)&&q.fromIds.length?[...new Set(q.fromIds)]:[q.fromId];if(sourceIds[0]!==q.fromId)return null;
  for(const id of sourceIds){const from=t[id];if(!from||from.owner!==p.id)return null;}
  const totalAvailable=sourceIds.reduce((sum,id)=>sum+Math.max(0,(t[id].armies||0)-1),0);
  const max=Math.min(3,Number(q.maxTransfer)||1,totalAvailable);const requested=Number(a.amount);if(!Number.isFinite(requested)||requested<1||max<1)return null;
  const n=Math.max(1,Math.min(Math.floor(requested),max));let remaining=n;const distribution={};
  for(const id of sourceIds){const from=t[id],capacity=Math.max(0,(from.armies||0)-1),take=Math.min(capacity,remaining);if(take>0)from.armies-=take;distribution[id]=take;remaining-=take;if(remaining<=0)break;}
  if(remaining>0)return null;to.armies+=n;state.pendingConquestTransfer=null;state.lastCombat={...(state.lastCombat||{}),conquestTransfer:n,conquestTransferDistribution:distribution,conquestTransferOnly:true,ts:now()};return state;
 }
 if(a.kind==='airAttack'){if(state.phase!=='ataque'||state.pendingConquestTransfer||state.airAttackPending||(state.airAttackCards[p.id]||0)<=0)return null;const to=t[a.toId];if(!to||to.owner===p.id)return null;const last=state.lastAttackAt[p.id]||0;if(now()-last<1000)return null;state.lastAttackAt[p.id]=now();const destroyed=Number(to.armies||0),fromId=TERRITORIES.find(x=>t[x.id].owner===p.id&&x.id!==a.toId)?.id||null;state.airAttackPending={attackerId:p.id,toId:a.toId,fromId,startedAt:now(),destroyed};return state;}
 if(a.kind==='endAttackPhase'){if(state.phase!=='ataque'||state.pendingConquestTransfer)return null;state.phase='fortificacao';state.usedFortifyTerritories=[];state.fortifyLockedTerritories=[];return state;}
 if(a.kind==='fortify'){if(state.phase!=='fortificacao')return null;const from=t[a.fromId],to=t[a.toId];if(!from||!to||from.owner!==p.id||to.owner!==p.id||!adjacent(a.fromId,a.toId)||from.armies<2)return null;const locked=state.fortifyLockedTerritories||[];if(locked.includes(a.fromId))return null;const n=Math.max(1,Math.min(Number(a.amount)||1,from.armies-1));from.armies-=n;to.armies+=n;if(!locked.includes(a.toId))locked.push(a.toId);state.fortifyLockedTerritories=locked;return state;}
 if(a.kind==='endTurn'){if(state.phase!=='fortificacao'&&state.phase!=='ataque')return null;if(state.pendingConquestTransfer)return null;endTurn(state);return state;}
 if(a.kind==='exchangeCards'){if(state.phase!=='reforco')return null;const hand=state.hands[p.id]||[],ids=Array.isArray(a.cardIds)?a.cardIds:[];if(ids.length===1){const card=hand.find(c=>c.id===ids[0]);if(!card||card.symbol!==AIR)return null;if(Number(state.airAttackCards?.[p.id]||0)>=1)return null;state.hands[p.id]=hand.filter(c=>c.id!==card.id);state.airAttackCards[p.id]=1;state.lastCardExchange={by:p.id,cards:[card],reward:0,airAttackCreated:1,ts:now()};state.log.push(`${p.name} guardou um Ataque Aéreo nos Veículos de Combate.`);return state;}if(ids.length!==3||new Set(ids).size!==3)return null;const cards=ids.map(id=>hand.find(c=>c.id===id));if(cards.some(x=>!x)||!validSet(cards)||cards.some(c=>c.symbol===AIR))return null;state.hands[p.id]=hand.filter(c=>!ids.includes(c.id));state.discardPile.push(...cards);const reward=tradeValue(state);state.cardTradeCount++;if((state.reinforcementStage||'free')==='continent')state.pendingFreeReinforcements=(Number(state.pendingFreeReinforcements)||0)+reward;else state.reinforcementsRemaining+=reward;for(const c of cards){if(t[c.territoryId]?.owner===p.id)t[c.territoryId].armies+=2;}state.lastCardExchange={by:p.id,cards,reward,ts:now()};return state;}
 return null;}

async function recordResults(env,state){if(state.resultRecorded||(!state.winner&&!state.annulled))return;state.resultRecorded=true;const ts=now();const winner=state.winner;for(const p of state.players){const result=state.annulled?'annulled':p.abandoned?'abandon':p.id===winner?'win':'loss';const delta=result==='win'?10:result==='abandon'?-6:result==='loss'?-3:0;const st=await env.DB.prepare('SELECT * FROM user_stats WHERE user_id=?').bind(p.id).first();if(!st)continue;let streak=Number(st.win_streak||0),best=Number(st.best_streak||0);streak=result==='win'?streak+1:0;best=Math.max(best,streak);const points=Math.max(0,Number(st.points||0)+delta);const rank=rankFor(points);const gamesAdd=result==='annulled'?0:1,winsAdd=result==='win'?1:0,lossesAdd=result==='loss'?1:0,abandonsAdd=result==='abandon'?1:0;await env.DB.prepare('UPDATE user_stats SET points=?,games=games+?,wins=wins+?,losses=losses+?,abandons=abandons+?,win_streak=?,best_streak=?,total_conquests=total_conquests+?,total_armies_destroyed=total_armies_destroyed+?,total_turns=total_turns+? WHERE user_id=?').bind(points,gamesAdd,winsAdd,lossesAdd,abandonsAdd,streak,best,Number(state.playerStats[p.id]?.conquests||0),Number(state.playerStats[p.id]?.armiesDestroyed||0),Number(state.turnNumber||0),p.id).run();const opponents=state.players.filter(x=>x.id!==p.id).map(x=>x.name);await env.DB.prepare('INSERT INTO match_history(id,user_id,room_id,room_name,result,finished_at,players_count,opponent_names,points_delta,rank_after) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(uuid(),p.id,state.roomId,state.roomName,result,ts,state.players.length,JSON.stringify(opponents),delta,rank.name).run();}
 const checks=await env.DB.prepare('SELECT u.id,s.* FROM user_stats s JOIN users u ON u.id=s.user_id WHERE s.user_id IN ('+state.players.map(()=>'?').join(',')+')').bind(...state.players.map(p=>p.id)).all();for(const s of checks.results||[]){const wins=Number(s.wins),games=Number(s.games),points=Number(s.points),ach=[];if(games>=1)ach.push('first_battle');if(wins>=1)ach.push('first_victory');if(wins>=5)ach.push('five_victories');if(wins>=10)ach.push('ten_victories');if(Number(s.win_streak)>=3)ach.push('streak_three');if(points>=100)ach.push('hundred_points');if(points>=1000)ach.push('thousand_points');if(rankFor(points).id==='marechal')ach.push('marshal');for(const a of ach)await env.DB.prepare('INSERT OR IGNORE INTO user_achievements(user_id,achievement_id,unlocked_at) VALUES(?,?,?)').bind(s.id,a,ts).run();}}

function chooseAiAction(state,pid){
  const p=state.players.find(x=>x.id===pid);if(!p||p.eliminated||!p.aiControlled||state.players[state.turnIndex]?.id!==pid)return null;
  const t=state.territories;
  const owned=id=>t[id]?.owner===pid;
  const ownIds=Object.keys(t).filter(owned);
  if(state.phase==='setup'){const id=ownIds.sort((a,b)=>(t[a].armies||0)-(t[b].armies||0))[0];return id?{kind:'setupPlace',territoryId:id,amount:1,byConnId:pid}:null;}
  if(state.phase==='reforco'){
    ensureReinforcementState(state,pid);
    if((state.reinforcementStage||'free')==='continent'){
      const cids=Object.entries(state.continentBonusRemaining||{}).filter(([,n])=>Number(n)>0).map(([c])=>c);
      for(const cid of cids){const id=ownIds.find(x=>T[x]?.continent===cid);if(id)return {kind:'reinforce',territoryId:id,amount:Math.min(Number(state.continentBonusRemaining[cid]),Number(state.reinforcementsRemaining)||1),byConnId:pid};}
      return {kind:'endReinforcePhase',byConnId:pid};
    }
    if(Number(state.reinforcementsRemaining)>0){
      const id=ownIds.slice().sort((a,b)=>{const ea=(ADJ[a]||[]).filter(x=>t[x]&&t[x].owner!==pid).length,eb=(ADJ[b]||[]).filter(x=>t[x]&&t[x].owner!==pid).length;return eb-ea || (t[b].armies||0)-(t[a].armies||0)})[0];
      if(id)return {kind:'reinforce',territoryId:id,amount:Number(state.reinforcementsRemaining),byConnId:pid};
    }
    return {kind:'endReinforcePhase',byConnId:pid};
  }
  if(state.phase==='ataque'){
    if(state.pendingConquestTransfer){const q=state.pendingConquestTransfer;const max=Math.max(1,Math.min(Number(q.maxTransfer)||1,(t[q.fromId]?.armies||1)-1));return {kind:'conquestTransfer',fromId:q.fromId,toId:q.toId,amount:max,byConnId:pid};}
    let best=null;
    for(const fromId of ownIds){const from=t[fromId];if((from.armies||0)<2)continue;for(const toId of (ADJ[fromId]||[])){const to=t[toId];if(!to||to.owner===pid)continue;const advantage=(from.armies||0)-(to.armies||0);if(advantage>=2 && (!best||advantage>best.advantage))best={fromId,toId,advantage};}}
    if(best)return {kind:'attack',fromId:best.fromId,toId:best.toId,dice:Math.min(3,(t[best.fromId].armies||0)-1),byConnId:pid};
    // A IA encerra sua vez diretamente depois que não há mais ataque possível.
    // applyAction permite endTurn na fase de ataque, e isso entrega a vez ao próximo jogador.
    return {kind:'endTurn',byConnId:pid};
  }
  if(state.phase==='fortificacao'){
    let best=null;
    for(const fromId of ownIds){const from=t[fromId];if((from.armies||0)<2)continue;for(const toId of (ADJ[fromId]||[])){const to=t[toId];if(!to||to.owner!==pid)continue;const score=(from.armies||0)-(to.armies||0);if(!best||score>best.score)best={fromId,toId,score};}}
    if(best&&best.score>0)return {kind:'fortify',fromId:best.fromId,toId:best.toId,amount:1,byConnId:pid};
    return {kind:'endTurn',byConnId:pid};
  }
  return null;
}
export class UORRoom {
 constructor(state,env){this.state=state;this.env=env;this.sockets=new Map();this.spectators=new Set();this.presenceSockets=new Map();this.presenceUsers=new Map();this.state.blockConcurrencyWhile(async()=>{this.room=await this.state.storage.get('room')||null;this.game=await this.state.storage.get('game')||null;if(this.game){normalizeObjectives(this.game);if(this.game.phase==='reforco'&&(!Object.prototype.hasOwnProperty.call(this.game,'continentBonusRemaining')||!Object.prototype.hasOwnProperty.call(this.game,'reinforcementStage'))){const cp=this.game.players?.[this.game.turnIndex];if(cp)beginReinforcementPhase(this.game,cp.id);}await this.state.storage.put('game',this.game);}});}
 async persist(){await this.state.storage.put('room',this.room);await this.state.storage.put('game',this.game);}
 async roomForPublic(){return this.room?{id:this.room.id,name:this.room.name,maxPlayers:this.room.maxPlayers,hostConnId:this.room.hostConnId,players:this.room.players,gameActive:!!this.game,version:GAME_VERSION,updatedAt:now()}:null;}
 publicGameStateForSpectator(state){if(!state)return state;const safe=structuredClone(state);delete safe.hands;delete safe.objectives;delete safe.reconnectCodes;delete safe.deck;delete safe.discardPile;delete safe.airAttackCards;delete safe.lastAttackAt;return safe;}
 broadcast(msg){for(const [uid,ws] of this.sockets.entries()){try{const spectator=this.spectators.has(uid);let out=msg;if(spectator&&msg?.type==='game_state_sync'&&msg.state)out={...msg,state:this.publicGameStateForSpectator(msg.state)};else if(spectator&&msg?.type==='room_relay'&&msg.payload?.type==='game_state_sync'&&msg.payload.state)out={...msg,payload:{...msg.payload,state:this.publicGameStateForSpectator(msg.payload.state)}};ws.send(JSON.stringify(out));}catch{}}}
 broadcastPresence(){const users=[...this.presenceUsers.values()].sort((a,b)=>a.nick.localeCompare(b.nick,'pt-BR',{sensitivity:'base'}));const raw=JSON.stringify({type:'presence_snapshot',users});for(const set of this.presenceSockets.values())for(const ws of set)try{ws.send(raw)}catch{}}
 async presenceSocketClosed(uid,ws){const set=this.presenceSockets.get(uid);if(!set||!set.has(ws))return;set.delete(ws);if(set.size===0){this.presenceSockets.delete(uid);this.presenceUsers.delete(uid);this.broadcastPresence();}}
 async fetch(req){const url=new URL(req.url),path=url.pathname;
  if(path==='/ws/lobby'){if(req.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});const uid=req.headers.get('x-uor-user');const nick=String(req.headers.get('x-uor-name')||'General').slice(0,24);const color=String(req.headers.get('x-uor-color')||'crimson');if(!uid)return new Response('Unauthorized',{status:401});const st=await this.env.DB.prepare('SELECT points,role FROM user_stats s JOIN users u ON u.id=s.user_id WHERE s.user_id=?').bind(uid).first();const rankId=rankFor(Number(st?.points||0)).id;const role=normalizeRole(st?.role);const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();let set=this.presenceSockets.get(uid);if(!set){set=new Set();this.presenceSockets.set(uid,set);}set.add(server);this.presenceUsers.set(uid,{id:uid,nick,color,rankId,role});server.addEventListener('close',()=>{this.presenceSocketClosed(uid,server)});server.addEventListener('error',()=>{this.presenceSocketClosed(uid,server)});server.send(JSON.stringify({type:'presence_snapshot',users:[...this.presenceUsers.values()].sort((a,b)=>a.nick.localeCompare(b.nick,'pt-BR',{sensitivity:'base'}))}));this.broadcastPresence();return new Response(null,{status:101,webSocket:client});}
  if(path.endsWith('/internal/user-role-updated')){if(req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY||''))return json({ok:false,error:'Internal key inválida.'},403);const actorId=req.headers.get('x-uor-user');const actor=actorId?await this.env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(actorId).first():null;if(!actor||!isStaffOrAdmin(actor))return json({ok:false,error:'Sem permissão.'},403);const b=await body(req),targetId=String(b.targetId||'').trim(),role=normalizeRole(b.role);if(this.room?.players)for(const p of this.room.players)if(p.id===targetId)p.role=role;if(this.game?.players)for(const p of this.game.players)if(p.id===targetId)p.role=role;if(this.room||this.game){await this.persist();if(this.room)this.broadcast({type:'room_state',room:await this.roomForPublic()});if(this.game)this.broadcast({type:'game_state_sync',state:this.game});}const presenceSet=this.presenceSockets.get(targetId);if(presenceSet)for(const ws of presenceSet)try{ws.send(JSON.stringify({type:'role_updated',role}));}catch{}const roomWs=this.sockets.get(targetId);if(roomWs)try{roomWs.send(JSON.stringify({type:'role_updated',role}));}catch{}if(!this.room&&!this.game){const u=this.presenceUsers.get(targetId);if(u)u.role=role;this.broadcastPresence();}return json({ok:true});}
  if(path.endsWith('/internal/moderation-event')){if(req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY||''))return json({ok:false,error:'Internal key inválida.'},403);const actorId=req.headers.get('x-uor-user');const actor=actorId?await this.env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(actorId).first():null;if(!actor||!isStaffOrAdmin(actor))return json({ok:false,error:'Sem permissão.'},403);const b=await body(req);const targetId=String(b.targetId||'').trim();if(!targetId)return json({ok:false,error:'Jogador inválido.'},400);const targetNick=String(b.targetNick||'General').slice(0,24);const kind=b.kind==='unmute'?'unmute':'mute';const text=kind==='mute'?`${targetNick} foi silenciado por 30 minutos.`:`O silêncio de ${targetNick} foi removido.`;this.broadcast({type:'room_relay',roomId:this.room?.id,payload:{type:'moderation_system',entry:{name:'Sistema',text,ts:now(),system:true}}});return json({ok:true});}
  if(path.endsWith('/internal/kick')){
    if(req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY||''))return json({ok:false,error:'Internal key inválida.'},403);
    const actorId=req.headers.get('x-uor-user');const actor=actorId?await this.env.DB.prepare('SELECT id,nick,role FROM users WHERE id=?').bind(actorId).first():null;if(!actor||!isStaffOrAdmin(actor))return json({ok:false,error:'Sem permissão.'},403);
    const b=await body(req),targetId=String(b.targetId||'').trim(),targetNick=String(b.targetNick||'General').slice(0,24),actorNick=String(b.actorNick||actor.nick||'Membro da equipe').slice(0,24),actorRole=normalizeRole(b.actorRole||actor.role),minutes=[0,5,10,20,30].includes(Number(b.minutes))?Number(b.minutes):0,expiresAt=Number(b.expiresAt||0),notice={type:'kick_notice',targetNick,actorNick,actorRole,minutes,expiresAt,ts:now()};
    let delivered=0;
    const set=this.presenceSockets.get(targetId);if(set){for(const ws of set){try{ws.send(JSON.stringify(notice));delivered++;}catch{}try{ws.close(4003,'kicked');}catch{}}this.presenceSockets.delete(targetId);this.presenceUsers.delete(targetId);this.broadcastPresence();}
    const p=this.game?.players?.find(x=>x.id===targetId);if(p){if(minutes>0){p.kickActive=true;p.kickUntil=expiresAt;p.aiControlled=true;p.connectionStatus='kicked';p.disconnectAt=now();p.reconnectUntil=expiresAt;this.game.log.push(`${p.name} recebeu Kick de ${minutes} minutos por ${actorRole} ${actorNick}.`);}else{p.kickActive=false;p.kickUntil=0;}await this.persist();this.broadcast({type:'game_state_sync',state:this.game});}
    const roomWs=this.sockets.get(targetId);if(roomWs){try{roomWs.send(JSON.stringify(notice));delivered++;}catch{}try{roomWs.close(4003,'kicked');}catch{}this.sockets.delete(targetId);}
    await this.persist();return json({ok:true,delivered});
  }
  if(path.endsWith('/internal/init')){const b=await body(req);this.room={...b,hostConnId:b.hostConnId||b.players?.[0]?.id||null};await this.persist();return json({ok:true});}
  if(path.endsWith('/internal/join')){if(this.game)return json({ok:false,error:'A partida já começou.'},409);const b=await body(req),uid=b.userId;if(!this.room)return json({ok:false,error:'Sala inexistente.'},404);if(this.room.players.some(p=>p.id===uid))return json({ok:true,room:await this.roomForPublic(),assignedColor:this.room.players.find(p=>p.id===uid).color});if(this.room.players.length>=this.room.maxPlayers)return json({ok:false,error:'Sala cheia, general.'},409);const used=this.room.players.map(p=>p.color),color=COLORS.includes(b.color)&&!used.includes(b.color)?b.color:COLORS.find(c=>!used.includes(c))||COLORS[0];this.room.players.push({id:uid,connId:uid,name:String(b.name||'General').slice(0,24),color,rankId:String(b.rankId||'soldado'),role:normalizeRole(b.role),ready:false,eliminated:false});await this.persist();this.broadcast({type:'room_state',room:await this.roomForPublic()});return json({ok:true,room:await this.roomForPublic(),assignedColor:color});}
  if(path.endsWith('/internal/status')){const uid=req.headers.get('x-uor-user');if(!this.game||!this.room)return json({ok:true,active:false});const p=this.game.players.find(x=>x.id===uid);if(!p)return json({ok:true,active:false});return json({ok:true,active:true,room:await this.roomForPublic(),state:this.game,player:{id:p.id,name:p.name,aiControlled:!!p.aiControlled,abandoned:!!p.abandoned,reconnectUntil:Number(p.reconnectUntil||0),remainingMs:Math.max(0,Number(p.reconnectUntil||0)-now())}});}
  if(path.endsWith('/internal/reconnect')){const uid=req.headers.get('x-uor-user');if(!this.game||!this.room)return json({ok:false,error:'Nenhuma partida em andamento.'},404);const p=this.game.players.find(x=>x.id===uid);if(!p)return json({ok:false,error:'Você não pertence mais a esta partida.'},403);if(p.abandoned)return json({ok:false,error:'Você confirmou o abandono desta partida e não pode retornar.'},403);if(p.kickActive){if(Number(p.kickUntil||0)>now())return json({ok:false,error:`Você ainda está em Kick por ${formatMsClock(Number(p.kickUntil)-now())}.`},403);p.kickActive=false;p.kickUntil=0;p.aiControlled=false;p.connectionStatus='online';p.disconnectAt=null;p.reconnectUntil=null;await this.persist();this.broadcast({type:'game_state_sync',state:this.game});return json({ok:true,room:await this.roomForPublic(),state:this.game});}if(Number(p.reconnectUntil||0)&&Number(p.reconnectUntil)<=now())return json({ok:false,error:'O tempo de reconexão terminou. A deserção foi registrada.'},403);p.aiControlled=false;p.connectionStatus='online';p.disconnectAt=null;p.reconnectUntil=null;await this.persist();this.broadcast({type:'game_state_sync',state:this.game});return json({ok:true,room:await this.roomForPublic(),state:this.game});}
  if(path.endsWith('/internal/leave')){const uid=req.headers.get('x-uor-user');if(!this.room)return json({ok:true,deleted:true});if(this.game){const p=this.game.players.find(x=>x.id===uid);if(!p)return json({ok:false,error:'Jogador não encontrado.'},404);if(p.abandoned)return json({ok:true,room:await this.roomForPublic(),abandoned:true});const suspension=await applyDesertionSuspension(this.env,uid);p.abandoned=true;p.aiControlled=true;p.connectionStatus='abandoned';p.disconnectAt=now();p.reconnectUntil=0;p.logLabel='Desertou';this.sockets.get(uid)?.close(1000,'abandon');this.sockets.delete(uid);p.eliminated=false;this.game.log.push(`${p.name} abandonou a partida.`);await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'game_state_sync',state:this.game});return json({ok:true,room:await this.roomForPublic(),abandoned:true,suspension});}this.sockets.get(uid)?.close(1000,'leave');this.sockets.delete(uid);this.room.players=this.room.players.filter(p=>p.id!==uid);if(!this.room.players.length){this.room=null;this.game=null;await this.persist();return json({ok:true,deleted:true});}if(this.room.hostConnId===uid)this.room.hostConnId=this.room.players[0].id;await this.persist();this.broadcast({type:'room_state',room:await this.roomForPublic()});return json({ok:true,room:await this.roomForPublic()});}
  if(path==='/ws' || path.startsWith('/ws')){if(req.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});const uid=req.headers.get('x-uor-user');if(!uid||!this.room)return new Response('Unauthorized',{status:401});const isSpectator=req.headers.get('x-uor-spectator')==='1';if(isSpectator){const u=await this.env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(uid).first();if(!u||!isStaffOrAdmin(u))return new Response('Acesso de espectador permitido apenas para STAFF/ADMIN.',{status:403});if(this.game?.players?.some(p=>p.id===uid||p.connId===uid))return new Response('Este cargo já participa desta partida.',{status:409});this.spectators.add(uid);}else{this.spectators.delete(uid);if(this.game){const p=this.game.players.find(x=>x.id===uid);if(!p||p.abandoned)return new Response('Forbidden',{status:403});p.aiControlled=false;p.connectionStatus='online';p.disconnectAt=null;p.reconnectUntil=null;await this.persist();}}const publicRoom=await this.roomForPublic();const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();this.sockets.set(uid,server);if(this.game&&!isSpectator){const gp=this.game.players.find(x=>x.id===uid);if(gp)gp.lastSeenAt=now();}server.addEventListener('message',e=>this.onMessage(uid,server,e));server.addEventListener('close',()=>this.onClose(uid,server));server.send(JSON.stringify({type:'room_state',room:publicRoom}));if(this.game)server.send(JSON.stringify({type:'game_state_sync',state:isSpectator?this.publicGameStateForSpectator(this.game):this.game}));this.scheduleNextAlarm();return new Response(null,{status:101,webSocket:client});}
  return json({ok:false,error:'Not found'},404);
 }
 async checkConnectionWatchdog(){
  if(!this.game)return;
  const ts=now();
  for(const p of this.game.players){
    if(p.eliminated||p.abandoned||p.aiControlled)continue;
    if(this.sockets.has(p.id)&&Number(p.lastSeenAt||ts)+CONNECTION_WATCHDOG_MS<=ts){
      const ws=this.sockets.get(p.id);try{ws.close(4000,'heartbeat timeout')}catch{}this.sockets.delete(p.id);
      p.aiControlled=true;p.connectionStatus='disconnected';p.disconnectAt=ts;p.reconnectUntil=ts+RECONNECT_GRACE_MS;this.game.log.push(`${p.name} perdeu a conexão. IA assumiu temporariamente.`);
      if(this.game.hostConnId===p.id){const next=this.game.players.find(x=>!x.eliminated&&!x.abandoned&&this.sockets.has(x.id));if(next){this.game.hostConnId=next.id;this.room.hostConnId=next.id;this.game.log.push(`${next.name} assumiu o comando da batalha.`);this.broadcast({type:'host_migrated',newHostConnId:next.id});}}
    }
  }
 }
 async onClose(uid,ws){if(this.sockets.get(uid)!==ws)return;this.sockets.delete(uid);if(this.spectators.has(uid)){this.spectators.delete(uid);return;}if(!this.room)return;if(!this.game){this.room.players=this.room.players.filter(p=>p.id!==uid);if(!this.room.players.length){const rid=this.room.id;this.room=null;await this.persist();await this.env.DB.prepare('DELETE FROM rooms WHERE id=?').bind(rid).run();return;}if(this.room.hostConnId===uid)this.room.hostConnId=this.room.players[0].id;await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'room_state',room:await this.roomForPublic()});return;}const p=this.game.players.find(x=>x.id===uid);if(!p||p.eliminated||p.abandoned)return;const kickActiveNow=p.kickActive&&Number(p.kickUntil||0)>now();if(!kickActiveNow){p.aiControlled=true;p.connectionStatus='disconnected';p.disconnectAt=now();p.reconnectUntil=now()+RECONNECT_GRACE_MS;this.game.log.push(`${p.name} ficou desconectado. IA assumiu temporariamente.`);}if(this.game.hostConnId===uid){const next=this.game.players.find(x=>!x.eliminated&&!x.abandoned&&this.sockets.has(x.id));if(next){this.game.hostConnId=next.id;this.room.hostConnId=next.id;this.game.log.push(`${next.name} assumiu o comando da batalha.`);this.broadcast({type:'host_migrated',newHostConnId:next.id});}}await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'game_state_sync',state:this.game});this.scheduleNextAlarm();}
 async scheduleNextAlarm(){
  const times=[];
  if(this.game?.airAttackPending?.resolveAt)times.push(Number(this.game.airAttackPending.resolveAt));
  if(this.game?.players)for(const p of this.game.players){if(p.aiControlled){if(Number(p.reconnectUntil)>0)times.push(Number(p.reconnectUntil));if(this.game.players[this.game.turnIndex]?.id===p.id)times.push(now()+1200);}}
  if(this.game?.players?.some(p=>this.sockets.has(p.id)&&!p.aiControlled&&!p.abandoned))times.push(now()+HEARTBEAT_ALARM_MS);
  if(!times.length)return;
  const at=Math.max(now()+250,Math.min(...times));
  try{await this.state.storage.setAlarm(at);}catch{}
 }
 async runAiTurn(){
  if(!this.game)return false;const p=this.game.players[this.game.turnIndex];if(!p||!p.aiControlled)return false;if(p.kickActive){if(Number(p.kickUntil||0)>now())return false;p.kickActive=false;p.kickUntil=0;p.connectionStatus='disconnected';p.reconnectUntil=now()+RECONNECT_GRACE_MS;this.game.log.push(`${p.name} encerrou o Kick e voltou ao período normal de reconexão.`);await this.persist();}if(Number(p.reconnectUntil)>0&&Number(p.reconnectUntil)<=now()){await this.registerExpiredDesertion(p.id);return false;}
  const action=chooseAiAction(this.game,p.id);if(!action)return false;const next=applyAction(this.game,action);if(!next)return false;this.game=next;this.game.winner=checkWinner(this.game);if(this.game.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);await this.persist();this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});return true;
 }
 async closeIfOnlyAiAfterGrace(){
  if(!this.game||!this.room||this.game.winner||this.game.resultRecorded)return false;
  const active=this.game.players.filter(p=>!p.eliminated);
  if(!active.length||!active.every(p=>p.aiControlled))return false;
  const pending=active.filter(p=>(!p.abandoned&&Number(p.reconnectUntil||0)>now())||(p.kickActive&&Number(p.kickUntil||0)>now()));
  if(pending.length)return false;
  const rid=this.room.id;this.broadcast({type:'room_relay',roomId:rid,payload:{type:'match_closed',reason:'A partida foi encerrada automaticamente porque todos os generais ficaram sob controle da IA e o período de reconexão terminou.'}});
  for(const ws of this.sockets.values()){try{ws.close(1000,'match_closed')}catch{}}this.sockets.clear();
  for(const set of this.presenceSockets.values())for(const ws of set){try{ws.close(1000,'match_closed')}catch{}}this.presenceSockets.clear();this.presenceUsers.clear();this.spectators.clear();
  this.room=null;this.game=null;await this.persist();await this.env.DB.prepare('DELETE FROM rooms WHERE id=?').bind(rid).run();return true;
 }
 async registerExpiredDesertion(uid){
  const p=this.game?.players?.find(x=>x.id===uid);if(!p||p.abandoned||p.kickActive)return;const suspension=await applyDesertionSuspension(this.env,uid);p.abandoned=true;p.aiControlled=true;p.connectionStatus='abandoned';p.disconnectAt=p.disconnectAt||now();p.reconnectUntil=0;p.logLabel='Desertou';this.game.log.push(`${p.name} não retornou em 5 minutos e foi registrado como deserção.`);this.broadcast({type:'game_state_sync',state:this.game});await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());return suspension;
 }
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
  await this.resolveAirAttack();
  await this.checkConnectionWatchdog();
  if(this.game){await this.persist();this.broadcast({type:'room_relay',roomId:this.room?.id,payload:{type:'game_state_sync',state:this.game}});}
  if(this.game){for(const p of [...this.game.players]){if(p.kickActive&&Number(p.kickUntil||0)>0&&Number(p.kickUntil)<=now()){p.kickActive=false;p.kickUntil=0;p.connectionStatus='disconnected';p.reconnectUntil=now()+RECONNECT_GRACE_MS;this.game.log.push(`${p.name} encerrou o Kick e voltou ao período normal de reconexão.`);}if(p.aiControlled&&!p.abandoned&&!p.kickActive&&Number(p.reconnectUntil)>0&&Number(p.reconnectUntil)<=now())await this.registerExpiredDesertion(p.id);}
    if(await this.closeIfOnlyAiAfterGrace())return;
    await this.runAiTurn();
    if(this.game?.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);
    if(this.game)await this.closeIfOnlyAiAfterGrace();
  }
  await this.scheduleNextAlarm();
 }
 async onMessage(uid,ws,e){let m;try{m=JSON.parse(e.data)}catch{return}const isSpectator=this.spectators.has(uid);if(this.game&&!isSpectator){const hp=this.game.players.find(x=>x.id===uid);if(hp)hp.lastSeenAt=now();}if(!m?.type)return;if(isSpectator&&m.type!=='sync_request'&&m.type!=='game_chat'&&m.type!=='heartbeat'){ws.send(JSON.stringify({type:'room_relay',roomId:this.room?.id,payload:{type:'spectator_action_rejected',reason:'Modo espectador: ações de jogo estão bloqueadas.'}}));return;}if(m.type==='heartbeat'){try{ws.send(JSON.stringify({type:'heartbeat_ack',ts:now()}))}catch{};if(!isSpectator)await this.persist();await this.scheduleNextAlarm();return;}if(m.type==='sync_request'){try{ws.send(JSON.stringify({type:'heartbeat_ack',ts:now()}))}catch{};await this.persist();await this.scheduleNextAlarm();return;}if(m.type==='sync_request'){if(this.game){normalizeObjectives(this.game);if(this.game.phase==='reforco'&&(!Object.prototype.hasOwnProperty.call(this.game,'continentBonusRemaining')||!Object.prototype.hasOwnProperty.call(this.game,'reinforcementStage'))){const cp=this.game.players?.[this.game.turnIndex];if(cp)beginReinforcementPhase(this.game,cp.id);}await this.persist();ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:isSpectator?this.publicGameStateForSpectator(this.game):this.game}}));}else if(this.room)ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'room_state',room:await this.roomForPublic()}}));return;}if(m.type==='room_chat'){const muted=await getActiveMute(this.env,uid);if(muted){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'chat_rejected',reason:`Você está silenciado por mais ${Math.max(1,Math.ceil((muted.expiresAt-now())/60000))} minuto(s).`}}));return;}const rp=this.room.players.find(p=>p.id===uid);const entry={name:rp?.name||'General',color:rp?.color||COLORS[0],rankId:rp?.rankId||'soldado',role:normalizeRole(rp?.role),text:String(m.entry?.text||'').trim().slice(0,400),ts:now()};if(!entry.text)return;this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'room_chat',entry}});return;}
  if(m.type==='game_chat'){if(!this.game)return;const muted=await getActiveMute(this.env,uid);if(muted){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'chat_rejected',reason:`Você está silenciado por mais ${Math.max(1,Math.ceil((muted.expiresAt-now())/60000))} minuto(s).`}}));return;}const text=String(m.entry?.text||'').trim().slice(0,400);if(!text)return;if(isSpectator){const u=await this.env.DB.prepare('SELECT u.id,u.nick,u.role,s.points FROM users u JOIN user_stats s ON s.user_id=u.id WHERE u.id=?').bind(uid).first();if(!u||!isStaffOrAdmin(u))return;const entry={name:u.nick,color:COLORS[0],rankId:rankFor(Number(u.points||0)).id,role:normalizeRole(u.role),text,ts:now(),spectator:true};this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_chat',entry}});return;}const p=this.game.players.find(x=>x.id===uid);if(!p||p.eliminated)return;const entry={name:p.name,color:p.color,rankId:p.rankId||'soldado',role:normalizeRole(p.role),text,ts:now()};this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_chat',entry}});return;}
  if(m.type==='room_ready'){if(this.game||!this.room||uid===this.room.hostConnId)return;const p=this.room.players.find(x=>x.id===uid);if(!p)return;p.ready=!p.ready;await this.persist();this.broadcast({type:'room_state',room:await this.roomForPublic()});await syncRoomRow(this.env,this.room.id,await this.roomForPublic());return;}
  if(m.type==='start_game'){const othersReady=this.room?.players?.length>=2&&this.room.players.filter(p=>p.id!==this.room.hostConnId).every(p=>p.ready===true);if(uid!==this.room.hostConnId||!othersReady||this.game)return;this.game=initGame(this.room);this.room.gameActive=true;await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_start',state:this.game}});return;}
  if(m.type==='air_attack_request'){if(!this.game)return;const a={...(m.action||{}),byConnId:uid};const next=applyAction(this.game,a);if(!next){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'Ataque aéreo recusado pelo servidor.'}}));return;}this.game=next;const resolveDelay=Math.max(4000,Math.min(16000,Number(a.visualImpactMs)||6000));const pendingRef=this.game.airAttackPending;pendingRef.resolveAt=Date.now()+resolveDelay;await this.persist();const visualTs=now();this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'air_attack_visual',action:a,ts:visualTs}});this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});
   const resolvePromise=new Promise(resolve=>setTimeout(resolve,resolveDelay)).then(async()=>{if(this.game?.airAttackPending!==pendingRef)return;await this.resolveAirAttack();});
   if(typeof this.state.waitUntil==='function')this.state.waitUntil(resolvePromise);
   try{await this.state.storage.setAlarm(pendingRef.resolveAt);}catch{}
   return;}
  if(m.type==='game_action'){if(!this.game)return;const a={...(m.action||{}),byConnId:uid};const next=applyAction(this.game,a);if(!next){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'Ação recusada pelo servidor. Confira a fase, o alvo e aguarde a sincronização.'}}));return;}this.game=next;this.game.winner=checkWinner(this.game);if(this.game.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);await this.persist();this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});await this.scheduleNextAlarm();}
 }
}

async function route(req,env){try{return await routeInner(req,env);}catch(e){return json({ok:false,error:'Erro interno do servidor.',detail:String(e?.message||e)},500);}}
async function routeInner(req,env){const url=new URL(req.url),p=url.pathname;if(p==='/api/admin/bootstrap-role'&&req.method==='POST')return apiAdminBootstrapRole(req,env);if(p==='/api/auth/me')return apiAuthMe(req,env);if(p==='/api/auth/register'&&req.method==='POST')return apiAuthRegister(req,env);if(p==='/api/auth/login'&&req.method==='POST')return apiAuthLogin(req,env);if(p==='/api/auth/logout'&&req.method==='POST')return apiAuthLogout(req,env);const user=await authUser(req,env);if(!user)return json({ok:false,error:'Faça login para continuar.'},401);
 if(p==='/api/profile')return apiProfile(req,env,user);if(p==='/api/public-profile')return apiPublicProfile(req,env,user.id);if(p==='/api/ranking')return apiRanking(req,env);if(p==='/api/history')return apiHistory(req,env,user);if(p==='/api/public-history')return apiPublicHistory(req,env,user.id);if(p==='/api/chat')return apiChat(req,env,user);if(p==='/api/moderation/mute'&&req.method==='POST')return apiModerationMute(req,env,user);if(p==='/api/moderation/unmute'&&req.method==='POST')return apiModerationUnmute(req,env,user);if(p==='/api/moderation/kick'&&req.method==='POST')return apiModerationKick(req,env,user);if(p==='/api/moderation/status'&&req.method==='GET')return apiModerationStatus(req,env,user);if(p==='/api/admin/users'&&req.method==='GET')return apiAdminUsers(req,env,user);if(p==='/api/admin/role'&&req.method==='POST')return apiAdminSetRole(req,env,user);if(p==='/api/admin/remove-suspension'&&req.method==='POST')return apiAdminRemoveSuspension(req,env,user);if(p==='/api/rooms'&&req.method==='GET')return apiRooms(req,env);if(p==='/api/rooms'&&req.method==='POST')return apiCreateRoom(req,env,user);if(p==='/api/active-match'&&req.method==='GET')return apiActiveMatch(req,env,user);let m=p.match(/^\/api\/rooms\/([^/]+)\/(join|leave|reconnect)$/);if(m&&req.method==='POST'){if(m[2]==='join')return apiJoinRoom(req,env,user,m[1]);if(m[2]==='leave')return apiLeaveRoom(req,env,user,m[1]);return apiReconnectRoom(req,env,user,m[1]);}return json({ok:false,error:'Endpoint não encontrado.'},404);}

export default {async fetch(req,env,ctx){const url=new URL(req.url);if(url.pathname==='/ws/lobby'){const user=await authUser(req,env);if(!user)return new Response('Unauthorized',{status:401});const d=await getRoomDO(env,'__uor_lobby_presence__');const headers=new Headers(req.headers);headers.set('x-uor-user',user.id);headers.set('x-uor-name',user.nick);headers.set('x-uor-color',COLORS[0]);return d.fetch(new Request(req,{headers}));}if(url.pathname.startsWith('/ws/rooms/')){const user=await authUser(req,env);if(!user)return new Response('Unauthorized',{status:401});const id=decodeURIComponent(url.pathname.split('/').pop());const d=await getRoomDO(env,id);const headers=new Headers(req.headers);headers.set('x-uor-user',user.id);const spectator=new URL(req.url).searchParams.get('spectator')==='1';if(spectator){if(!isStaffOrAdmin(user))return new Response('Apenas STAFF/ADMIN pode assistir partidas.',{status:403});if(req.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});headers.set('x-uor-spectator','1');}return d.fetch(new Request(req,{headers}));}if(url.pathname.startsWith('/api/'))return route(req,env);return env.ASSETS.fetch(req);}};
