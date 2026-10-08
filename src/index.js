const LEGAL_VERSION="2026-10-01";
const PRIVACY_HTML="<h2>Política de privacidade — UOR</h2><p>Versão de 1 de outubro de 2026. Responsável: Luiz Augusto. Contato: <a href=\"mailto:uorgame20277@gmail.com\">uorgame20277@gmail.com</a>. Site: uorgame.com.br.</p><h3>Dados e finalidades</h3><p>Usamos login, nick público, senha armazenada como hash com salt, identificador da conta e sessões para autenticação. Guardamos estatísticas, histórico de partidas, preferências de bloqueio de mensagens, aceite dos termos e registros de moderação para funcionamento do jogo, segurança e atendimento. Mensagens enviadas nos chats e seu nick ficam visíveis aos participantes do respectivo chat. Não envie informações pessoais no chat.</p><p>Para limitar tentativas de acesso, o servidor usa um identificador derivado do endereço IP por hash com segredo. Cloudflare hospeda o serviço e pode processar IP, dados de conexão e registros técnicos. O site carrega fontes do Google Fonts, que recebe dados de conexão ao fornecer as fontes. Esses provedores podem processar dados fora do Brasil. Consulte também as políticas de Cloudflare e Google.</p><h3>Aplicativo, cookies e compartilhamento</h3><p>O aplicativo usa conexão à internet, cookies de sessão e armazenamento local para acesso e recuperação da partida. Esta versão não integra anúncios, pagamentos nem ferramentas de análise de publicidade e não solicita câmera, microfone, localização ou contatos. Dados necessários são tratados pelos provedores de infraestrutura; mensagens públicas são compartilhadas com participantes e denúncias com a equipe de moderação.</p><h3>Retenção e exclusão</h3><p>Dados de conta permanecem enquanto a conta existir. Sessões expiram em até 30 dias. O chat global mantém até 200 mensagens e remove mensagens com mais de 10 minutos nas rotinas de limpeza. Salas mantêm até 100 mensagens recentes para apuração de denúncias, além do histórico temporário apresentado no cliente. Denúncias são mantidas por até 90 dias, com limpeza nas operações de denúncia e moderação. Registros de segurança e infraestrutura seguem também as políticas dos provedores.</p><p>Use <a href=\"/delete-account\" target=\"_blank\" rel=\"noopener\">Excluir conta</a> na tela inicial ou acesse uorgame.com.br/delete-account pelo navegador. Informe login e senha e confirme. Dados associados à sua conta são removidos; sua posição em partidas em andamento é transferida para uma IA anônima. Registros compartilhados de outras pessoas podem permanecer sem sua identificação. Se uma exclusão falhar, repita a solicitação; a solicitação pendente impede novos acessos.</p><h3>Seus direitos e segurança</h3><p>Solicite acesso, correção, informações ou exclusão pelo contato acima. Não envie sua senha por e-mail. Usamos HTTPS, hash de senhas e controle de acesso; nenhum sistema garante segurança absoluta. Não colete nem publique dados de menores ou de terceiros. Mudanças relevantes nesta política serão indicadas nesta página com nova data.</p>";
const TERMS_HTML="<h2>Termos de uso e regras da comunidade — UOR</h2><p>Versão de 1 de outubro de 2026. Responsável: Luiz Augusto — uorgame20277@gmail.com.</p><p>UOR é um jogo de estratégia com batalhas fictícias. Pontos, exércitos e cartas são recursos virtuais sem valor monetário. Use uma conta própria e proteja sua senha. A disponibilidade do serviço depende da conexão e dos servidores.</p><h3>Chat e conduta</h3><p>Ao aceitar estes termos, você concorda em não publicar ameaças, assédio, discriminação, discurso de ódio, conteúdo sexual ou exploração de crianças, violência real explícita, dados pessoais de terceiros, fraude, spam ou conteúdo ilegal. Não use nomes ofensivos nem tente burlar autenticação, regras da partida ou medidas de segurança.</p><p>Chats são públicos para seus participantes. Você é responsável pelo que publica. Use Mutar para mim para bloquear mensagens de outro jogador e Denunciar para avisar a equipe sobre uma mensagem ou jogador. O bloqueio não silencia a pessoa para os demais. Denúncias são avaliadas pela equipe, que pode silenciar, desconectar ou restringir contas conforme a situação. Não faça denúncias falsas.</p><h3>Partidas, conta e contato</h3><p>A desconexão e o abandono seguem as regras mostradas no jogo, incluindo atuação temporária da IA e penalidades de deserção. O responsável pode corrigir falhas e atualizar as regras, respeitando a legislação aplicável. Estes termos não afastam direitos legais dos usuários. Para dúvidas, contestação de moderação ou direitos sobre seus dados: uorgame20277@gmail.com. A política de privacidade e a exclusão de conta estão na tela inicial e em /privacy e /delete-account.</p>";
let communitySchemaPromise=null;
async function ensureCommunitySchema(env){
 if(!communitySchemaPromise)communitySchemaPromise=(async()=>{
  await ensureModerationSchema(env);await ensureDesertionSchema(env);
  await env.DB.batch([
   env.DB.prepare('CREATE TABLE IF NOT EXISTS auth_request_limits (bucket TEXT PRIMARY KEY,requests INTEGER NOT NULL,expires_at INTEGER NOT NULL)'),
   env.DB.prepare('CREATE TABLE IF NOT EXISTS user_chat_mutes (user_id TEXT NOT NULL,target_user_id TEXT NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(user_id,target_user_id))'),
   env.DB.prepare('CREATE TABLE IF NOT EXISTS user_room_memberships (user_id TEXT PRIMARY KEY,room_id TEXT NOT NULL,created_at INTEGER NOT NULL)'),
   env.DB.prepare('CREATE TABLE IF NOT EXISTS user_blocks (user_id TEXT NOT NULL,blocked_user_id TEXT NOT NULL,created_at INTEGER NOT NULL,PRIMARY KEY(user_id,blocked_user_id))'),
   env.DB.prepare('CREATE TABLE IF NOT EXISTS user_reports (id TEXT PRIMARY KEY,reporter_id TEXT NOT NULL,target_id TEXT NOT NULL,reason TEXT NOT NULL,evidence TEXT NOT NULL,room_id TEXT,created_at INTEGER NOT NULL,status TEXT NOT NULL DEFAULT \'open\',reviewed_by TEXT,reviewed_at INTEGER)'),
   env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_user_reports_status ON user_reports(status,created_at)'),
   env.DB.prepare('CREATE TABLE IF NOT EXISTS user_consents (user_id TEXT PRIMARY KEY,version TEXT NOT NULL,accepted_at INTEGER NOT NULL)'),
   env.DB.prepare('CREATE TABLE IF NOT EXISTS user_deletion_requests (user_id TEXT PRIMARY KEY,requested_at INTEGER NOT NULL)')
  ]);
 })().catch(e=>{communitySchemaPromise=null;throw e;});
 return communitySchemaPromise;
}
function htmlEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function legalResponse(title,content,status=200){return new Response(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape(title)} — UOR</title><style>body{margin:0;background:#151b22;color:#eee;font:17px/1.65 system-ui}main{max-width:780px;margin:32px auto;padding:24px}a{color:#9cdaff}button,input{font:inherit;padding:10px;margin:8px 0;max-width:100%;box-sizing:border-box}label{display:block}button{cursor:pointer}small{display:block}</style><main><h1>${htmlEscape(title)}</h1>${content}<p><a href="/">Voltar ao UOR</a></p></main></html>`,{status,headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'same-origin','content-security-policy':"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"}});}
function publicLegalPage(path,env){
 if(path==='/privacy')return legalResponse('Política de privacidade',PRIVACY_HTML);
 if(path==='/terms')return legalResponse('Termos de uso',TERMS_HTML);
 if(path==='/delete-account')return legalResponse('Excluir conta e dados',`<p>Esta página permite excluir sua conta UOR mesmo sem instalar ou abrir o aplicativo. A operação é permanente e inclui estatísticas, histórico próprio, mensagens e dados associados. Em partidas em andamento, sua posição passa para uma IA anônima.</p><form id="deletionForm"><label>Login <input name="login" required autocomplete="username" maxlength="128"></label><label>Senha atual <input name="password" type="password" required autocomplete="current-password" maxlength="128"></label><label><input name="confirm" type="checkbox" required> Entendo que a exclusão é permanente.</label><button type="submit">Excluir permanentemente</button><p id="result" role="status"></p></form><script>document.getElementById('deletionForm').addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,b=f.querySelector('button'),r=document.getElementById('result');b.disabled=true;r.textContent='Processando…';try{const res=await fetch('/api/account/delete',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({login:f.login.value,password:f.password.value,confirm:true})});const d=await res.json();if(!res.ok||!d.ok)throw Error(d.error||'Não foi possível excluir.');r.textContent='Conta e dados excluídos.';f.reset();}catch(err){r.textContent=err.message;}finally{b.disabled=false;}});</script>`);
 return null;
}
async function apiDeleteAccount(req,env){
 await ensureCommunitySchema(env);const b=await body(req),password=String(b.password||'');
 if(b.confirm!==true||password.length<1||password.length>128)return json({ok:false,error:'Confirme a exclusão e informe a senha atual.'},400);
 const sessionUser=await authUser(req,env),login=String(b.login||sessionUser?.login||'').trim().toLowerCase();
 if(!validLogin(login)||await rateBlocked(env,login))return json({ok:false,error:'Aguarde para tentar novamente.'},429);
 const user=await env.DB.prepare('SELECT * FROM users WHERE login=?').bind(login).first();
 if(!user||await hashPassword(password,user.password_salt)!==user.password_hash){await logAttempt(env,login,false);return json({ok:false,error:'Login ou senha incorretos.'},401);}
 await env.DB.prepare('INSERT OR IGNORE INTO user_deletion_requests(user_id,requested_at) VALUES(?,?)').bind(user.id,now()).run();
 // Mark first, detach every shared room, then remove account rows atomically. Retries repeat safe operations.
 const rooms=await env.DB.prepare('SELECT id FROM rooms').all();
 for(const row of rooms.results||[]){const d=await getRoomDO(env,row.id);const res=await d.fetch(new Request('https://uor-room/internal/account-deleted',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({nick:user.nick})}));if(!res.ok)throw new Error('Falha ao remover identidade da sala. Repita a exclusão.');}
 const lobby=await getRoomDO(env,'__uor_lobby_presence__');const res=await lobby.fetch(new Request('https://uor-room/internal/account-deleted',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({nick:user.nick})}));if(!res.ok)throw new Error('Falha ao encerrar a presença.');
 const ops=[];
 ops.push(env.DB.prepare(`UPDATE match_history SET opponent_names=(SELECT json_group_array(CASE WHEN j.value=? THEN 'Jogador excluído' ELSE j.value END) FROM json_each(match_history.opponent_names) j),room_name=replace(room_name,?,'Jogador excluído') WHERE user_id<>? AND (EXISTS(SELECT 1 FROM json_each(match_history.opponent_names) j WHERE j.value=?) OR instr(room_name,?)>0)`).bind(user.nick,user.nick,user.id,user.nick,user.nick));
 for(const table of ['user_chat_mutes','user_room_memberships','sessions','user_achievements','match_history','chat_messages','user_stats','user_mutes','user_kicks','user_suspensions','user_consents'])ops.push(env.DB.prepare(`DELETE FROM ${table} WHERE user_id=?`).bind(user.id));
 ops.push(env.DB.prepare('DELETE FROM user_chat_mutes WHERE target_user_id=?').bind(user.id));
 await ensureResultSchema(env);
 ops.push(env.DB.prepare('DELETE FROM match_history_details WHERE user_id=?').bind(user.id));
 ops.push(env.DB.prepare(`UPDATE match_history_details SET details_json=json_set(details_json,'$.players',json((SELECT json_group_array(json(CASE WHEN json_extract(j.value,'$.name')=? THEN json_set(j.value,'$.name','Jogador excluído') ELSE j.value END)) FROM json_each(details_json,'$.players') j)))`).bind(user.nick));
 ops.push(env.DB.prepare('DELETE FROM user_blocks WHERE user_id=? OR blocked_user_id=?').bind(user.id,user.id));
 ops.push(env.DB.prepare('DELETE FROM user_reports WHERE reporter_id=? OR target_id=?').bind(user.id,user.id));
 ops.push(env.DB.prepare("UPDATE user_reports SET reviewed_by=NULL WHERE reviewed_by=?").bind(user.id));
 for(const [table,column] of [['user_mutes','muted_by'],['user_kicks','kicked_by']])ops.push(env.DB.prepare(`UPDATE ${table} SET ${column}='deleted' WHERE ${column}=?`).bind(user.id));
 ops.push(env.DB.prepare('DELETE FROM chat_messages WHERE instr(text,?)>0 OR nick=?').bind(user.nick,user.nick));
 ops.push(env.DB.prepare('DELETE FROM auth_attempts WHERE login=?').bind(user.login));
 ops.push(env.DB.prepare('DELETE FROM user_deletion_requests WHERE user_id=?').bind(user.id));
 ops.push(env.DB.prepare('DELETE FROM users WHERE id=?').bind(user.id));
 await env.DB.batch(ops);
 return json({ok:true,deleted:true},200,{'set-cookie':clearCookie(COOKIE)});
}

const GAME_VERSION = '2.10.0';
const GLOBAL_CHAT_RESET_MS = 10*60*1000;
const RECONNECT_GRACE_MS = 10*60*1000;
const CONNECTION_WATCHDOG_MS = 15000;
const HEARTBEAT_ALARM_MS = 7000;
const FINISHED_ROOM_CLOSE_MS = 15000;
const RESULT_RETRY_MS = 5000;
const JSON_HEADERS = { 'content-type':'application/json; charset=utf-8', 'cache-control':'no-store' };
const COOKIE = 'uor_session';
const SESSION_DAYS = 30;
const RANKS = [
  ['soldado','Soldado',0],
  ['cabo','Cabo',100],
  ['sargento','Sargento',300],
  ['tenente','Tenente',500],
  ['capitao','Capitão',1000],
  ['major','Major',2000],
  ['tenente_coronel','Tenente-Coronel',3500],
  ['coronel','Coronel',5500],
  ['general','General',8000]
];
const COLORS = ['crimson','azure','forest','brass','violet','ash'];
const COLOR_LABELS = {crimson:'Vermelho',azure:'Azul',forest:'Verde',brass:'Amarelo',violet:'Roxo',ash:'Cinza'};
const CONTINENTS = {NA:{name:'América do Norte',bonus:5},SA:{name:'América do Sul',bonus:2},EU:{name:'Europa',bonus:4},AF:{name:'África',bonus:4},AS:{name:'Ásia',bonus:6},OC:{name:'Oceania',bonus:2}};
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
const UOR_SOLDIER_SETS={classic:['knight','musketeer','ranger','royal'],apocalyptic:['infantry','raider','heavy'],glacial:['polar','scout','cryo']};
function normalizeUorSoldier(map,value){const options=UOR_SOLDIER_SETS[map]||UOR_SOLDIER_SETS.classic;return options.includes(value)?value:((value==='classic'||value==='military')?value:options[0]);}
const DEFAULT_ROOM_SETTINGS = { mode:'ranked', botCount:0, map:'classic', airAttackEnabled:true, cardLimit:'classic', soldiers:'knight' };
function normalizeRoomSettings(raw){const r=raw&&typeof raw==='object'?raw:{};const map=r.map==='apocalyptic'?'apocalyptic':(r.map==='glacial'?'glacial':'classic');const mode=r.mode==='training'?'training':'ranked';const count=Number(r.botCount);return {mode,botCount:mode==='training'?(Number.isSafeInteger(count)?Math.max(1,Math.min(5,count)):1):0,map,airAttackEnabled:r.airAttackEnabled===false||r.airAttack==='disabled'?false:true,cardLimit:r.cardLimit==='unlimited'?'unlimited':'classic',soldiers:normalizeUorSoldier(map,r.soldiers)};}

function isTrainingGame(state){return state?.matchMode==='training'||(!state?.matchMode&&state?.settings?.mode==='training');}
function createRoomBots(room){
 const rules=normalizeRoomSettings(room.settings);if(rules.mode!=='training')return [];
 const used=new Set(room.players.map(p=>p.color));return COLORS.filter(c=>!used.has(c)).slice(0,rules.botCount).map((color,i)=>({id:`bot:${room.id}:${i+1}`,connId:`bot:${room.id}:${i+1}`,name:`BOT ${i+1}`,color,rankId:'soldado',role:'PLAYER',isBot:true,aiControlled:true,connectionStatus:'bot',ready:true,eliminated:false}));
}

function now(){return Date.now();}
function uuid(){return crypto.randomUUID();}
function safeLimit(value,fallback,max){const n=Number(value);return Number.isSafeInteger(n)&&n>0?Math.min(max,n):fallback;}
function strictPositiveInt(value){if(typeof value!=='number')return null;const n=value;return Number.isSafeInteger(n)&&n>=1?n:null;}
function validTerritoryId(id){return typeof id==='string'&&Object.prototype.hasOwnProperty.call(T,id);}
function isPlainObject(v){return !!v&&typeof v==='object'&&!Array.isArray(v);}
function json(data,status=200,extra={}){return new Response(JSON.stringify(data),{status,headers:{...JSON_HEADERS,...extra}});}
function parseCookie(req,name){const s=req.headers.get('Cookie')||'';for(const p of s.split(';')){const [k,...v]=p.trim().split('=');if(k===name){try{return decodeURIComponent(v.join('='));}catch{return null;}}}return null;}
function cookie(name,value,maxAge){return `${name}=${encodeURIComponent(value)}; ${maxAge==null?'':`Max-Age=${maxAge}; `}Path=/; HttpOnly; Secure; SameSite=Lax`}
function clearCookie(name){return `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`}
function b64(buf){return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function ub64(s){s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';return Uint8Array.from(atob(s),c=>c.charCodeAt(0));}
async function sha256(s){return b64(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)));}
async function hashPassword(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),{name:'PBKDF2'},false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:ub64(salt),iterations:100000,hash:'SHA-256'},key,256);return b64(bits);}
function rankFor(points){let idx=0;for(let i=0;i<RANKS.length;i++)if(points>=RANKS[i][2])idx=i;const r=RANKS[idx],next=RANKS[idx+1];return {id:r[0],name:r[1],min:r[2],next:next?{id:next[0],name:next[1],min:next[2]}:null,progress:next?Math.max(0,Math.min(100,((points-r[2])/(next[2]-r[2]))*100)):100};}
async function body(req){const reader=req.body?.getReader();let text='';if(reader){const decoder=new TextDecoder();let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();throw Object.assign(new Error('Pedido muito grande.'),{status:413});}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}if(text.length>16384)throw Object.assign(new Error('Pedido muito grande.'),{status:413});let value;try{value=JSON.parse(text)}catch{throw Object.assign(new Error('JSON inválido.'),{status:400});}if(!value||typeof value!=='object'||Array.isArray(value))throw Object.assign(new Error('Pedido inválido.'),{status:400});return value;}
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
      await env.DB.prepare('CREATE INDEX IF NOT EXISTS idx_chat_messages_ts ON chat_messages(ts)').run();
    })().catch(e=>{moderationSchemaPromise=null;throw e;});
  }
  return moderationSchemaPromise;
}
let roomSchemaPromise=null;
async function ensureRoomsSchema(env){if(!roomSchemaPromise){roomSchemaPromise=(async()=>{try{await env.DB.prepare('SELECT settings_json FROM rooms LIMIT 1').first();}catch{try{await env.DB.prepare("ALTER TABLE rooms ADD COLUMN settings_json TEXT NOT NULL DEFAULT '{}'").run();}catch(e){if(!String(e?.message||e).toLowerCase().includes('duplicate column'))throw e;}}})().catch(e=>{roomSchemaPromise=null;throw e;});}return roomSchemaPromise;}

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
async function authUser(req,env){await ensureCommunitySchema(env);const token=parseCookie(req,COOKIE);if(!token)return null;const th=await sha256(token);const row=await env.DB.prepare(`SELECT u.id,u.nick,u.login,u.role,s.id session_id,s.expires_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>?`).bind(th,now()).first();if(row){row.role=normalizeRole(row.role);row.deleting=!!await env.DB.prepare('SELECT user_id FROM user_deletion_requests WHERE user_id=?').bind(row.id).first();}return row||null;}
async function createSession(env,userId){const token=crypto.getRandomValues(new Uint8Array(32));const raw=b64(token);const th=await sha256(raw),ts=now(),exp=ts+SESSION_DAYS*86400000;await env.DB.prepare('INSERT INTO sessions(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)').bind(uuid(),userId,th,ts,exp).run();return raw;}
async function replaceSessionsWithNew(env,userId){const token=crypto.getRandomValues(new Uint8Array(32));const raw=b64(token);const th=await sha256(raw),ts=now(),exp=ts+SESSION_DAYS*86400000;await env.DB.batch([env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(userId),env.DB.prepare('INSERT INTO sessions(id,user_id,token_hash,created_at,expires_at) VALUES(?,?,?,?,?)').bind(uuid(),userId,th,ts,exp)]);return raw;}
function validNick(v){return /^[\p{L}0-9 _-]{3,24}$/u.test(v);}
function validLogin(v){return typeof v==='string'&&v.trim().length>0&&v.length<=128;}
async function rateBlocked(env,login){await env.DB.prepare('DELETE FROM auth_attempts WHERE created_at<?').bind(now()-86400000).run();const cutoff=now()-15*60000;const r=await env.DB.prepare('SELECT COUNT(*) c FROM auth_attempts WHERE login=? AND success=0 AND created_at>?').bind(login,cutoff).first();return Number(r?.c||0)>=7;}
async function logAttempt(env,login,success){await env.DB.prepare('INSERT INTO auth_attempts(login,success,created_at) VALUES(?,?,?)').bind(login,success?1:0,now()).run();}

async function apiAuthRegister(req,env){if(!await authIpAllowed(req,env,'register'))return json({ok:false,error:'Muitos cadastros. Aguarde antes de tentar novamente.'},429);
  try{
    await ensureModerationSchema(env);
    const b=await body(req);
    const nick=String(b.nick||'').trim();
    const login=String(b.login||'').trim().toLowerCase();
    const password=String(b.password||'');
    const confirm=String(b.confirmPassword??b.password2??'');
    await ensureCommunitySchema(env);
    if(b.acceptTerms!==true)return json({ok:false,error:'Leia e aceite os termos de uso.'},400);
    if(password.length>128)return json({ok:false,error:'Senha muito longa.'},400);
    if(!validNick(nick))return json({ok:false,error:'Nick inválido. Use 3 a 24 caracteres.'},400);
    if(!validLogin(login))return json({ok:false,error:'Login inválido.'},400);
    if(password.length<1)return json({ok:false,error:'Informe uma senha.'},400);
    if(password!==confirm)return json({ok:false,error:'As senhas não coincidem.'},400);
    const exists=await env.DB.prepare('SELECT id FROM users WHERE login=? OR nick=?').bind(login,nick).first();
    if(exists)return json({ok:false,error:'Login ou nick já está em uso.'},409);
    const id=uuid(),salt=b64(crypto.getRandomValues(new Uint8Array(16))),ph=await hashPassword(password,salt),ts=now();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO users(id,nick,login,password_salt,password_hash,created_at) VALUES(?,?,?,?,?,?)').bind(id,nick,login,salt,ph,ts),
      env.DB.prepare('INSERT INTO user_stats(user_id) VALUES(?)').bind(id),
      env.DB.prepare('INSERT INTO user_consents(user_id,version,accepted_at) VALUES(?,?,?)').bind(id,LEGAL_VERSION,ts)
    ]);
    const token=await createSession(env,id);
    return json({ok:true,user:{id,nick,login,role:'PLAYER'},session:true},200,{'set-cookie':cookie(COOKIE,token)});
  }catch(e){
    console.error('UOR register error',e);return json({ok:false,error:e.status?e.message:'Não foi possível criar a conta no servidor.'},e.status||500);
  }
}
async function authIpAllowed(req,env,kind){
 const ip=req.headers.get('CF-Connecting-IP');if(!ip)return true;await ensureCommunitySchema(env);const windowMs=kind==='register'?600000:60000,limit=kind==='register'?6:30,window=Math.floor(now()/windowMs),bucket=await sha256(String(env.UOR_ADMIN_KEY||'')+'|'+ip+'|'+kind+'|'+window);
 await env.DB.batch([env.DB.prepare('DELETE FROM auth_request_limits WHERE expires_at<?').bind(now()),env.DB.prepare('INSERT INTO auth_request_limits(bucket,requests,expires_at) VALUES(?,1,?) ON CONFLICT(bucket) DO UPDATE SET requests=requests+1').bind(bucket,(window+1)*windowMs)]);
 const row=await env.DB.prepare('SELECT requests FROM auth_request_limits WHERE bucket=?').bind(bucket).first();return Number(row?.requests||0)<=limit;
}
async function apiAuthLogin(req,env){if(!await authIpAllowed(req,env,'login'))return json({ok:false,error:'Muitas tentativas. Aguarde antes de tentar novamente.'},429);await ensureModerationSchema(env);const b=await body(req),login=String(b.login||'').trim().toLowerCase(),password=String(b.password||'');if(password.length<1||password.length>128)return json({ok:false,error:'Senha inválida.'},400);if(!validLogin(login))return json({ok:false,error:'Login inválido.'},400);if(await rateBlocked(env,login))return json({ok:false,error:'Muitas tentativas. Aguarde 15 minutos.'},429);const u=await env.DB.prepare('SELECT * FROM users WHERE login=?').bind(login).first();if(!u){await logAttempt(env,login,false);return json({ok:false,error:'Login ou senha incorretos.'},401);}const ph=await hashPassword(password,u.password_salt);if(ph!==u.password_hash){await logAttempt(env,login,false);return json({ok:false,error:'Login ou senha incorretos.'},401);}const kick=await getActiveKick(env,u.id);if(kick){const remaining=formatMsClock(kick.expiresAt-now());return json({ok:false,code:'KICKED',error:`Você foi removido da sessão por ${kick.actorRole} ${kick.actorNick}. Kick temporário de ${kick.durationMinutes} min. Você poderá retornar em ${remaining}.`,kickUntil:kick.expiresAt,remainingMs:Math.max(0,kick.expiresAt-now())},403);}await logAttempt(env,login,true);await env.DB.prepare('UPDATE users SET last_login_at=? WHERE id=?').bind(now(),u.id).run();const token=await replaceSessionsWithNew(env,u.id);return json({ok:true,user:{id:u.id,nick:u.nick,login:u.login,role:normalizeRole(u.role)}},200,{'set-cookie':cookie(COOKIE,token)});}
async function apiAuthMe(req,env){const u=await authUser(req,env);return u?json({ok:true,user:{id:u.id,nick:u.nick,login:u.login,role:normalizeRole(u.role)}}):json({ok:false,error:'Não autenticado.'},401);}
async function apiAuthLogout(req,env){const token=parseCookie(req,COOKIE);if(token){const th=await sha256(token);await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(th).run();}return json({ok:true},200,{'set-cookie':clearCookie(COOKIE)});}

async function getRoomDO(env,id){return env.UOR_ROOM.get(env.UOR_ROOM.idFromName(id));}
async function apiRooms(req,env,user,ctx){
 await ensureRoomsSchema(env);
 const rows=await env.DB.prepare('SELECT id,name,max_players,host_user_id,players_json,game_active,updated_at,created_at,settings_json FROM rooms ORDER BY updated_at DESC LIMIT 100').all();
 // Always include the player's waiting room, even outside the 100 newest rooms.
 const own=user?await env.DB.prepare("SELECT id,name,max_players,host_user_id,players_json,game_active,updated_at,created_at,settings_json FROM rooms WHERE game_active=0 AND EXISTS(SELECT 1 FROM json_each(players_json) p WHERE json_extract(p.value,'$.id')=? AND COALESCE(json_extract(p.value,'$.abandoned'),0)=0) ORDER BY updated_at DESC LIMIT 1").bind(user.id).first():null;
 const list=rows.results||[];if(own&&!list.some(r=>r.id===own.id))list.push(own);
 const maintenance=Promise.all(list.filter(r=>!r.game_active).map(async r=>{const d=await getRoomDO(env,r.id);await d.fetch(new Request('https://uor-room/internal/waiting-check',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({roomId:r.id})}));})).catch(e=>console.error('UOR waiting maintenance',e));if(ctx?.waitUntil)ctx.waitUntil(maintenance);else await maintenance;
  return json({ok:true,rooms:list.map(roomPublic)});
}
function roomPublic(r){let players=[];try{players=JSON.parse(r.players_json||'[]')}catch{}let settings=DEFAULT_ROOM_SETTINGS;try{settings=normalizeRoomSettings(JSON.parse(r.settings_json||'{}'))}catch{}return {id:r.id,name:r.name,maxPlayers:r.max_players,hostConnId:r.host_user_id,players,settings,gameActive:!!r.game_active,updatedAt:r.updated_at,createdAt:r.created_at};}

async function reconcileRoomClaim(env,uid,rid){
 const d=await getRoomDO(env,rid),r=await d.fetch(new Request('https://uor-room/internal/membership',{method:'POST',headers:internalHeaders(env,uid),body:JSON.stringify({roomId:rid})}));
 if(!r.ok)throw Object.assign(new Error('Não foi possível confirmar sua sala. Tente novamente em instantes.'),{status:503});
 const data=await r.json();if(data.room)await syncRoomRow(env,rid,data.room);return !!data.member;
}
async function claimRoom(env,uid,rid){
 await ensureCommunitySchema(env);
 const prior=await env.DB.prepare('SELECT room_id,created_at FROM user_room_memberships WHERE user_id=?').bind(uid).first();
 if(prior&&prior.room_id!==rid){if(Number(prior.created_at)>now()-30000)return false;if(await reconcileRoomClaim(env,uid,prior.room_id))return false;}
 const existing=await env.DB.prepare("SELECT id FROM rooms WHERE id<>? AND EXISTS(SELECT 1 FROM json_each(players_json) p WHERE json_extract(p.value,'$.id')=? AND COALESCE(json_extract(p.value,'$.abandoned'),0)=0 AND COALESCE(json_extract(p.value,'$.eliminated'),0)=0) LIMIT 1").bind(rid,uid).first();if(existing&&await reconcileRoomClaim(env,uid,existing.id))return false;
 await env.DB.prepare('DELETE FROM user_room_memberships WHERE user_id=? AND created_at<? AND NOT EXISTS(SELECT 1 FROM rooms r WHERE r.id=user_room_memberships.room_id)').bind(uid,now()-300000).run();
 await env.DB.prepare('INSERT OR IGNORE INTO user_room_memberships(user_id,room_id,created_at) VALUES(?,?,?)').bind(uid,rid,now()).run();
 const slot=await env.DB.prepare('SELECT room_id FROM user_room_memberships WHERE user_id=?').bind(uid).first();return slot?.room_id===rid;
}
async function releaseRoomClaim(env,uid,rid){await env.DB.prepare('DELETE FROM user_room_memberships WHERE user_id=? AND room_id=?').bind(uid,rid).run();}

async function apiCreateRoom(req,env,user){await ensureRoomsSchema(env);const suspension=await getActiveSuspension(env,user.id);if(suspension)return json({ok:false,error:`Você está suspenso por deserção até ${new Date(suspension.expiresAt).toLocaleString('pt-BR')}.`},403);const b=await body(req),color=COLORS.includes(b.color)?b.color:COLORS[0],settings=normalizeRoomSettings(b.settings),name=`Sala do Jogador ${user.nick} — ${COLOR_LABELS[color]||color}`,max=6;const st=await env.DB.prepare('SELECT points FROM user_stats WHERE user_id=?').bind(user.id).first();const rankId=rankFor(Number(st?.points||0)).id;const id=uuid();if(!await claimRoom(env,user.id,id))return json({ok:false,error:'Você já está em uma sala.'},409);try{const ts=now(),player={id:user.id,connId:user.id,name:user.nick,color,rankId,role:normalizeRole(user.role),ready:true,eliminated:false};await env.DB.prepare('INSERT INTO rooms(id,name,max_players,host_user_id,players_json,game_active,updated_at,created_at,settings_json) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,name,max,user.id,JSON.stringify([player]),0,ts,ts,JSON.stringify(settings)).run();const d=await getRoomDO(env,id);const initialized=await d.fetch(new Request('https://uor-room/internal/init',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({id,name,maxPlayers:max,hostConnId:user.id,players:[player],settings})}));if(!initialized.ok)throw new Error('Falha ao iniciar a sala.');const data=await initialized.json();return json({ok:true,room:data.room});}catch(error){await releaseRoomClaim(env,user.id,id);await env.DB.prepare('DELETE FROM rooms WHERE id=?').bind(id).run();throw error;}}
async function apiJoinRoom(req,env,user,roomId){
 await ensureRoomsSchema(env);const suspension=await getActiveSuspension(env,user.id);if(suspension)return json({ok:false,error:`Você está suspenso por deserção até ${new Date(suspension.expiresAt).toLocaleString('pt-BR')}.`},403);
 const b=await body(req),color=COLORS.includes(b.color)?b.color:COLORS[0],st=await env.DB.prepare('SELECT points FROM user_stats WHERE user_id=?').bind(user.id).first(),rankId=rankFor(Number(st?.points||0)).id,d=await getRoomDO(env,roomId);
 if(!await claimRoom(env,user.id,roomId))return json({ok:false,error:'Você já está em outra sala.'},409);
 try{
  const r=await d.fetch(new Request('https://uor-room/internal/join',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({userId:user.id,name:user.nick,color,rankId,role:normalizeRole(user.role)})}));
  if(!r.ok){await reconcileRoomClaim(env,user.id,roomId);return r;}
  const data=await r.json();await syncRoomRow(env,roomId,data.room);return json({ok:true,room:data.room,assignedColor:data.assignedColor||color});
 }catch(error){try{await reconcileRoomClaim(env,user.id,roomId);}catch{}throw error;}
}

async function apiWaitingRoom(req,env,user){
 await ensureCommunitySchema(env);await ensureRoomsSchema(env);
 const slot=await env.DB.prepare('SELECT room_id FROM user_room_memberships WHERE user_id=?').bind(user.id).first();
 const rows=await env.DB.prepare("SELECT id FROM rooms WHERE game_active=0 AND EXISTS(SELECT 1 FROM json_each(players_json) p WHERE json_extract(p.value,'$.id')=? AND COALESCE(json_extract(p.value,'$.abandoned'),0)=0) ORDER BY updated_at DESC").bind(user.id).all();
 const ids=[...new Set([slot?.room_id,...(rows.results||[]).map(r=>r.id)].filter(Boolean))];
 for(const id of ids){
  const d=await getRoomDO(env,id),response=await d.fetch(new Request('https://uor-room/internal/membership',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({roomId:id})}));
  if(!response.ok)throw Object.assign(new Error('Não foi possível recuperar sua sala. Tente reconectar.'),{status:503});
  const data=await response.json(),room=data.room;
  if(!data.member||!room)continue;
  if(room.gameActive)return json({ok:true,room:null});
  if(room.id!==id)throw Object.assign(new Error('Não foi possível confirmar sua sala.'),{status:503});
  await env.DB.prepare('INSERT OR IGNORE INTO user_room_memberships(user_id,room_id,created_at) VALUES(?,?,?)').bind(user.id,id,now()).run();
  const claimed=await env.DB.prepare('SELECT room_id FROM user_room_memberships WHERE user_id=?').bind(user.id).first();
  if(claimed?.room_id!==id)throw Object.assign(new Error('Seu vínculo de sala precisa ser confirmado. Tente novamente.'),{status:409});
  await env.DB.prepare('INSERT OR IGNORE INTO rooms(id,name,max_players,host_user_id,players_json,game_active,updated_at,created_at,settings_json) VALUES(?,?,?,?,?,?,?,?,?)').bind(id,room.name,room.maxPlayers,room.hostConnId,JSON.stringify(room.players||[]),0,now(),now(),JSON.stringify(room.settings||{})).run();
  await syncRoomRow(env,id,room);
  return json({ok:true,room});
 }
 return json({ok:true,room:null});
}
async function apiActiveMatch(req,env,user){
  await ensureRoomsSchema(env);
  const rows=await env.DB.prepare("SELECT id,name,max_players,host_user_id,players_json,game_active,updated_at,created_at,settings_json FROM rooms WHERE game_active=1 AND EXISTS (SELECT 1 FROM json_each(players_json) p WHERE json_extract(p.value,'$.id')=? AND COALESCE(json_extract(p.value,'$.abandoned'),0)=0 AND COALESCE(json_extract(p.value,'$.eliminated'),0)=0) ORDER BY updated_at DESC").bind(user.id).all();
  for(const r of rows.results||[]){let players=[];try{players=JSON.parse(r.players_json||'[]')}catch{};if(!players.some(p=>p.id===user.id))continue;const d=await getRoomDO(env,r.id);const rr=await d.fetch(new Request('https://uor-room/internal/status',{method:'POST',headers:internalHeaders(env,user.id),body:'{}'}));if(!rr.ok)continue;const data=await rr.json();if(data.active&&data.player&&!data.player.abandoned&&!data.player.eliminated)return json({ok:true,match:data});}
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
async function syncRoomRow(env,roomId,room){await ensureRoomsSchema(env);const settings=normalizeRoomSettings(room?.settings);await env.DB.prepare('UPDATE rooms SET name=?,max_players=?,host_user_id=?,players_json=?,game_active=?,updated_at=?,settings_json=? WHERE id=?').bind(room.name||'Sala',room.maxPlayers||4,room.hostConnId||room.players?.[0]?.id||null,JSON.stringify(room.players||[]),room.gameActive?1:0,now(),JSON.stringify(settings),roomId).run();await env.DB.prepare("DELETE FROM user_room_memberships WHERE room_id=? AND user_id NOT IN(SELECT json_extract(value,'$.id') FROM json_each(?) WHERE COALESCE(json_extract(value,'$.abandoned'),0)=0 AND COALESCE(json_extract(value,'$.eliminated'),0)=0)").bind(roomId,JSON.stringify(room.players||[])).run();}
async function cleanupGlobalChat(env){
  await ensureModerationSchema(env);
  await env.DB.prepare('DELETE FROM chat_messages').run();
}
async function personalMuteIds(env,uid){await ensureCommunitySchema(env);const rows=await env.DB.prepare('SELECT target_user_id FROM user_chat_mutes WHERE user_id=?').bind(uid).all();return (rows.results||[]).map(r=>r.target_user_id);}
async function apiPersonalMutes(req,env,user){
 await ensureCommunitySchema(env);
 if(req.method==='GET'){const players=await env.DB.prepare('SELECT u.id,u.nick,u.role FROM user_chat_mutes m JOIN users u ON u.id=m.target_user_id WHERE m.user_id=?').bind(user.id).all();return json({ok:true,ids:(players.results||[]).map(p=>p.id),players:players.results||[]});}
 if(req.method!=='POST')return json({ok:false,error:'Método inválido.'},405);
 const b=await body(req);if(typeof b.userId!=='string'||b.userId===user.id||typeof b.muted!=='boolean')return json({ok:false,error:'Jogador inválido.'},400);
 if(b.muted){const target=await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(b.userId).first();if(!target)return json({ok:false,error:'Jogador não encontrado.'},404);await env.DB.prepare('INSERT OR IGNORE INTO user_chat_mutes(user_id,target_user_id,created_at) VALUES(?,?,?)').bind(user.id,b.userId,now()).run();}
 else await env.DB.prepare('DELETE FROM user_chat_mutes WHERE user_id=? AND target_user_id=?').bind(user.id,b.userId).run();
 // Fan out to connected lobby/room objects, including moderator spectators.
 const rows=await (isStaffOrAdmin(user)?env.DB.prepare('SELECT id FROM rooms'):env.DB.prepare("SELECT id FROM rooms WHERE EXISTS(SELECT 1 FROM json_each(players_json) p WHERE json_extract(p.value,'$.id')=?)").bind(user.id)).all();for(const id of ['__uor_lobby_presence__',...(rows.results||[]).map(r=>r.id)]){try{const d=await getRoomDO(env,id);await d.fetch(new Request('https://uor-room/internal/personal-mutes-updated',{method:'POST',headers:internalHeaders(env,user.id),body:'{}'}));}catch(e){console.error('Mute delivery failed',e);}}
 const players=await env.DB.prepare('SELECT u.id,u.nick,u.role FROM user_chat_mutes m JOIN users u ON u.id=m.target_user_id WHERE m.user_id=?').bind(user.id).all();return json({ok:true,ids:(players.results||[]).map(p=>p.id),players:players.results||[]});
}

async function hasChatConsent(env,uid){await ensureCommunitySchema(env);return !!await env.DB.prepare('SELECT user_id FROM user_consents WHERE user_id=? AND version=?').bind(uid,LEGAL_VERSION).first();}
async function apiTerms(req,env,user){await ensureCommunitySchema(env);if(req.method==='GET')return json({ok:true,accepted:await hasChatConsent(env,user.id),version:LEGAL_VERSION});if(req.method!=='POST')return json({ok:false},405);const b=await body(req);if(b.accept!==true||b.version!==LEGAL_VERSION)return json({ok:false,error:'Leia e aceite os termos atuais.'},400);await env.DB.prepare('INSERT INTO user_consents(user_id,version,accepted_at) VALUES(?,?,?) ON CONFLICT(user_id) DO UPDATE SET version=excluded.version,accepted_at=excluded.accepted_at').bind(user.id,LEGAL_VERSION,now()).run();return json({ok:true,accepted:true});}
async function apiReports(req,env,user){
 await ensureCommunitySchema(env);await env.DB.prepare('DELETE FROM user_reports WHERE created_at<?').bind(now()-90*86400000).run();
 const moderation=new URL(req.url).pathname==='/api/moderation/reports';
 if(moderation){if(!isStaffOrAdmin(user))return json({ok:false,error:'Somente STAFF/ADMIN.'},403);if(req.method==='GET'){const rows=await env.DB.prepare('SELECT r.*,u.nick targetNick FROM user_reports r LEFT JOIN users u ON u.id=r.target_id ORDER BY r.created_at DESC LIMIT 100').all();return json({ok:true,reports:rows.results||[]});}if(req.method!=='POST')return json({ok:false},405);const b=await body(req);if(!['reviewed','dismissed'].includes(b.status))return json({ok:false},400);await env.DB.prepare('UPDATE user_reports SET status=?,reviewed_by=?,reviewed_at=? WHERE id=?').bind(b.status,user.id,now(),String(b.id||'')).run();return json({ok:true});}
 if(req.method!=='POST')return json({ok:false},405);const b=await body(req),target=String(b.userId||''),reason=String(b.reason||'').trim(),roomId=String(b.roomId||'').slice(0,100);if(target===user.id||reason.length<5||reason.length>500||!await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(target).first())return json({ok:false,error:'Informe um jogador e um motivo de 5 a 500 caracteres.'},400);
 const recent=await env.DB.prepare('SELECT COUNT(*) c FROM user_reports WHERE reporter_id=? AND created_at>?').bind(user.id,now()-600000).first();if(Number(recent?.c||0)>=5)return json({ok:false,error:'Aguarde antes de enviar novas denúncias.'},429);
 let evidence='Denúncia de jogador; sem mensagem associada.';
 if(b.messageId!=null){let message;if(roomId){const d=await getRoomDO(env,roomId);const r=await d.fetch(new Request('https://uor-room/internal/report-evidence',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify({messageId:String(b.messageId),targetId:target})}));if(r.ok)message=(await r.json()).entry;}else message=await env.DB.prepare('SELECT id,user_id userId,nick name,text,ts FROM chat_messages WHERE id=? AND user_id=? AND system=0').bind(String(b.messageId),target).first();if(!message)return json({ok:false,error:'Mensagem não disponível. Denuncie o jogador pelo menu do perfil.'},400);evidence=JSON.stringify(message);}
 await env.DB.prepare('INSERT INTO user_reports(id,reporter_id,target_id,reason,evidence,room_id,created_at) VALUES(?,?,?,?,?,?,?)').bind(uuid(),user.id,target,reason,evidence,roomId||null,now()).run();return json({ok:true});
}

async function apiChat(req,env,user){
  await ensureCommunitySchema(env);
  if(req.method==='GET'){
    await env.DB.prepare('DELETE FROM chat_messages WHERE ts<?').bind(now()-GLOBAL_CHAT_RESET_MS).run();
    const rows=await env.DB.prepare('SELECT c.id,c.user_id userId,c.nick name,c.color,c.text,c.ts,c.system,s.points,u.role FROM chat_messages c LEFT JOIN user_stats s ON s.user_id=c.user_id LEFT JOIN users u ON u.id=c.user_id WHERE c.system=1 OR NOT EXISTS(SELECT 1 FROM user_chat_mutes m WHERE m.user_id=? AND m.target_user_id=c.user_id) ORDER BY c.id DESC LIMIT 200').bind(user.id).all();
    return json({ok:true,chat:(rows.results||[]).reverse().map(x=>({...x,system:!!x.system,rankId:rankFor(Number(x.points||0)).id,role:normalizeRole(x.role)}))});
  }
  if(!await hasChatConsent(env,user.id))return json({ok:false,error:'Leia e aceite os termos antes de usar o chat.'},403);
  const mute=await getActiveMute(env,user.id);if(mute)return json({ok:false,error:`Você está silenciado por mais ${Math.max(1,Math.ceil((mute.expiresAt-now())/60000))} minuto(s).`},403);
  const recent=await env.DB.prepare('SELECT COUNT(*) c FROM chat_messages WHERE user_id=? AND ts>?').bind(user.id,now()-10000).first();if(Number(recent?.c||0)>=8)return json({ok:false,error:'Aguarde antes de enviar mais mensagens.'},429);
  const b=await body(req),text=String(b.text||'').trim().slice(0,400);if(!text)return json({ok:false,error:'Mensagem vazia.'},400);
  const st=await env.DB.prepare('SELECT points FROM user_stats WHERE user_id=?').bind(user.id).first();const entry={userId:user.id,name:user.nick,color:COLORS.includes(b.color)?b.color:COLORS[0],rankId:rankFor(Number(st?.points||0)).id,role:normalizeRole(user.role),text,ts:now(),system:false};
  const inserted=await env.DB.prepare('INSERT INTO chat_messages(user_id,nick,color,text,ts) VALUES(?,?,?,?,?)').bind(user.id,user.nick,entry.color,text,entry.ts).run();entry.id=inserted.meta?.last_row_id;await env.DB.prepare('DELETE FROM chat_messages WHERE ts<? OR id NOT IN (SELECT id FROM chat_messages ORDER BY id DESC LIMIT 200)').bind(now()-GLOBAL_CHAT_RESET_MS).run();const cleanup=await getRoomDO(env,'__uor_lobby_presence__');const scheduled=await cleanup.fetch(new Request('https://uor-room/internal/schedule-chat-cleanup',{method:'POST',headers:internalHeaders(env,user.id),body:'{}'}));if(!scheduled.ok)throw new Error('Falha ao agendar limpeza do chat.');return json({ok:true,entry});
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
  const allowed=isAdmin(user)?[0,5,10,20,30]:[0,5,30];
  const minutes=Number(b.minutes??0);
  if(!allowed.includes(minutes))return json({ok:false,error:'Duração de Kick não permitida para este cargo.'},403);
  await ensureModerationSchema(env);
  const target=await env.DB.prepare('SELECT id,nick,role FROM users WHERE id=?').bind(targetId).first();
  if(!target)return json({ok:false,error:'Jogador não encontrado.'},404);
  if(target.role==='ADMIN'&&user.role!=='ADMIN')return json({ok:false,error:'STAFF não pode expulsar uma conta ADMIN.'},403);

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
async function apiModerationActive(req,env,user){
  if(!isStaffOrAdmin(user))return json({ok:false,error:'Sem permissão.'},403);
  await ensureDesertionSchema(env);
  const url=new URL(req.url),kind=String(url.searchParams.get('kind')||'').trim().toLowerCase(),q=String(url.searchParams.get('q')||'').trim().toLowerCase(),ts=now();
  if(kind==='mutes'){
    await env.DB.prepare('DELETE FROM user_mutes WHERE expires_at<=?').bind(ts).run();
    const sql=`SELECT u.id,u.nick,u.role,m.expires_at FROM user_mutes m JOIN users u ON u.id=m.user_id WHERE m.expires_at>? ${q?'AND lower(u.nick) LIKE ?':''} ORDER BY u.nick COLLATE NOCASE LIMIT 200`;
    const rows=q?await env.DB.prepare(sql).bind(ts,`%${q}%`).all():await env.DB.prepare(sql).bind(ts).all();
    return json({ok:true,kind,users:(rows.results||[]).filter(x=>!(user.role==='STAFF'&&normalizeRole(x.role)==='ADMIN')).map(x=>({id:x.id,nick:x.nick,role:normalizeRole(x.role),expiresAt:Number(x.expires_at||0)}))});
  }
  if(kind==='suspensions'){
    if(!isAdmin(user))return json({ok:false,error:'Somente ADMIN pode remover suspensões.'},403);
    await env.DB.prepare('DELETE FROM user_suspensions WHERE expires_at<=?').bind(ts).run();
    const sql=`SELECT u.id,u.nick,u.role,s.expires_at,s.level,s.reason FROM user_suspensions s JOIN users u ON u.id=s.user_id WHERE s.expires_at>? ${q?'AND lower(u.nick) LIKE ?':''} ORDER BY u.nick COLLATE NOCASE LIMIT 200`;
    const rows=q?await env.DB.prepare(sql).bind(ts,`%${q}%`).all():await env.DB.prepare(sql).bind(ts).all();
    return json({ok:true,kind,users:(rows.results||[]).map(x=>({id:x.id,nick:x.nick,role:normalizeRole(x.role),expiresAt:Number(x.expires_at||0),level:Number(x.level||1),reason:String(x.reason||'deserção')}))});
  }
  return json({ok:false,error:'Tipo de lista inválido.'},400);
}

async function apiAdminUsers(req,env,user){
  if(!isAdmin(user))return json({ok:false,error:'Somente ADMIN pode gerenciar cargos.'},403);
  await ensureDesertionSchema(env);
  const url=new URL(req.url),q=String(url.searchParams.get('q')||'').trim().toLowerCase(),limit=safeLimit(url.searchParams.get('limit'),100,100),ts=now();
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
async function apiRanking(req,env){const url=new URL(req.url),limit=safeLimit(url.searchParams.get('limit'),50,100);const rows=await env.DB.prepare(`SELECT u.id,u.nick,u.role,s.points,s.games,s.wins,s.win_streak FROM user_stats s JOIN users u ON u.id=s.user_id ORDER BY s.points DESC,s.wins DESC,s.games ASC,u.created_at ASC LIMIT ?`).bind(limit).all();return json({ok:true,ranking:(rows.results||[]).map((x,i)=>({position:i+1,id:x.id,nick:x.nick,role:normalizeRole(x.role),points:Number(x.points),games:Number(x.games),wins:Number(x.wins),winStreak:Number(x.win_streak),rank:rankFor(Number(x.points))}))});}
async function apiPublicProfile(req,env,viewerId){const url=new URL(req.url),userId=String(url.searchParams.get('userId')||'').trim();if(!userId)return json({ok:false,error:'Jogador não informado.'},400);const row=await env.DB.prepare('SELECT u.id,u.nick,u.role,s.points,s.games,s.wins,s.losses,s.abandons,s.win_streak,s.best_streak,s.total_conquests,s.total_armies_destroyed,s.total_turns FROM users u JOIN user_stats s ON s.user_id=u.id WHERE u.id=?').bind(userId).first();if(!row)return json({ok:false,error:'Jogador não encontrado.'},404);const r=rankFor(Number(row.points||0));const pos=await env.DB.prepare('SELECT COUNT(*) c FROM user_stats WHERE points>?').bind(Number(row.points||0)).first();const ach=await env.DB.prepare('SELECT a.id,a.name,a.description,ua.unlocked_at FROM user_achievements ua JOIN achievements a ON a.id=ua.achievement_id WHERE ua.user_id=? ORDER BY ua.unlocked_at').bind(userId).all();return json({ok:true,user:{id:row.id,nick:row.nick,login:null,role:normalizeRole(row.role)},stats:{points:Number(row.points||0),games:Number(row.games||0),wins:Number(row.wins||0),losses:Number(row.losses||0),abandons:Number(row.abandons||0),winStreak:Number(row.win_streak||0),bestStreak:Number(row.best_streak||0),totalConquests:Number(row.total_conquests||0),totalArmiesDestroyed:Number(row.total_armies_destroyed||0),totalTurns:Number(row.total_turns||0)},rank:r,rankingPosition:Number(pos?.c||0)+1,achievements:ach.results||[]});}
function historyPublicRow(h){let details=null;try{details=JSON.parse(h.details_json||'null');}catch{}return {id:h.id,result:h.result,playersCount:h.players_count,opponentNames:JSON.parse(h.opponent_names||'[]'),pointsDelta:h.points_delta,rankAfter:h.rank_after,finishedAt:h.finished_at,roomName:h.room_name,details};}
async function readHistory(env,userId,limit){await ensureResultSchema(env);const rows=await env.DB.prepare('SELECT h.*,d.details_json FROM match_history h LEFT JOIN match_history_details d ON d.history_id=h.id WHERE h.user_id=? ORDER BY h.finished_at DESC LIMIT ?').bind(userId,limit).all();return (rows.results||[]).map(historyPublicRow);}
async function apiPublicHistory(req,env,viewerId){const url=new URL(req.url),userId=String(url.searchParams.get('userId')||'').trim(),limit=safeLimit(url.searchParams.get('limit'),20,50);if(!userId)return json({ok:false,error:'Jogador não informado.'},400);if(!await env.DB.prepare('SELECT id FROM users WHERE id=?').bind(userId).first())return json({ok:false,error:'Jogador não encontrado.'},404);return json({ok:true,history:await readHistory(env,userId,limit)});}
async function apiHistory(req,env,user){const url=new URL(req.url);return json({ok:true,history:await readHistory(env,user.id,safeLimit(url.searchParams.get('limit'),50,100))});}

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
function checkWinner(state){if(state.pendingConquestTransfer)return null;normalizeObjectives(state);const active=state.players.filter(p=>!p.eliminated);if(active.length===1)return active[0].id;for(const p of active)if(objectiveWinner(state,p))return p.id;return null;}
function checkElims(state){for(const p of state.players){if(p.eliminated)continue;if(!TERRITORIES.some(t=>state.territories[t.id].owner===p.id)){p.eliminated=true;const h=state.hands[p.id]||[];state.discardPile.push(...h);state.hands[p.id]=[];state.log.push(`${p.name} foi eliminado da batalha.`);}}}
function stateSafeObjectivePool(players){return players.length>3?OBJECTIVE_POOL.slice():OBJECTIVE_POOL.filter(o=>o.type!=='territories');}
function makeObjective(state,p,source){let pool=Array.isArray(source)&&source.length?source:OBJECTIVE_POOL.slice();if(!pool.length)pool=OBJECTIVE_POOL.slice();let o=structuredClone(pool[Math.floor(Math.random()*pool.length)]);if(o.type==='eliminate'){const targets=state.players.filter(x=>x.id!==p.id&&x.color);const target=targets[Math.floor(Math.random()*Math.max(1,targets.length))];o.targetColor=target?.color||'';o.text=o.text.replace('{COLOR}',target?.name||'Jogador');}return o;}
function setLastAction(state,p,kind,data={}){if(!state)return null;const playerId=p?.id||p?.connId||null;state.lastAction={kind,byConnId:playerId,playerName:p?.name||'Jogador',ts:now(),...data};return state.lastAction;}
function setTurnStartAction(state,p){if(p)setLastAction(state,p,'turnStart',{phase:state.phase});}
function initGame(room){const settings=normalizeRoomSettings(room?.settings);if(settings.mode==='ranked'&&room.players.some(p=>p.isBot))throw new Error('Ranqueado não permite bots.');const players=room.players.map(p=>({...p,id:p.id,connId:p.id,eliminated:false,conqueredThisTurn:false}));const ids=shuffle(TERRITORIES.map(t=>t.id));const terr={};ids.forEach((tid,i)=>terr[tid]={owner:players[i%players.length].id,armies:1});const setup={};const start=STARTING_ARMIES[players.length]||20;for(const p of players){const owned=Object.values(terr).filter(x=>x.owner===p.id).length;setup[p.id]=Math.max(0,start-owned);}const objectivePool=stateSafeObjectivePool(players);const objectiveDeck=shuffle(objectivePool.slice());const objectives={};players.forEach((p,i)=>objectives[p.id]=makeObjective({players},p,[objectiveDeck[i%objectiveDeck.length]]));const state={version:GAME_VERSION,matchMode:settings.mode,roomId:room.id,roomName:room.name,maxPlayers:room.maxPlayers,hostConnId:room.hostConnId,settings,players,territories:terr,turnIndex:0,turnNumber:1,phase:'setup',setupRemaining:setup,reinforcementsRemaining:0,reinforcementStage:'free',continentBonusRemaining:{},pendingFreeReinforcements:0,objectives,deck:[],discardPile:[],hands:{},airAttackCards:{},airAttackPending:null,cardTradeCount:0,cardTradeStats:Object.fromEntries(players.map(p=>[p.id,{trades:0,lastReward:0,lastAt:0,airStored:0}])),usedFortifyTerritories:[],fortifyLockedTerritories:[],pendingConquestTransfer:null,lastAttackAt:{},lastCombat:null,lastAction:{kind:'turnStart',byConnId:players[0]?.id||null,playerName:players[0]?.name||'Jogador',phase:'setup',ts:now()},playerStats:Object.fromEntries(players.map(p=>[p.id,{conquests:0,armiesDestroyed:0}])),log:['Distribuição inicial iniciada.'],winner:null,annulled:false,finishedAt:null,resultRecorded:false,resultRecordError:null,startedAt:now(),updatedAt:now()};for(const p of players)state.hands[p.id]=[];state.deck=shuffle(TERRITORIES.map(t=>({id:`card_${t.id}`,territoryId:t.id,name:t.name,symbol:null})));return state;}
function drawCard(state,id){const hand=state.hands?.[id]||[];const rules=normalizeRoomSettings(state?.settings);if(rules.cardLimit!=='unlimited'&&hand.length>=5)return null;if(!state.deck.length){if(!state.discardPile.length)return null;state.deck=shuffle(state.discardPile.splice(0));}const c=state.deck.pop();const hasAir=Number(state.airAttackCards?.[id]||0)>0 || hand.some(x=>x.symbol===AIR);c.symbol=(rules.airAttackEnabled&&!hasAir&&Math.random()<0.20)?AIR:CARD_SYMBOLS[Math.floor(Math.random()*3)];state.hands[id]=hand;state.hands[id].push(c);return c;}
function validSet(cards){if(cards.length!==3)return false;const s=cards.map(c=>c.symbol);return s.every(x=>x===s[0])||new Set(s).size===3;}
function tradeValue(state){const n=Number(state.cardTradeCount||0);return n<6?TRADE_VALUES[n]:15+(n-5)*5;}
function advanceSetup(state){
 if(Object.values(state.setupRemaining).every(v=>v<=0)){state.phase='ataque';state.turnIndex=0;state.log.push('Distribuição concluída — começa a fase de ataque!');setTurnStartAction(state,state.players[state.turnIndex]);return;}
 for(let i=1;i<=state.players.length;i++){const idx=(state.turnIndex+i)%state.players.length;if((state.setupRemaining[state.players[idx].id]||0)>0){state.turnIndex=idx;break;}}
 setTurnStartAction(state,state.players[state.turnIndex]);
}
function endTurn(state){
 const p=state.players[state.turnIndex];
 if(p?.conqueredThisTurn){drawCard(state,p.id);p.conqueredThisTurn=false;}
 state.usedFortifyTerritories=[];state.fortifyLockedTerritories=[];
 let idx=state.turnIndex;for(let i=1;i<=state.players.length;i++){const n=(idx+i)%state.players.length;if(!state.players[n].eliminated){idx=n;break;}}
 if(idx<=state.turnIndex)state.turnNumber++;state.turnIndex=idx;const cp=state.players[idx];
 state.phase=state.turnNumber===1?'ataque':'reforco';
 if(state.phase==='reforco'){beginReinforcementPhase(state,cp.id);}else{state.reinforcementStage='free';state.continentBonusRemaining={};state.pendingFreeReinforcements=0;state.reinforcementsRemaining=0;}
 state.log.push(`Vez de ${cp.name}.`);setTurnStartAction(state,cp);
}
function resolveAttackCombat(state,p,fromId,toId,requestedDice){
 const t=state.territories,from=t[fromId],to=t[toId];
 if(!validTerritoryId(fromId)||!validTerritoryId(toId)||!from||!to||from.owner!==p.id||to.owner===p.id||!adjacent(fromId,toId)||!Number.isSafeInteger(from.armies)||!Number.isSafeInteger(to.armies)||from.armies<2||to.armies<1)return null;
 const maxDice=Math.min(3,from.armies-1);
 let dice=maxDice;
 if(requestedDice!==undefined&&requestedDice!==null){const requested=strictPositiveInt(requestedDice);if(!requested||requested>maxDice)return null;dice=requested;}
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
 setLastAction(state,attacker,'airAttack',{toId:pending.toId,destroyed,conquered:true});
 state.log.push(`${attacker.name} lançou um Ataque Aéreo contra ${T[pending.toId].name}: todos os inimigos foram eliminados — território conquistado!`);
 checkElims(state);
 return state;
}

function applyAction(state,a,trustedAi=false){
 if(!state||!isPlainObject(a)||state.winner||state.annulled||state.finishedAt||state.resultRecorded||state.airAttackPending)return null;
 const p=state.players?.[state.turnIndex];
 if(!p||p.id!==a.byConnId||p.eliminated||(p.abandoned&&!trustedAi)||(trustedAi&&!p.aiControlled))return null;
 const t=state.territories;
 if(!t||!isPlainObject(t))return null;

 if(a.kind==='setupPlace'){
  if(state.phase!=='setup'||!validTerritoryId(a.territoryId))return null;
  const rem=Number(state.setupRemaining?.[p.id]||0),x=t[a.territoryId],n=strictPositiveInt(a.amount);
  if(!Number.isSafeInteger(rem)||rem<=0||!x||x.owner!==p.id||!Number.isSafeInteger(x.armies)||!n||n>rem)return null;
  x.armies+=n;state.setupRemaining[p.id]-=n;
  setLastAction(state,p,'setupPlace',{territoryId:a.territoryId,amount:n,remaining:Number(state.setupRemaining[p.id]||0)});
  if(state.setupRemaining[p.id]===0)advanceSetup(state);
  return state;
 }
 if(a.kind==='reinforce'){
  if(state.phase!=='reforco'||!validTerritoryId(a.territoryId))return null;
  ensureReinforcementState(state,p.id);
  const remaining=Number(state.reinforcementsRemaining||0),x=t[a.territoryId],n=strictPositiveInt(a.amount);
  if(!Number.isSafeInteger(remaining)||remaining<=0||!x||x.owner!==p.id||!Number.isSafeInteger(x.armies)||!n||n>remaining)return null;
  if((state.reinforcementStage||'free')==='continent'){
   const cid=T[a.territoryId]?.continent,available=Number(state.continentBonusRemaining?.[cid]||0);
   if(!cid||!Number.isSafeInteger(available)||available<=0||n>available)return null;
   x.armies+=n;state.continentBonusRemaining[cid]=available-n;state.reinforcementsRemaining-=n;
   setLastAction(state,p,'reinforce',{territoryId:a.territoryId,amount:n,remaining:Number(state.reinforcementsRemaining||0),continentId:cid,continentName:CONTINENTS[cid]?.name||''});
   finishContinentBonusStage(state);return state;
  }
  x.armies+=n;state.reinforcementsRemaining-=n;
  setLastAction(state,p,'reinforce',{territoryId:a.territoryId,amount:n,remaining:Number(state.reinforcementsRemaining||0)});
  return state;
 }
 if(a.kind==='endReinforcePhase'){
  if(state.phase!=='reforco')return null;
  if((state.reinforcementStage||'free')==='continent')finishContinentBonusStage(state);
  if(state.reinforcementStage!=='free'||Number(state.reinforcementsRemaining||0)>0)return null;
  state.phase='ataque';setLastAction(state,p,'phaseChange',{from:'reforco',to:'ataque'});return state;
 }
 if(a.kind==='attack'){
  if(state.phase!=='ataque'||state.pendingConquestTransfer||!validTerritoryId(a.fromId)||!validTerritoryId(a.toId))return null;
  const from=t[a.fromId],to=t[a.toId];
  if(!from||!to||from.owner!==p.id||to.owner===p.id||!adjacent(a.fromId,a.toId)||!Number.isSafeInteger(from.armies)||!Number.isSafeInteger(to.armies)||from.armies<2||to.armies<1)return null;
  const maxDice=Math.min(3,from.armies-1),requestedDice=strictPositiveInt(a.dice);
  if(!requestedDice||requestedDice>maxDice)return null;
  const last=Number(state.lastAttackAt?.[p.id]||0);if(now()-last<1000)return null;
  const combat=resolveAttackCombat(state,p,a.fromId,a.toId,requestedDice);if(!combat)return null;
  state.lastAttackAt[p.id]=now();
  state.playerStats[p.id].armiesDestroyed+=combat.defLoss;
  if(combat.conquered){state.playerStats[p.id].conquests++;to.owner=p.id;to.armies=0;p.conqueredThisTurn=true;state.pendingConquestTransfer={fromId:a.fromId,toId:a.toId,maxTransfer:combat.dice};}
  state.lastCombat=combat;setLastAction(state,p,'attack',{fromId:a.fromId,toId:a.toId,dice:combat.dice,atkRolls:combat.atkRolls,defRolls:combat.defRolls,atkLoss:combat.atkLoss,defLoss:combat.defLoss,conquered:combat.conquered});
  state.log.push(`${p.name} atacou ${T[a.toId].name}: ${combat.atkRolls.join(',')} x ${combat.defRolls.join(',')}${combat.conquered?' — território conquistado!':''}`);
  checkElims(state);return state;
 }
 if(a.kind==='unitedAttack'){
  if(state.phase!=='ataque'||state.pendingConquestTransfer||!validTerritoryId(a.toId))return null;
  const targetId=a.toId,target=t[targetId],rawFromIds=Array.isArray(a.fromIds)?a.fromIds:[];
  if(rawFromIds.some(id=>!validTerritoryId(id)))return null;
  const fromIds=[...new Set(rawFromIds)];
  if(!target||target.owner===p.id||!Number.isSafeInteger(target.armies)||target.armies<1||fromIds.length<2)return null;
  const last=Number(state.lastAttackAt?.[p.id]||0);if(now()-last<1000)return null;
  for(const fromId of fromIds){const from=t[fromId];if(!from||from.owner!==p.id||!Number.isSafeInteger(from.armies)||from.armies<2||!adjacent(fromId,targetId))return null;}
  const totalAvailable=fromIds.reduce((sum,id)=>sum+Math.max(0,t[id].armies-1),0);if(totalAvailable<1)return null;
  const dice=Math.min(3,totalAvailable),defDice=Math.min(3,target.armies);if(defDice<1)return null;
  const atkRolls=roll(dice).sort((x,y)=>y-x),defRolls=roll(defDice).sort((x,y)=>y-x);
  let atkLoss=0,defLoss=0;for(let i=0;i<Math.min(atkRolls.length,defRolls.length);i++){if(atkRolls[i]>defRolls[i])defLoss++;else atkLoss++;}
  const capacities=fromIds.map(id=>Math.max(0,t[id].armies-1));if(capacities.reduce((a,b)=>a+b,0)<atkLoss)return null;
  state.lastAttackAt[p.id]=now();
  const atkLossBySource={};let remainingLoss=atkLoss;
  for(let i=0;i<fromIds.length;i++){const fromId=fromIds[i],from=t[fromId],loss=Math.min(capacities[i],remainingLoss);if(loss>0)from.armies-=loss;atkLossBySource[fromId]=loss;remainingLoss-=loss;if(remainingLoss<=0)break;}
  const before=target.armies,after=Math.max(0,before-defLoss),conquered=after===0;target.armies=conquered?0:Math.max(1,after);
  state.playerStats[p.id].armiesDestroyed+=defLoss;
  if(conquered){state.playerStats[p.id].conquests++;target.owner=p.id;target.armies=0;p.conqueredThisTurn=true;state.pendingConquestTransfer={fromId:fromIds[0],fromIds,toId:targetId,maxTransfer:dice};}
  const combat={fromId:fromIds[0],fromIds,toId:targetId,atkRolls,defRolls,atkLoss,defLoss,atkLossBySource,conquered,dice,unitedAttack:true,ts:now()};
  state.lastUnitedCombats=[combat];state.lastCombat=combat;setLastAction(state,p,'unitedAttack',{fromIds,toId:targetId,dice,atkRolls,defRolls,atkLoss,defLoss,conquered});
  state.log.push(`${p.name} realizou um Ataque Unido contra ${T[targetId].name} com ${fromIds.length} país(es): ${fromIds.map(id=>T[id].name).join(', ')}${conquered?' — território conquistado!':''}`);
  checkElims(state);return state;
 }
 if(a.kind==='conquestTransfer'){
  if(state.phase!=='ataque'||!validTerritoryId(a.fromId)||!validTerritoryId(a.toId))return null;
  const q=state.pendingConquestTransfer;if(!q||q.fromId!==a.fromId||q.toId!==a.toId)return null;
  const to=t[q.toId];if(!to||to.owner!==p.id||!Number.isSafeInteger(to.armies))return null;
  const sourceIds=Array.isArray(q.fromIds)&&q.fromIds.length?[...new Set(q.fromIds)]:[q.fromId];
  if(sourceIds[0]!==q.fromId||sourceIds.some(id=>!validTerritoryId(id)))return null;
  for(const id of sourceIds){const from=t[id];if(!from||from.owner!==p.id||!Number.isSafeInteger(from.armies)||from.armies<1)return null;}
  const totalAvailable=sourceIds.reduce((sum,id)=>sum+Math.max(0,t[id].armies-1),0),max=Math.min(3,Number(q.maxTransfer)||1,totalAvailable),n=strictPositiveInt(a.amount);
  if(!Number.isSafeInteger(max)||max<1||!n||n>max)return null;
  let remaining=n;const distribution={};
  for(const id of sourceIds){const from=t[id],capacity=Math.max(0,from.armies-1),take=Math.min(capacity,remaining);if(take>0)from.armies-=take;distribution[id]=take;remaining-=take;if(remaining<=0)break;}
  if(remaining>0)return null;
  to.armies+=n;state.pendingConquestTransfer=null;state.lastCombat={...(state.lastCombat||{}),conquestTransfer:n,conquestTransferDistribution:distribution,conquestTransferOnly:true,ts:now()};
  setLastAction(state,p,'conquestTransfer',{fromIds:sourceIds,toId:q.toId,amount:n,distribution});return state;
 }
 if(a.kind==='airAttack'){
  if(!normalizeRoomSettings(state?.settings).airAttackEnabled||state.phase!=='ataque'||state.pendingConquestTransfer||state.airAttackPending||Number(state.airAttackCards?.[p.id]||0)<=0||!validTerritoryId(a.toId))return null;
  const to=t[a.toId];if(!to||to.owner===p.id||!Number.isSafeInteger(to.armies)||to.armies<1)return null;
  const last=Number(state.lastAttackAt?.[p.id]||0);if(now()-last<1000)return null;
  const destroyed=to.armies,fromId=TERRITORIES.find(x=>t[x.id].owner===p.id&&x.id!==a.toId)?.id||null;
  state.lastAttackAt[p.id]=now();state.airAttackPending={attackerId:p.id,toId:a.toId,fromId,startedAt:now(),destroyed};
  setLastAction(state,p,'airAttackStart',{toId:a.toId,fromId,destroyed});return state;
 }
 if(a.kind==='endAttackPhase'){
  if(state.phase!=='ataque'||state.pendingConquestTransfer)return null;
  state.phase='fortificacao';state.usedFortifyTerritories=[];state.fortifyLockedTerritories=[];setLastAction(state,p,'phaseChange',{from:'ataque',to:'fortificacao'});return state;
 }
 if(a.kind==='fortify'){
  if(state.phase!=='fortificacao'||!validTerritoryId(a.fromId)||!validTerritoryId(a.toId))return null;
  const from=t[a.fromId],to=t[a.toId],n=strictPositiveInt(a.amount);
  if(!from||!to||from.owner!==p.id||to.owner!==p.id||!adjacent(a.fromId,a.toId)||!Number.isSafeInteger(from.armies)||!Number.isSafeInteger(to.armies)||from.armies<2||!n||n>from.armies-1)return null;
  const locked=state.fortifyLockedTerritories||[];if(locked.includes(a.fromId))return null;
  from.armies-=n;to.armies+=n;if(!locked.includes(a.toId))locked.push(a.toId);state.fortifyLockedTerritories=locked;setLastAction(state,p,'fortify',{fromId:a.fromId,toId:a.toId,amount:n});return state;
 }
 if(a.kind==='endTurn'){
  if(state.phase!=='fortificacao'&&state.phase!=='ataque'||state.pendingConquestTransfer)return null;
  endTurn(state);return state;
 }
 if(a.kind==='exchangeCards'){
  if(state.phase!=='reforco')return null;
  const hand=state.hands?.[p.id]||[],ids=Array.isArray(a.cardIds)?a.cardIds:[];
  if(ids.some(id=>typeof id!=='string'))return null;
  state.cardTradeStats=state.cardTradeStats||{};
  state.cardTradeStats[p.id]=state.cardTradeStats[p.id]||{trades:0,lastReward:0,lastAt:0,airStored:0};
  if(ids.length===1){
   const card=hand.find(c=>c.id===ids[0]);
   if(!normalizeRoomSettings(state?.settings).airAttackEnabled||!card||card.symbol!==AIR||Number(state.airAttackCards?.[p.id]||0)>=1)return null;
   state.hands[p.id]=hand.filter(c=>c.id!==card.id);state.airAttackCards[p.id]=1;
   state.lastCardExchange={by:p.id,cards:[card],reward:0,airAttackCreated:1,ts:now()};
   state.cardTradeStats[p.id].airStored=Number(state.cardTradeStats[p.id].airStored||0)+1;state.cardTradeStats[p.id].lastAt=now();
   setLastAction(state,p,'airCard',{cardId:card.id});state.log.push(`${p.name} guardou um Ataque Aéreo nos Veículos de Combate.`);return state;
  }
  if(ids.length!==3||new Set(ids).size!==3)return null;
  const cards=ids.map(id=>hand.find(c=>c.id===id));if(cards.some(x=>!x)||!validSet(cards)||cards.some(c=>c.symbol===AIR))return null;
  state.hands[p.id]=hand.filter(c=>!ids.includes(c.id));state.discardPile.push(...cards);
  const reward=tradeValue(state);state.cardTradeCount++;
  if((state.reinforcementStage||'free')==='continent')state.pendingFreeReinforcements=Number(state.pendingFreeReinforcements||0)+reward;else state.reinforcementsRemaining+=reward;
  const bonusTerritoryIds=[];for(const c of cards){const terr=t[c.territoryId];if(terr?.owner===p.id&&Number.isSafeInteger(terr.armies)){terr.armies+=2;bonusTerritoryIds.push(c.territoryId);}}
  state.lastCardExchange={by:p.id,cards,reward,ts:now()};
  state.cardTradeStats[p.id].trades=Number(state.cardTradeStats[p.id].trades||0)+1;state.cardTradeStats[p.id].lastReward=reward;state.cardTradeStats[p.id].lastAt=now();
  setLastAction(state,p,'exchangeCards',{reward,bonusTerritoryIds});
  state.log.push(`${p.name} trocou 3 cartas por ${reward} exércitos.${bonusTerritoryIds.length?` Bônus em ${bonusTerritoryIds.map(id=>T[id]?.name||id).join(', ')}.`:''}`);
  return state;
 }
 return null;
}

let resultSchemaPromise=null;
async function ensureResultSchema(env){
 if(!resultSchemaPromise){
  resultSchemaPromise=env.DB.batch([env.DB.prepare(`CREATE TABLE IF NOT EXISTS match_result_commits (room_id TEXT PRIMARY KEY, finished_at INTEGER NOT NULL)`),env.DB.prepare(`CREATE TABLE IF NOT EXISTS match_history_details (history_id TEXT PRIMARY KEY,user_id TEXT NOT NULL,details_json TEXT NOT NULL)`)]).catch(e=>{resultSchemaPromise=null;throw e;});
 }
 return resultSchemaPromise;
}
async function recordResults(env,state){
 if(!state||(!state.winner&&!state.annulled))return false;
 if(isTrainingGame(state)){state.resultRecorded=true;state.resultRecordError=null;return true;}
 try{
  await ensureCommunitySchema(env);await ensureResultSchema(env);
  const committed=await env.DB.prepare('SELECT room_id FROM match_result_commits WHERE room_id=?').bind(state.roomId).first();
  if(committed){state.resultRecorded=true;state.resultRecordError=null;return true;}
  const ts=Number(state.finishedAt||now()),winner=state.winner,ops=[];
  for(const p of state.players){
   if(p.isBot)continue;
   const existing=await env.DB.prepare('SELECT id FROM match_history WHERE user_id=? AND room_id=? LIMIT 1').bind(p.id,state.roomId).first();
   if(existing)continue;
   const st=await env.DB.prepare('SELECT * FROM user_stats WHERE user_id=?').bind(p.id).first();
   if(!st)continue;
   const result=p.abandoned?'abandon':state.annulled?'annulled':p.id===winner?'win':'loss';
   const delta=result==='win'?10:(result==='abandon'?-6:0);
   let streak=Number(st.win_streak||0),best=Number(st.best_streak||0);streak=result==='win'?streak+1:0;best=Math.max(best,streak);
   const points=Math.max(0,Number(st.points||0)+delta),rank=rankFor(points);
   const gamesAdd=result==='annulled'?0:1,winsAdd=result==='win'?1:0,lossesAdd=result==='loss'?1:0,abandonsAdd=result==='abandon'?1:0;
   ops.push(env.DB.prepare('UPDATE user_stats SET points=MAX(0,points+?),games=games+?,wins=wins+?,losses=losses+?,abandons=abandons+?,win_streak=CASE WHEN ?=1 THEN win_streak+1 ELSE 0 END,best_streak=MAX(best_streak,CASE WHEN ?=1 THEN win_streak+1 ELSE 0 END),total_conquests=total_conquests+?,total_armies_destroyed=total_armies_destroyed+?,total_turns=total_turns+? WHERE user_id=? AND NOT EXISTS(SELECT 1 FROM match_result_commits WHERE room_id=?) AND NOT EXISTS(SELECT 1 FROM user_deletion_requests WHERE user_id=?)').bind(delta,gamesAdd,winsAdd,lossesAdd,abandonsAdd,winsAdd,winsAdd,Number(state.playerStats?.[p.id]?.conquests||0),Number(state.playerStats?.[p.id]?.armiesDestroyed||0),Number(state.turnNumber||0),p.id,state.roomId,p.id));
   const opponents=state.players.filter(x=>x.id!==p.id).map(x=>x.name);
   const details={version:1,mode:state.matchMode||'ranked',settings:normalizeRoomSettings(state.settings),startedAt:state.startedAt,finishedAt:ts,durationMs:Math.max(0,ts-Number(state.startedAt||ts)),rounds:Number(state.turnNumber||0),endedReason:state.endedReason|| (state.annulled?'annulled':'victory'),players:state.players.map(x=>({name:x.name,color:x.color,result:x.abandoned?'abandon':state.annulled?'annulled':x.id===winner?'win':'loss',aiTakeover:!!x.aiControlled,isBot:!!x.isBot,conquests:Number(state.playerStats?.[x.id]?.conquests||0),armiesDestroyed:Number(state.playerStats?.[x.id]?.armiesDestroyed||0),cardTrades:Number(state.cardTradeStats?.[x.id]?.trades||0),territories:Object.values(state.territories||{}).filter(t=>t.owner===x.id).length}))};
   ops.push(env.DB.prepare('INSERT OR IGNORE INTO match_history_details(history_id,user_id,details_json) SELECT ?,?,? WHERE NOT EXISTS(SELECT 1 FROM match_result_commits WHERE room_id=?) AND NOT EXISTS(SELECT 1 FROM user_deletion_requests WHERE user_id=?)').bind(`result:${state.roomId}:${p.id}`,p.id,JSON.stringify(details),state.roomId,p.id));
   ops.push(env.DB.prepare(`INSERT OR IGNORE INTO match_history(id,user_id,room_id,room_name,result,finished_at,players_count,opponent_names,points_delta,rank_after) SELECT ?,?,?,?,?,?,?,?,?,(SELECT CASE WHEN points>=8000 THEN 'General' WHEN points>=5500 THEN 'Coronel' WHEN points>=3500 THEN 'Tenente-Coronel' WHEN points>=2000 THEN 'Major' WHEN points>=1000 THEN 'Capitão' WHEN points>=500 THEN 'Tenente' WHEN points>=300 THEN 'Sargento' WHEN points>=100 THEN 'Cabo' ELSE 'Soldado' END FROM user_stats WHERE user_id=?) WHERE NOT EXISTS(SELECT 1 FROM match_result_commits WHERE room_id=?) AND NOT EXISTS(SELECT 1 FROM user_deletion_requests WHERE user_id=?)`).bind(`result:${state.roomId}:${p.id}`,p.id,state.roomId,state.roomName,result,ts,state.players.length,JSON.stringify(opponents),delta,p.id,state.roomId,p.id));
  }
  ops.push(env.DB.prepare('INSERT OR IGNORE INTO match_result_commits(room_id,finished_at) VALUES(?,?)').bind(state.roomId,ts));
  await env.DB.batch(ops);
  state.resultRecorded=true;state.resultRecordError=null;
  try{
   const checks=await env.DB.prepare('SELECT u.id,s.* FROM user_stats s JOIN users u ON u.id=s.user_id WHERE s.user_id IN ('+state.players.map(()=>'?').join(',')+')').bind(...state.players.map(p=>p.id)).all();
   const achievementOps=[];
   for(const s of checks.results||[]){
    const wins=Number(s.wins),games=Number(s.games),points=Number(s.points),ach=[];
    if(games>=1)ach.push('first_battle');if(wins>=1)ach.push('first_victory');if(wins>=5)ach.push('five_victories');if(wins>=10)ach.push('ten_victories');if(Number(s.win_streak)>=3)ach.push('streak_three');if(points>=100)ach.push('hundred_points');if(points>=1000)ach.push('thousand_points');if(rankFor(points).id==='general')ach.push('marshal');
    for(const a of ach)achievementOps.push(env.DB.prepare('INSERT OR IGNORE INTO user_achievements(user_id,achievement_id,unlocked_at) VALUES(?,?,?)').bind(s.id,a,ts));
   }
   if(achievementOps.length)await env.DB.batch(achievementOps);
  }catch(e){console.error('UOR achievements after result error',e);}
  return true;
 }catch(e){
  state.resultRecorded=false;state.resultRecordError=String(e?.message||e).slice(0,240);state.resultRecordRetryAt=now()+RESULT_RETRY_MS;
  console.error('UOR atomic result error',e);return false;
 }
}

// Exact dice distributions (including the defender winning ties), cached per isolate.
const aiDiceCache=new Map(),aiOddsCache=new Map();
function aiDiceOutcomes(a,d){
 const key=a+':'+d;if(aiDiceCache.has(key))return aiDiceCache.get(key);
 const rolls=n=>{let out=[[]];for(let i=0;i<n;i++)out=out.flatMap(r=>[1,2,3,4,5,6].map(v=>[...r,v]));return out.map(r=>r.sort((x,y)=>y-x));};
 const counts=new Map(),aa=rolls(a),dd=rolls(d);
 for(const ar of aa)for(const dr of dd){let al=0,dl=0;for(let i=0;i<Math.min(a,d);i++)ar[i]>dr[i]?dl++:al++;const k=al+':'+dl;counts.set(k,(counts.get(k)||0)+1);}
 const result=[...counts].map(([k,n])=>[...k.split(':').map(Number),n/(aa.length*dd.length)]);aiDiceCache.set(key,result);return result;
}
function aiConquestOdds(attackers,defenders){
 let a=Math.max(0,Math.floor(attackers)),d=Math.max(0,Math.floor(defenders));if(!d)return 1;if(!a)return 0;
 // Bound planning cost for very large armies; ordinary battles use exact probabilities.
 if(Math.max(a,d)>60){const scale=60/Math.max(a,d);a=Math.max(1,Math.round(a*scale));d=Math.max(1,Math.round(d*scale));}
 const key=a+':'+d;if(aiOddsCache.has(key))return aiOddsCache.get(key);
 const result=aiDiceOutcomes(Math.min(3,a),Math.min(3,d)).reduce((sum,[al,dl,prob])=>sum+prob*aiConquestOdds(a-al,d-dl),0);aiOddsCache.set(key,result);return result;
}
function chooseAiAction(state,pid){
 const p=state.players.find(x=>x.id===pid);if(!p||p.eliminated||!p.aiControlled||state.players[state.turnIndex]?.id!==pid||state.airAttackPending)return null;
 const t=state.territories,ownIds=Object.keys(t).filter(id=>t[id].owner===pid),objective=state.objectives?.[pid]||{};
 const enemies=id=>(ADJ[id]||[]).filter(x=>t[x]&&t[x].owner!==pid);
 const continentIds=cid=>TERRITORIES.filter(x=>x.continent===cid).map(x=>x.id);
 const counts={};for(const x of Object.values(t))counts[x.owner]=(counts[x.owner]||0)+1;
 function targetValue(id){
  const x=t[id],cid=T[id].continent,ids=continentIds(cid),mine=ids.filter(k=>t[k].owner===pid).length;
  let score=3+(CONTINENTS[cid]?.bonus||0)*(mine+1)/ids.length;
  if(mine===ids.length-1)score+=18;
  if(ids.every(k=>t[k].owner===x.owner))score+=10+(CONTINENTS[cid]?.bonus||0)*2;
  if(objective.list?.includes(cid))score+=7;
  if(objective.type==='territories')score+=4;
  const opponent=state.players.find(q=>q.id===x.owner);
  if(objective.type==='eliminate'&&opponent?.color===objective.targetColor)score+=12;
  if(counts[x.owner]===1)score+=25;
  // Avoid reading opponents' hidden objectives or cards.
  if(counts[x.owner]>=20)score+=6;
  return score;
 }
 function reinforceValue(id){
  const near=enemies(id);if(!near.length)return -10-t[id].armies;
  const threat=Math.max(...near.map(x=>Math.max(0,t[x].armies-1))),deficit=Math.max(0,threat-t[id].armies);
  const opportunity=Math.max(...near.map(x=>targetValue(x)+12*aiConquestOdds(t[id].armies+2,t[x].armies)-Math.max(0,t[x].armies*1.5-t[id].armies)*.4));
  const defense=continentOwned(state,pid,T[id].continent)?deficit*2+10:deficit*.5;
  return opportunity+defense-t[id].armies*.3;
 }
 function bestReinforcement(ids){return ids.slice().sort((a,b)=>reinforceValue(b)-reinforceValue(a))[0];}
 const action=(kind,extra={})=>({kind,byConnId:pid,...extra});
 if(state.phase==='setup'){const id=bestReinforcement(ownIds);return id?action('setupPlace',{territoryId:id,amount:Math.min(3,Number(state.setupRemaining[pid]||0))}):null;}
 if(state.phase==='reforco'){
  ensureReinforcementState(state,pid);
  const hand=state.hands?.[pid]||[],rules=normalizeRoomSettings(state.settings),air=hand.find(c=>c.symbol===AIR);
  if(rules.airAttackEnabled&&air&&!Number(state.airAttackCards?.[pid]))return action('exchangeCards',{cardIds:[air.id]});
  const groups=CARD_SYMBOLS.filter(s=>s!==AIR).map(s=>hand.filter(c=>c.symbol===s).sort((a,b)=>Number(t[b.territoryId]?.owner===pid)-Number(t[a.territoryId]?.owner===pid)));
  const sets=groups.filter(g=>g.length>=3).map(g=>g.slice(0,3));if(groups.every(g=>g.length))sets.push(groups.map(g=>g[0]));
  if(sets.length){sets.sort((a,b)=>b.filter(c=>t[c.territoryId]?.owner===pid).length-a.filter(c=>t[c.territoryId]?.owner===pid).length);return action('exchangeCards',{cardIds:sets[0].map(c=>c.id)});}
  if(state.reinforcementStage==='continent'){
   for(const [cid,n]of Object.entries(state.continentBonusRemaining||{}))if(n>0){const id=bestReinforcement(ownIds.filter(x=>T[x].continent===cid));if(id)return action('reinforce',{territoryId:id,amount:Math.min(3,n,state.reinforcementsRemaining)});}
  }
  if(state.reinforcementsRemaining>0)return action('reinforce',{territoryId:bestReinforcement(ownIds),amount:Math.min(3,state.reinforcementsRemaining)});
  return action('endReinforcePhase');
 }
 if(state.phase==='ataque'){
  if(state.pendingConquestTransfer){const q=state.pendingConquestTransfer,ids=q.fromIds||[q.fromId],available=ids.reduce((n,id)=>n+Math.max(0,t[id].armies-1),0);return action('conquestTransfer',{fromId:q.fromId,toId:q.toId,amount:Math.min(3,q.maxTransfer,available)});}
  if(normalizeRoomSettings(state.settings).airAttackEnabled&&state.airAttackCards?.[pid]>0){
   const id=Object.keys(t).filter(id=>t[id].owner!==pid).sort((a,b)=>(targetValue(b)+t[b].armies*2)-(targetValue(a)+t[a].armies*2))[0];
   if(id)return action('airAttack',{toId:id});
  }
  let best=null;
  for(const toId of Object.keys(t).filter(id=>t[id].owner!==pid)){
   const sources=ownIds.filter(id=>(ADJ[id]||[]).includes(toId)&&t[id].armies>=2).sort((a,b)=>t[b].armies-t[a].armies);
   const options=sources.map(id=>[id]);if(sources.length>1)options.push(sources);
   for(const ids of options){const available=ids.reduce((sum,id)=>sum+t[id].armies-1,0),chance=aiConquestOdds(available,t[toId].armies),value=targetValue(toId);
    const threshold=value>=25 ? .55 : (p.conqueredThisTurn ? .72 : .63);if(chance<threshold)continue;
    const exposure=ids.reduce((sum,id)=>sum+Math.max(0,enemies(id).filter(x=>x!==toId).length-1),0);
    const score=chance*(value+8)-t[toId].armies*(1-chance)-exposure*1.5;
    if(!best||score>best.score)best={ids,toId,score};
   }
  }
  if(best)return best.ids.length>1?action('unitedAttack',{fromIds:best.ids,toId:best.toId}):action('attack',{fromId:best.ids[0],toId:best.toId,dice:Math.min(3,t[best.ids[0]].armies-1)});
  return action('endAttackPhase');
 }
 if(state.phase==='fortificacao'){
  const locked=new Set(state.fortifyLockedTerritories||[]),dist={},queue=ownIds.filter(id=>enemies(id).length);for(const id of queue)dist[id]=0;
  for(let i=0;i<queue.length;i++)for(const n of ADJ[queue[i]]||[])if(t[n]?.owner===pid&&dist[n]===undefined){dist[n]=dist[queue[i]]+1;queue.push(n);}
  let best=null;
  for(const fromId of ownIds){if(locked.has(fromId)||t[fromId].armies<=1)continue;
   for(const toId of ADJ[fromId]||[]){if(t[toId]?.owner!==pid)continue;
    const interior=dist[fromId]>0&&dist[toId]<dist[fromId],threat=enemies(fromId).reduce((v,id)=>Math.max(v,t[id].armies-1),0),reserve=interior?1:Math.max(2,threat);
    const amount=t[fromId].armies-reserve;if(amount<1)continue;
    const gain=interior?20+amount:reinforceValue(toId)-reinforceValue(fromId);if(gain<=3)continue;
    if(!best||gain>best.gain)best={fromId,toId,amount,gain};
   }
  }
  if(best)return action('fortify',{fromId:best.fromId,toId:best.toId,amount:best.amount});
  return action('endTurn');
 }
 return null;
}
function chooseAiFallbackAction(state,pid){
  const p=state?.players?.[state.turnIndex];
  if(!p||p.id!==pid||state.airAttackPending)return null;
  // Fallback conservador: só conclui fases em que não há mais ação obrigatória.
  // Não encerra ataque após uma recusa transitória (por exemplo, cooldown de dados).
  if(state.phase==='fortificacao'&&!state.pendingConquestTransfer)return {kind:'endTurn',byConnId:pid};
  if(state.phase==='reforco'){
    ensureReinforcementState(state,pid);
    if((state.reinforcementStage||'free')!=='continent'&&Number(state.reinforcementsRemaining||0)<=0)return {kind:'endReinforcePhase',byConnId:pid};
  }
  return null;
}
export class UORRoom {
 constructor(state,env){this.state=state;this.env=env;this.sockets=new Map();this.personalMutes=new Map();this.socketSessions=new WeakMap();this.socketRates=new WeakMap();this.socketSends=new WeakMap();this.userBlocks=new Map();this.chatLastSent=new Map();this.mutationTail=Promise.resolve();this.spectators=new Set();this.presenceSockets=new Map();this.presenceUsers=new Map();this.state.blockConcurrencyWhile(async()=>{this.room=await this.state.storage.get('room')||null;if(this.room)this.room.settings=normalizeRoomSettings(this.room.settings);this.game=await this.state.storage.get('game')||null;if(await this.state.storage.get('pendingRoomCleanup')){this.room=null;this.game=null;await this.state.storage.setAlarm(now()+250);return;}if(this.game){normalizeObjectives(this.game);this.game.cardTradeStats=this.game.cardTradeStats||Object.fromEntries((this.game.players||[]).map(p=>[p.id,{trades:0,lastReward:0,lastAt:0,airStored:0}]));if(!this.game.lastAction){const cp=this.game.players?.[this.game.turnIndex];if(cp)setTurnStartAction(this.game,cp);}if(this.game.phase==='reforco'&&(!Object.prototype.hasOwnProperty.call(this.game,'continentBonusRemaining')||!Object.prototype.hasOwnProperty.call(this.game,'reinforcementStage'))){const cp=this.game.players?.[this.game.turnIndex];if(cp)beginReinforcementPhase(this.game,cp.id);}await this.state.storage.put('game',this.game);await this.state.storage.setAlarm(now()+250);}else if(this.room)await this.scheduleNextAlarm();});}
 allowSocketMessage(ws){const ts=now(),rate=this.socketRates.get(ws);if(!rate||ts-rate.start>=1000){this.socketRates.set(ws,{start:ts,count:1});return true;}if(++rate.count<=30)return true;try{ws.close(4008,'rate_limit')}catch{}return false;}
 async validateSocketSession(uid,ws){
  const sid=this.socketSessions.get(ws);const u=sid?await this.env.DB.prepare('SELECT u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.user_id=? AND s.expires_at>? AND NOT EXISTS(SELECT 1 FROM user_deletion_requests d WHERE d.user_id=s.user_id)').bind(sid,uid,now()).first():null;
  if(!u||(this.spectators.has(uid)&&!isStaffOrAdmin(u))){try{ws.close(4003,'session_invalid')}catch{}return false;}return true;
 }
 async sendAuthenticated(uid,ws,out){if(!await this.validateSocketSession(uid,ws))return;const entry=out.entry||out.payload?.entry;if(entry&&!entry.system&&this.personalMutes.get(uid)?.has(entry.userId))return;ws.send(JSON.stringify(out));}
 async saveChatEvidence(entry){const entries=await this.state.storage.get('chatEvidence')||[];entries.push(entry);await this.state.storage.put('chatEvidence',entries.slice(-100));}
 async persist(){if(this.game?.log?.length>200){this.game.logOffset=Number(this.game.logOffset||0)+this.game.log.length-200;this.game.log=this.game.log.slice(-200);}await ensureCommunitySchema(this.env);const rid=this.room?.id||await this.state.storage.get('membershipRoomId');if(rid)await this.state.storage.put('membershipRoomId',rid);if(!this.room&&rid)await this.env.DB.prepare('DELETE FROM user_room_memberships WHERE room_id=?').bind(rid).run();await this.state.storage.put('room',this.room);await this.state.storage.put('game',this.game);if(!this.room)await this.state.storage.delete('chatEvidence');}
 async roomForPublic(){if(!this.room)return null;this.room.settings=normalizeRoomSettings(this.room.settings);return {id:this.room.id,name:this.room.name,maxPlayers:this.room.maxPlayers,hostConnId:this.room.hostConnId,players:this.room.players.map(p=>({...p,abandoned:!!this.game?.players?.find(g=>g.id===p.id)?.abandoned,eliminated:!!this.game?.players?.find(g=>g.id===p.id)?.eliminated})),settings:this.room.settings,gameActive:!!this.game,version:GAME_VERSION,updatedAt:now()};}
 gameStateForClient(state,uid,spectator=false){
  if(!state)return state;
  const safe=structuredClone(state),finished=!!safe.winner||!!safe.resultRecorded||!!safe.annulled;
  safe.handCounts=Object.fromEntries((state.players||[]).map(p=>[p.id,Array.isArray(state.hands?.[p.id])?state.hands[p.id].length:0]));
  delete safe.deck;delete safe.discardPile;delete safe.lastAttackAt;
  if(spectator){delete safe.hands;delete safe.objectives;delete safe.reconnectCodes;delete safe.airAttackCards;return safe;}
  safe.hands={[uid]:structuredClone(state.hands?.[uid]||[])};
  safe.airAttackCards={[uid]:Number(state.airAttackCards?.[uid]||0)};
  safe.reconnectCodes=state.reconnectCodes?.[uid]?{[uid]:state.reconnectCodes[uid]}:{};
  safe.objectives=finished?structuredClone(state.objectives||{}):(state.objectives?.[uid]?{[uid]:structuredClone(state.objectives[uid])}:{});
  return safe;
 }
 broadcast(msg){for(const [uid,ws] of this.sockets.entries()){try{const entry=msg.entry||msg.payload?.entry;if(entry&&!entry.system&&this.personalMutes.get(uid)?.has(entry.userId))continue;const spectator=this.spectators.has(uid);let out=msg;if(msg?.state)out={...msg,state:this.gameStateForClient(msg.state,uid,spectator)};else if(msg?.payload?.state)out={...msg,payload:{...msg.payload,state:this.gameStateForClient(msg.payload.state,uid,spectator)}};const delivery=(this.socketSends.get(ws)||Promise.resolve()).then(()=>this.sendAuthenticated(uid,ws,out)).catch(()=>{try{ws.close(4003,'session_check_failed')}catch{}});this.socketSends.set(ws,delivery);this.state.waitUntil?.(delivery);}catch{}}}
 broadcastPresence(){const users=[...this.presenceUsers.values()].sort((a,b)=>a.nick.localeCompare(b.nick,'pt-BR',{sensitivity:'base'}));const raw=JSON.stringify({type:'presence_snapshot',users});for(const set of this.presenceSockets.values())for(const ws of set)try{ws.send(raw)}catch{}}
 async presenceSocketClosed(uid,ws){const set=this.presenceSockets.get(uid);if(!set||!set.has(ws))return;set.delete(ws);if(set.size===0){this.presenceSockets.delete(uid);this.presenceUsers.delete(uid);this.broadcastPresence();}}
 async serializedMutation(fn){const job=this.mutationTail.then(fn);this.mutationTail=job.catch(()=>{});return job;}
 async fetch(req){return this.serializedMutation(()=>this.fetchUnlocked(req));}
 async onMessage(uid,ws,e){return this.serializedMutation(()=>this.onMessageUnlocked(uid,ws,e));}
 async onClose(uid,ws){return this.serializedMutation(()=>this.onCloseUnlocked(uid,ws));}
 async alarm(){return this.serializedMutation(()=>this.alarmUnlocked());}
 async socialAction(uid,b){
  if(!uid||!b||typeof b.action!=='string')return json({ok:false,error:'Solicitação inválida.'},400);
  const ts=now(),online=id=>{const p=this.presenceUsers.get(id);return p&&ts-Number(p.lastSeenAt||0)<20000?p:null;};
  const get=async key=>await this.state.storage.get(key)||[];
  const send=(id,msg)=>{for(const ws of this.presenceSockets.get(id)||[])if(ws.readyState===1)try{ws.send(JSON.stringify(msg));}catch{}};
  const notify=id=>send(id,{type:'social_updated'});
  const friendKey='friends:'+uid,friendIds=await get(friendKey),blocked=await get('socialBlocked:'+uid),targetId=String(b.targetId||'');
  const blockedPair=async id=>blocked.includes(id)||(await get('socialBlocked:'+id)).includes(uid);
  const validRoom=async inv=>{if(inv.expiresAt&&inv.expiresAt<=ts)return null;const row=await this.env.DB.prepare('SELECT * FROM rooms WHERE id=?').bind(inv.roomId).first();const room=row?roomPublic(row):null;return room&&!room.gameActive&&room.players.some(p=>p.id===inv.fromId)?room:null;};
  if(b.action==='list'){
   const friends=[];for(const id of friendIds){if(await blockedPair(id))continue;const p=online(id)||await this.env.DB.prepare('SELECT id,nick FROM users WHERE id=?').bind(id).first();if(p)friends.push({...p,online:!!online(id),available:online(id)?.available===true});}
   const requests=[];for(const p of await get('friendRequests:'+uid)){if(!p?.id||await blockedPair(p.id))continue;const current=await this.env.DB.prepare('SELECT id,nick FROM users WHERE id=?').bind(p.id).first();if(current)requests.push(current);}
   const invitations=[];for(const inv of await get('invitations:'+uid))if(!await blockedPair(inv.fromId)&&await validRoom(inv))invitations.push(inv);
   const users=[];for(const p of this.presenceUsers.values())if(p.id!==uid&&online(p.id)&&p.available&&p.location==='lobby'&&!await blockedPair(p.id))users.push(p);
   const blockedUsers=[];for(const id of blocked){const p=await this.env.DB.prepare('SELECT id,nick FROM users WHERE id=?').bind(id).first();if(p)blockedUsers.push(p);}
   await this.state.storage.put({['friendRequests:'+uid]:requests,['invitations:'+uid]:invitations});
   return json({ok:true,users,friends,requests,invitations,blocked:blockedUsers,nextInviteAt:Number(await this.state.storage.get('inviteCooldown:'+uid)||0)});
  }
  if(b.action==='availability'){
   const p=online(uid);if(!p||p.location!=='lobby')return json({ok:false,error:'Altere seu status somente no lobby.'},409);
   const active=await this.env.DB.prepare('SELECT r.game_active FROM rooms r JOIN user_room_memberships m ON m.room_id=r.id WHERE m.user_id=?').bind(uid).first();
   if(active?.game_active)return json({ok:false,error:'Altere seu status somente no lobby.'},409);
   p.available=b.available===true;await this.state.storage.put('available:'+uid,p.available);this.broadcastPresence();return json({ok:true,available:p.available});
  }
  if(b.action==='block'||b.action==='unblock'){
   if(!targetId||targetId.length>128||targetId===uid)return json({ok:false,error:'Jogador inválido.'},400);
   if(b.action==='unblock'){await this.state.storage.put('socialBlocked:'+uid,blocked.filter(id=>id!==targetId));notify(uid);return json({ok:true});}
   if(!await this.env.DB.prepare('SELECT id FROM users WHERE id=?').bind(targetId).first())return json({ok:false,error:'Jogador não encontrado.'},404);
   if(blocked.length>=100&&!blocked.includes(targetId))return json({ok:false,error:'Limite de bloqueados atingido.'},409);
   const otherFriends=await get('friends:'+targetId),ownRequests=await get('friendRequests:'+uid),otherRequests=await get('friendRequests:'+targetId),ownInvites=await get('invitations:'+uid),otherInvites=await get('invitations:'+targetId);
   await this.state.storage.put({['socialBlocked:'+uid]:[...new Set([...blocked,targetId])],[friendKey]:friendIds.filter(id=>id!==targetId),['friends:'+targetId]:otherFriends.filter(id=>id!==uid),['friendRequests:'+uid]:ownRequests.filter(p=>p.id!==targetId),['friendRequests:'+targetId]:otherRequests.filter(p=>p.id!==uid),['invitations:'+uid]:ownInvites.filter(p=>p.fromId!==targetId),['invitations:'+targetId]:otherInvites.filter(p=>p.fromId!==uid)});notify(uid);notify(targetId);return json({ok:true});
  }
  if(['friend-request','friend-accept','invite'].includes(b.action)&&await blockedPair(targetId))return json({ok:false,error:'Contato indisponível.'},403);
  if(b.action==='friend-request'){
   if(!targetId||targetId===uid||friendIds.includes(targetId))return json({ok:false,error:'Amigo inválido ou já adicionado.'},400);
   const target=await this.env.DB.prepare('SELECT id FROM users WHERE id=?').bind(targetId).first();if(!target)return json({ok:false,error:'Jogador não encontrado.'},404);
   const pending=await get('friendRequests:'+targetId);
   if(pending.some(p=>p.id===uid))return json({ok:true,pending:true});
   if(pending.length>=100||friendIds.length>=100)return json({ok:false,error:'Limite de amigos ou solicitações atingido.'},409);
   const from=await this.env.DB.prepare('SELECT id,nick FROM users WHERE id=?').bind(uid).first();if(!from)return json({ok:false},401);
   await this.state.storage.put('friendRequests:'+targetId,[...pending,from]);notify(targetId);return json({ok:true});
  }
  if(['friend-accept','friend-decline','friend-remove'].includes(b.action)){
   const requests=await get('friendRequests:'+uid),other=await get('friends:'+targetId),otherRequests=await get('friendRequests:'+targetId);
   if(b.action==='friend-accept'){
    if(!requests.some(p=>p.id===targetId))return json({ok:false,error:'Solicitação não encontrada.'},404);
    if(!await this.env.DB.prepare('SELECT id FROM users WHERE id=?').bind(targetId).first())return json({ok:false,error:'Conta indisponível.'},404);
    if(friendIds.length>=100||other.length>=100)return json({ok:false,error:'Limite de amigos atingido.'},409);
    await this.state.storage.put({[friendKey]:[...new Set([...friendIds,targetId])],['friends:'+targetId]:[...new Set([...other,uid])],['friendRequests:'+targetId]:otherRequests.filter(p=>p.id!==uid)});
   }
   if(b.action==='friend-remove')await this.state.storage.put({[friendKey]:friendIds.filter(id=>id!==targetId),['friends:'+targetId]:other.filter(id=>id!==uid)});
   await this.state.storage.put('friendRequests:'+uid,requests.filter(p=>p.id!==targetId));notify(uid);notify(targetId);return json({ok:true});
  }
  if(b.action==='invite'){
   const next=Number(await this.state.storage.get('inviteCooldown:'+uid)||0);if(next>ts)return json({ok:false,error:`Aguarde ${Math.ceil((next-ts)/1000)} segundos para convidar novamente.`,nextInviteAt:next},429);
   const row=await this.env.DB.prepare('SELECT * FROM rooms WHERE id=?').bind(String(b.roomId||'')).first(),room=row?roomPublic(row):null;
   if(!room||room.gameActive||room.players.length>=room.maxPlayers||!room.players.some(p=>p.id===uid))return json({ok:false,error:'Entre em uma sala aberta com vaga para convidar.'},409);
   const target=online(targetId);if(targetId===uid||!target?.available||target.location!=='lobby'||room.players.some(p=>p.id===targetId))return json({ok:false,error:'Jogador indisponível para convite.'},409);
   const membership=await this.env.DB.prepare('SELECT room_id FROM user_room_memberships WHERE user_id=?').bind(targetId).first();if(membership)return json({ok:false,error:'Jogador já está em outra sala.'},409);
   const from=await this.env.DB.prepare('SELECT id,nick FROM users WHERE id=?').bind(uid).first();if(!from)return json({ok:false},401);
   const key='invitations:'+targetId,pending=[];for(const i of await get(key))if(i.roomId!==room.id&&await validRoom(i))pending.push(i);
   if(pending.length>=20)return json({ok:false,error:'Jogador já possui muitos convites pendentes.'},429);
   const invitation={id:uuid(),roomId:room.id,roomName:room.name,fromId:uid,fromNick:from.nick,createdAt:ts};
   await this.state.storage.put({[key]:[...pending,invitation],['inviteCooldown:'+uid]:ts+30000});send(targetId,{type:'room_invitation',invitation});return json({ok:true,nextInviteAt:ts+30000});
  }
  if(['invite-accept','invite-decline','invite-consumed'].includes(b.action)){
   const key='invitations:'+uid,pending=await get(key),inv=pending.find(i=>i.id===b.inviteId);
   if(b.action==='invite-decline'){await this.state.storage.put(key,pending.filter(i=>i.id!==b.inviteId));notify(uid);return json({ok:true});}
   if(!inv)return json({ok:false,error:'Convite não encontrado.'},410);
   if(b.action==='invite-consumed'){const member=await this.env.DB.prepare('SELECT room_id FROM user_room_memberships WHERE user_id=?').bind(uid).first();if(member?.room_id!==inv.roomId)return json({ok:false,error:'Entre na sala antes de concluir o convite.'},409);await this.state.storage.put(key,pending.filter(i=>i.id!==inv.id));notify(uid);return json({ok:true});}
   const room=await validRoom(inv);if(!room||await blockedPair(inv.fromId)){await this.state.storage.put(key,pending.filter(i=>i.id!==inv.id));return json({ok:false,error:'A sala encerrou ou o convite não está disponível.'},410);}
   if(!online(uid)?.available)return json({ok:false,error:'Marque Disponível antes de aceitar.'},409);
   const member=await this.env.DB.prepare('SELECT room_id FROM user_room_memberships WHERE user_id=?').bind(uid).first();if(member&&member.room_id!==room.id)return json({ok:false,error:'Saia da sua sala antes de aceitar outro convite.'},409);
   if(room.players.length>=room.maxPlayers&&!room.players.some(p=>p.id===uid))return json({ok:false,error:'A sala está cheia.'},409);
   return json({ok:true,room});
  }
  return json({ok:false,error:'Ação inválida.'},400);
 }
 async checkWaitingRoom(){
  if(!this.room||this.game)return;
  const ts=now();let changed=false;
  for(const p of [...this.room.players]){
   if(p.isBot)continue;
   const ws=this.sockets.get(p.id),last=Number(p.waitingSeenAt||this.room.waitingLastActivityAt||ts);
   if(ws&&ts-last<20000){if(p.waitingDisconnectedAt){delete p.waitingDisconnectedAt;changed=true;}continue;}
   if(!p.waitingDisconnectedAt){p.waitingDisconnectedAt=ws?last+20000:ts;changed=true;}
   if(ts-p.waitingDisconnectedAt<60000)continue;
   if(ws){try{ws.close(4000,'waiting_timeout')}catch{}this.sockets.delete(p.id);}
   await releaseRoomClaim(this.env,p.id,this.room.id);this.room.players=this.room.players.filter(x=>x.id!==p.id);changed=true;
  }
  if(!this.room.players.some(p=>!p.isBot)){await this.beginRoomCleanup(this.room.id);return;}
  if(!this.room.players.some(p=>p.id===this.room.hostConnId)){
   const next=this.room.players.find(p=>this.sockets.has(p.id)&&!p.waitingDisconnectedAt)||this.room.players.find(p=>!p.isBot);this.room.hostConnId=next.id;changed=true;
  }
  if(changed){await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'room_state',room:await this.roomForPublic()});}
 }
 async fetchUnlocked(req){const url=new URL(req.url),path=url.pathname;
  if(path.includes('/internal/')){
   if(url.origin!=='https://uor-room'||req.method!=='POST'||!/^\/internal\/[a-z-]+$/.test(path)||req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY||''))return json({ok:false,error:'Operação interna não autorizada.'},403);
  }
  if(await this.state.storage.get('pendingRoomCleanup')){if(!await this.cleanupClosedRoom())return json({ok:false,error:'Sala sendo encerrada. Tente novamente em instantes.'},503);}
  if(path==='/internal/social')return this.socialAction(req.headers.get('x-uor-user'),await body(req));
  if(path==='/internal/waiting-check'){
   if(this.room&&!this.game){if(!await this.state.storage.getAlarm())await this.scheduleNextAlarm();}
   else if(!this.room&&!this.game){const b=await body(req);const row=await this.env.DB.prepare('SELECT created_at FROM rooms WHERE id=? AND game_active=0').bind(String(b.roomId||'')).first();if(row&&Number(row.created_at)<now()-120000)await this.beginRoomCleanup(b.roomId);}
   return json({ok:true});
  }
  if(path==='/internal/admin-close-waiting'){
   const actor=await this.env.DB.prepare('SELECT role FROM users WHERE id=?').bind(req.headers.get('x-uor-user')).first();
   if(normalizeRole(actor?.role)!=='ADMIN')return json({ok:false,error:'Apenas Admin.'},403);
   if(!this.room)return json({ok:true});if(this.game)return json({ok:false,error:'Esta sala já está em partida.'},409);
   if(this.room.players.some(p=>this.sockets.has(p.id)&&now()-Number(p.waitingSeenAt||0)<20000))return json({ok:false,error:'Ainda há jogadores conectados à sala.'},409);
   const ok=await this.beginRoomCleanup(this.room.id);return json({ok,error:ok?undefined:'Encerramento em andamento.'},ok?200:503);
  }
  if(path==='/internal/membership'){const uid=req.headers.get('x-uor-user'),p=this.game?this.game.players.find(p=>p.id===uid):this.room?.players?.find(p=>p.id===uid);const member=!!p&&!p.abandoned&&!p.eliminated;const b=await body(req);if(!member&&typeof b.roomId==='string')await releaseRoomClaim(this.env,uid,b.roomId);return json({ok:true,member,room:await this.roomForPublic()});}

  if(path.endsWith('/internal/schedule-chat-cleanup')){
   if(req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY||''))return json({ok:false},403);
   const ts=now(),existing=Number(await this.state.storage.get('lobbyChatNextCleanupAt')||0),due=existing>0?Math.max(ts+250,Math.min(existing,ts+GLOBAL_CHAT_RESET_MS)):ts+GLOBAL_CHAT_RESET_MS;
   await this.state.storage.put('lobbyChatCleanup',true);await this.state.storage.put('lobbyChatNextCleanupAt',due);await this.state.storage.setAlarm(due);return json({ok:true});
  }
  if(path.endsWith('/internal/account-deleted')){
   if(req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY||''))return json({ok:false},403);
   const uid=req.headers.get('x-uor-user');
   if(!uid||!await this.env.DB.prepare('SELECT user_id FROM user_deletion_requests WHERE user_id=?').bind(uid).first())return json({ok:false},403);
   const b=await body(req),nick=String(b.nick||''),newId='deleted:'+uuid();
   const ws=this.sockets.get(uid);this.sockets.delete(uid);if(ws)try{ws.close(4004,'account_deleted');}catch{}
   const set=this.presenceSockets.get(uid);this.presenceSockets.delete(uid);this.presenceUsers.delete(uid);if(set)for(const socket of set)try{socket.close(4004,'account_deleted');}catch{}
   this.personalMutes.delete(uid);this.userBlocks.delete(uid);this.spectators.delete(uid);this.broadcastPresence();
   const scrub=v=>typeof v==='string'?(v===uid?newId:v):Array.isArray(v)?v.map(scrub):v&&typeof v==='object'?Object.fromEntries(Object.entries(v).map(([k,x])=>[k===uid?newId:k,scrub(x)])):v;
   const p=this.game?.players?.find(x=>x.id===uid);
   if(p){p.name='Jogador excluído';p.role='PLAYER';p.accountDeleted=true;p.abandoned=true;p.aiControlled=true;p.connectionStatus='abandoned';p.kickActive=false;p.kickUntil=0;p.reconnectUntil=0;}
   if(this.game){
    this.game=scrub(this.game);
    if(nick){this.game.log=(this.game.log||[]).map(x=>String(x).split(nick).join('Jogador excluído'));this.game.roomName=String(this.game.roomName||'Sala UOR').split(nick).join('Jogador excluído');for(const o of Object.values(this.game.objectives||{}))if(o.text)o.text=o.text.split(nick).join('Jogador excluído');}
    if(this.game.lastAction?.byConnId===newId)this.game.lastAction.playerName='Jogador excluído';
   }
   if(this.room){
    const rid=this.room.id;
    if(this.game){this.room=scrub(this.room);for(const rp of this.room.players||[])if(rp.id===newId){rp.name='Jogador excluído';rp.role='PLAYER';}if(nick)this.room.name=this.room.name.split(nick).join('Jogador excluído');const next=this.game.players.find(x=>!x.accountDeleted&&!x.abandoned&&!x.eliminated)||this.game.players.find(x=>!x.accountDeleted);if(this.room.hostConnId===newId&&next){this.room.hostConnId=next.id;this.game.hostConnId=next.id;}}
    else {this.room.players=this.room.players.filter(x=>x.id!==uid);if(this.room.hostConnId===uid)this.room.hostConnId=this.room.players.find(p=>!p.isBot)?.id;if(!this.room.players.some(p=>!p.isBot))this.room=null;else if(nick)this.room.name=this.room.name.split(nick).join('Jogador excluído');}
    await this.persist();if(this.game)await this.closeIfOnlyAiAfterGrace();if(this.room)await syncRoomRow(this.env,rid,await this.roomForPublic());else if(!await this.beginRoomCleanup(rid))throw new Error('Limpeza da sala pendente.');
   }
   const evidence=await this.state.storage.get('chatEvidence')||[];await this.state.storage.put('chatEvidence',evidence.filter(x=>x.userId!==uid));
   this.broadcast({type:'account_data_removed',userId:uid,nick});if(this.game)this.broadcast({type:'game_state_sync',state:this.game});if(this.room)this.broadcast({type:'room_state',room:await this.roomForPublic()});
   await this.closeIfOnlyAiAfterGrace();await this.scheduleNextAlarm();return json({ok:true});
  }
  if(path.endsWith('/internal/report-evidence')){if(!this.env.UOR_ADMIN_KEY||req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY))return json({ok:false},403);const uid=req.headers.get('x-uor-user'),b=await body(req);if(!this.room?.players?.some(p=>p.id===uid)&&!this.spectators.has(uid))return json({ok:false},403);const entries=await this.state.storage.get('chatEvidence')||[];const entry=entries.find(x=>String(x.id)===b.messageId&&x.userId===b.targetId);return entry?json({ok:true,entry}):json({ok:false},404);}
  if(path.endsWith('/internal/personal-mutes-updated')){
   if(req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY||''))return json({ok:false},403);
   const uid=req.headers.get('x-uor-user');if(this.sockets.has(uid)||this.presenceSockets.has(uid)){const ids=await personalMuteIds(this.env,uid);this.personalMutes.set(uid,new Set(ids));const message=JSON.stringify({type:'personal_mutes_updated',ids});const ws=this.sockets.get(uid);if(ws)try{ws.send(message)}catch{}for(const socket of this.presenceSockets.get(uid)||[])try{socket.send(message)}catch{}}
   return json({ok:true});
  }
  if(path==='/ws/lobby'){if(req.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});await this.state.storage.put('lobbyChatCleanup',true);let nextCleanup=Number(await this.state.storage.get('lobbyChatNextCleanupAt')||0);if(nextCleanup<=now()){nextCleanup=now()+GLOBAL_CHAT_RESET_MS;await this.state.storage.put('lobbyChatNextCleanupAt',nextCleanup);}try{await this.state.storage.setAlarm(nextCleanup)}catch{}const uid=req.headers.get('x-uor-user');const nick=String(req.headers.get('x-uor-name')||'Jogador').slice(0,24);const color=String(req.headers.get('x-uor-color')||'crimson');if(!uid)return new Response('Unauthorized',{status:401});const st=await this.env.DB.prepare('SELECT points,role FROM user_stats s JOIN users u ON u.id=s.user_id WHERE s.user_id=?').bind(uid).first();const rankId=rankFor(Number(st?.points||0)).id;const role=normalizeRole(st?.role);const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();this.socketSessions.set(server,req.headers.get('x-uor-session-id'));this.personalMutes.set(uid,new Set(await personalMuteIds(this.env,uid)));let set=this.presenceSockets.get(uid);if(!set){set=new Set();this.presenceSockets.set(uid,set);}set.add(server);this.presenceUsers.set(uid,{id:uid,nick,color,rankId,role,available:(await this.state.storage.get('available:'+uid))!==false,location:'lobby',lastSeenAt:now()});server.addEventListener('message',e=>{if(!this.allowSocketMessage(server)||typeof e.data!=='string'||e.data.length>8192)return;const task=this.validateSocketSession(uid,server).then(valid=>{if(!valid)return;const p=this.presenceUsers.get(uid);if(p){let m={};try{m=JSON.parse(e.data)}catch{}p.lastSeenAt=now();if(m.location==='lobby'||m.location==='game')p.location=m.location;this.broadcastPresence();}}).catch(()=>{try{server.close(4003,'session_invalid')}catch{}});this.state.waitUntil?.(task);});server.addEventListener('close',()=>{this.presenceSocketClosed(uid,server)});server.addEventListener('error',()=>{this.presenceSocketClosed(uid,server)});server.send(JSON.stringify({type:'presence_snapshot',users:[...this.presenceUsers.values()].sort((a,b)=>a.nick.localeCompare(b.nick,'pt-BR',{sensitivity:'base'}))}));this.broadcastPresence();return new Response(null,{status:101,webSocket:client});}
  if(path.endsWith('/internal/user-role-updated')){if(req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY||''))return json({ok:false,error:'Internal key inválida.'},403);const actorId=req.headers.get('x-uor-user');const actor=actorId?await this.env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(actorId).first():null;if(!actor||!isStaffOrAdmin(actor))return json({ok:false,error:'Sem permissão.'},403);const b=await body(req),targetId=String(b.targetId||'').trim(),role=normalizeRole(b.role);if(this.room?.players)for(const p of this.room.players)if(p.id===targetId)p.role=role;if(this.game?.players)for(const p of this.game.players)if(p.id===targetId)p.role=role;if(this.room||this.game){await this.persist();if(this.room)this.broadcast({type:'room_state',room:await this.roomForPublic()});if(this.game)this.broadcast({type:'game_state_sync',state:this.game});}const presenceSet=this.presenceSockets.get(targetId);if(presenceSet)for(const ws of presenceSet)try{ws.send(JSON.stringify({type:'role_updated',role}));}catch{}const roomWs=this.sockets.get(targetId);if(roomWs)try{roomWs.send(JSON.stringify({type:'role_updated',role}));}catch{}if(!this.room&&!this.game){const u=this.presenceUsers.get(targetId);if(u)u.role=role;this.broadcastPresence();}return json({ok:true});}
  if(path.endsWith('/internal/moderation-event')){if(req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY||''))return json({ok:false,error:'Internal key inválida.'},403);const actorId=req.headers.get('x-uor-user');const actor=actorId?await this.env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(actorId).first():null;if(!actor||!isStaffOrAdmin(actor))return json({ok:false,error:'Sem permissão.'},403);const b=await body(req);const targetId=String(b.targetId||'').trim();if(!targetId)return json({ok:false,error:'Jogador inválido.'},400);const targetNick=String(b.targetNick||'Jogador').slice(0,24);const kind=b.kind==='unmute'?'unmute':'mute';const text=kind==='mute'?`${targetNick} foi silenciado por 30 minutos.`:`O silêncio de ${targetNick} foi removido.`;this.broadcast({type:'room_relay',roomId:this.room?.id,payload:{type:'moderation_system',entry:{name:'Sistema',text,ts:now(),system:true}}});return json({ok:true});}
  if(path.endsWith('/internal/kick')){
    if(req.headers.get('x-uor-internal-key')!==String(this.env.UOR_ADMIN_KEY||''))return json({ok:false,error:'Internal key inválida.'},403);
    const actorId=req.headers.get('x-uor-user');const actor=actorId?await this.env.DB.prepare('SELECT id,nick,role FROM users WHERE id=?').bind(actorId).first():null;if(!actor||!isStaffOrAdmin(actor))return json({ok:false,error:'Sem permissão.'},403);
    const b=await body(req),targetId=String(b.targetId||'').trim(),targetNick=String(b.targetNick||'Jogador').slice(0,24),actorNick=String(b.actorNick||actor.nick||'Membro da equipe').slice(0,24),actorRole=normalizeRole(b.actorRole||actor.role),minutes=[0,5,10,20,30].includes(Number(b.minutes))?Number(b.minutes):0,expiresAt=Number(b.expiresAt||0),notice={type:'kick_notice',targetNick,actorNick,actorRole,minutes,expiresAt,ts:now()};
    let delivered=0;
    const set=this.presenceSockets.get(targetId);if(set){for(const ws of set){try{ws.send(JSON.stringify(notice));delivered++;}catch{}try{ws.close(4003,'kicked');}catch{}}this.presenceSockets.delete(targetId);this.presenceUsers.delete(targetId);this.broadcastPresence();}
    const p=this.game?.players?.find(x=>x.id===targetId);if(p){if(minutes>0){p.kickActive=true;p.kickUntil=expiresAt;p.aiControlled=true;p.connectionStatus='kicked';p.disconnectAt=now();p.reconnectUntil=expiresAt;this.game.log.push(`${p.name} recebeu Kick de ${minutes} minutos por ${actorRole} ${actorNick}. A IA continuará jogando durante o Kick.`);}else{p.kickActive=false;p.kickUntil=0;}await this.persist();this.broadcast({type:'game_state_sync',state:this.game});}
    const roomWs=this.sockets.get(targetId);if(roomWs){try{roomWs.send(JSON.stringify(notice));delivered++;}catch{}try{roomWs.close(4003,'kicked');}catch{}this.sockets.delete(targetId);}
    await this.persist();await this.scheduleNextAlarm();return json({ok:true,delivered});
  }
  if(path==='/internal/init'){
   const b=await body(req),uid=req.headers.get('x-uor-user');
   if(!uid||typeof b.id!=='string'||!b.id||b.id.length>128||b.hostConnId!==uid||!Array.isArray(b.players)||b.players.length!==1||b.players[0]?.id!==uid)return json({ok:false,error:'Inicialização inválida.'},400);
   if(this.room||this.game)return json({ok:false,error:'Sala já inicializada.'},409);
   const u=await this.env.DB.prepare('SELECT id,nick,role FROM users WHERE id=?').bind(uid).first();if(!u)return json({ok:false},403);
   const st=await this.env.DB.prepare('SELECT points FROM user_stats WHERE user_id=?').bind(uid).first();
   const player={id:uid,connId:uid,name:u.nick,role:normalizeRole(u.role),rankId:rankFor(Number(st?.points||0)).id,color:COLORS.includes(b.players[0].color)?b.players[0].color:COLORS[0],ready:true,eliminated:false};
   this.room={id:b.id,name:String(b.name||'Sala').slice(0,120),maxPlayers:6,settings:normalizeRoomSettings(b.settings),hostConnId:uid,players:[player],waitingLastActivityAt:now()};
   this.room.players.push(...createRoomBots(this.room));
   await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());await this.scheduleNextAlarm();return json({ok:true,room:await this.roomForPublic()});
  }
  if(path.endsWith('/internal/join')){if(this.game)return json({ok:false,error:'A partida já começou.'},409);const b=await body(req),uid=req.headers.get('x-uor-user');if(!uid||b.userId!==uid)return json({ok:false},403);if(!this.room)return json({ok:false,error:'Sala inexistente.'},404);const claim=await this.env.DB.prepare('SELECT room_id FROM user_room_memberships WHERE user_id=?').bind(uid).first();if(claim?.room_id!==this.room.id)return json({ok:false,error:'Sua reserva expirou. Entre na sala novamente.'},409);if(this.room.players.some(p=>p.id===uid))return json({ok:true,room:await this.roomForPublic(),assignedColor:this.room.players.find(p=>p.id===uid).color});if(this.room.players.length>=this.room.maxPlayers)return json({ok:false,error:'Sala cheia, jogador.'},409);const used=this.room.players.map(p=>p.color),color=COLORS.includes(b.color)&&!used.includes(b.color)?b.color:COLORS.find(c=>!used.includes(c))||COLORS[0];this.room.players.push({id:uid,connId:uid,name:String(b.name||'Jogador').slice(0,24),color,rankId:String(b.rankId||'soldado'),role:normalizeRole(b.role),ready:false,eliminated:false});await this.persist();this.broadcast({type:'room_state',room:await this.roomForPublic()});return json({ok:true,room:await this.roomForPublic(),assignedColor:color});}
  if(path.endsWith('/internal/status')){const uid=req.headers.get('x-uor-user');if(!this.game||!this.room)return json({ok:true,active:false});const p=this.game.players.find(x=>x.id===uid);if(!p)return json({ok:true,active:false});return json({ok:true,active:true,room:await this.roomForPublic(),state:this.gameStateForClient(this.game,uid,false),player:{id:p.id,name:p.name,aiControlled:!!p.aiControlled,abandoned:!!p.abandoned,eliminated:!!p.eliminated,reconnectUntil:Number(p.reconnectUntil||0),remainingMs:Math.max(0,Number(p.reconnectUntil||0)-now())}});}
  if(path.endsWith('/internal/reconnect')){
   const uid=req.headers.get('x-uor-user');
   if(!this.game||!this.room)return json({ok:false,error:'Nenhuma partida em andamento.'},404);
   if(this.game.winner||this.game.annulled||this.game.finishedAt)return json({ok:false,error:'A partida já foi encerrada.'},409);
   const p=this.game.players.find(x=>x.id===uid);
   if(!p||p.abandoned||p.eliminated)return json({ok:false,error:'Você não pode retornar a esta partida.'},403);
   if(p.kickActive){
    if(Number(p.kickUntil)>now())return json({ok:false,error:`Kick ativo por ${formatMsClock(Number(p.kickUntil)-now())}.`},403);
    p.reconnectUntil=Number(p.kickUntil)+RECONNECT_GRACE_MS;p.kickActive=false;p.kickUntil=0;
   }
   if(Number(p.reconnectUntil||0)>0&&Number(p.reconnectUntil)<=now()){
    await this.registerExpiredDesertion(uid);await this.closeIfOnlyAiAfterGrace();
    return json({ok:false,error:'O tempo de reconexão terminou. A deserção foi registrada.'},403);
   }
   await this.persist();await this.scheduleNextAlarm();
   return json({ok:true,room:await this.roomForPublic(),state:this.gameStateForClient(this.game,uid,false)});
  }
  if(path.endsWith('/internal/leave')){const uid=req.headers.get('x-uor-user');if(!this.room)return json({ok:true,deleted:true});if(this.game){const p=this.game.players.find(x=>x.id===uid);if(!p)return json({ok:false,error:'Jogador não encontrado.'},404);if(this.game.winner||this.game.resultRecorded){const closed=await this.closeFinishedRoom();return json({ok:true,deleted:!!closed,finished:true});}if(p.eliminated){this.sockets.get(uid)?.close(1000,'eliminated_leave');this.sockets.delete(uid);await releaseRoomClaim(this.env,uid,this.room.id);await syncRoomRow(this.env,this.room.id,await this.roomForPublic());await this.scheduleNextAlarm();return json({ok:true,room:await this.roomForPublic(),eliminated:true,abandoned:false});}if(p.abandoned){await this.closeIfOnlyAiAfterGrace();await this.scheduleNextAlarm();return json({ok:true,room:await this.roomForPublic(),abandoned:true});}const suspension=isTrainingGame(this.game)?null:await applyDesertionSuspension(this.env,uid);p.abandoned=true;p.aiControlled=true;p.connectionStatus='abandoned';p.disconnectAt=now();p.reconnectUntil=0;p.logLabel=isTrainingGame(this.game)?'Saiu do treino':'Desertou';this.sockets.get(uid)?.close(1000,'abandon');this.sockets.delete(uid);this.game.log.push(`${p.name} abandonou a partida.`);await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'game_state_sync',state:this.game});const training=isTrainingGame(this.game),closed=await this.closeIfOnlyAiAfterGrace();await this.scheduleNextAlarm();return json({ok:true,room:closed?null:await this.roomForPublic(),deleted:!!closed,abandoned:true,suspension,training});}this.sockets.get(uid)?.close(1000,'leave');this.sockets.delete(uid);await releaseRoomClaim(this.env,uid,this.room.id);this.room.players=this.room.players.filter(p=>p.id!==uid);if(!this.room.players.some(p=>!p.isBot)){const cleaned=await this.beginRoomCleanup(this.room.id);return cleaned?json({ok:true,deleted:true}):json({ok:false,error:'Encerramento em andamento. Tente novamente em instantes.'},503);}if(this.room.hostConnId===uid)this.room.hostConnId=this.room.players.find(p=>!p.isBot).id;await this.persist();this.broadcast({type:'room_state',room:await this.roomForPublic()});return json({ok:true,room:await this.roomForPublic()});}
  if(path==='/ws' || path.startsWith('/ws')){if(req.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});const uid=req.headers.get('x-uor-user');if(!uid||!this.room)return new Response('Unauthorized',{status:401});const isSpectator=req.headers.get('x-uor-spectator')==='1';if(isSpectator){if(!this.game||this.game.winner||this.game.annulled)return new Response('A partida não está em andamento.',{status:409});const u=await this.env.DB.prepare('SELECT id,role FROM users WHERE id=?').bind(uid).first();if(!u||!isStaffOrAdmin(u))return new Response('Acesso de espectador permitido apenas para STAFF/ADMIN.',{status:403});if(this.game?.players?.some(p=>p.id===uid||p.connId===uid))return new Response('Este cargo já participa desta partida.',{status:409});this.spectators.add(uid);}else{this.spectators.delete(uid);if(this.game){const p=this.game.players.find(x=>x.id===uid);if(!p||p.abandoned||p.eliminated)return new Response('Forbidden',{status:403});if(p.kickActive&&Number(p.kickUntil||0)>now())return new Response('Kick temporário ativo.',{status:403});if(this.game.winner||this.game.annulled||this.game.finishedAt)return new Response('A partida já foi encerrada.',{status:409});if(p.kickActive){p.reconnectUntil=Number(p.kickUntil)+RECONNECT_GRACE_MS;p.kickActive=false;p.kickUntil=0;}if(Number(p.reconnectUntil||0)>0&&Number(p.reconnectUntil)<=now()){await this.registerExpiredDesertion(uid);await this.closeIfOnlyAiAfterGrace();return new Response('O tempo de reconexão terminou.',{status:403});}p.aiControlled=false;p.connectionStatus='online';p.disconnectAt=null;p.reconnectUntil=null;await this.persist();}else if(!this.room.players?.some(p=>p.id===uid)){return new Response('Forbidden',{status:403});}}const publicRoom=await this.roomForPublic();const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();this.socketSessions.set(server,req.headers.get('x-uor-session-id'));this.personalMutes.set(uid,new Set(await personalMuteIds(this.env,uid)));const previous=this.sockets.get(uid);if(previous&&previous!==server){try{previous.close(4001,'replaced_by_new_connection')}catch{}}this.sockets.set(uid,server);if(!this.game&&!isSpectator){const p=this.room.players.find(p=>p.id===uid);if(p){p.waitingSeenAt=now();delete p.waitingDisconnectedAt;}await this.persist();}if(this.game&&!isSpectator){const gp=this.game.players.find(x=>x.id===uid);if(gp)gp.lastSeenAt=now();}server.addEventListener('message',e=>{const task=this.onMessage(uid,server,e).catch(err=>console.error('UOR socket action error',err));this.state.waitUntil?.(task);});server.addEventListener('close',()=>{const task=this.onClose(uid,server).catch(err=>console.error('UOR socket close error',err));this.state.waitUntil?.(task);});server.send(JSON.stringify({type:'room_state',room:publicRoom}));if(this.game)server.send(JSON.stringify({type:'game_state_sync',state:this.gameStateForClient(this.game,uid,isSpectator)}));this.scheduleNextAlarm();return new Response(null,{status:101,webSocket:client});}
  return json({ok:false,error:'Not found'},404);
 }
 async checkConnectionWatchdog(){
  if(!this.game||this.game.winner||this.game.annulled||this.game.resultRecorded)return;
  const ts=now();
  for(const p of this.game.players){
   if(p.eliminated||p.abandoned||p.aiControlled)continue;
   const ws=this.sockets.get(p.id),lastSeen=Number(p.lastSeenAt||0);
   if(!ws||(lastSeen>0&&lastSeen+CONNECTION_WATCHDOG_MS<=ts)){
    if(ws){try{ws.close(4000,'heartbeat timeout')}catch{}if(this.sockets.get(p.id)===ws)this.sockets.delete(p.id);}
    p.aiControlled=true;p.connectionStatus='disconnected';p.disconnectAt=ts;p.reconnectUntil=ts+RECONNECT_GRACE_MS;
    this.game.log.push(`${p.name} perdeu a conexão. IA assumiu temporariamente por até 10 minutos.`);
    if(this.game.hostConnId===p.id){const next=this.game.players.find(x=>!x.eliminated&&!x.abandoned&&!x.aiControlled&&this.sockets.has(x.id));if(next){this.game.hostConnId=next.id;this.room.hostConnId=next.id;this.game.log.push(`${next.name} assumiu o comando da batalha.`);this.broadcast({type:'host_migrated',newHostConnId:next.id});}}
   }
  }
 }
 async onCloseUnlocked(uid,ws){
  if(this.sockets.get(uid)!==ws)return;
  this.sockets.delete(uid);this.personalMutes.delete(uid);this.userBlocks.delete(uid);this.chatLastSent.delete(uid);
  if(this.spectators.has(uid)){this.spectators.delete(uid);return;}
  if(!this.room)return;
  if(!this.game){const p=this.room.players.find(p=>p.id===uid);if(p)p.waitingDisconnectedAt=now();await this.persist();await this.scheduleNextAlarm();return;}

  const p=this.game.players.find(x=>x.id===uid);if(!p||p.eliminated||p.abandoned)return;
  const kickActiveNow=p.kickActive&&Number(p.kickUntil||0)>now();
  if(!kickActiveNow){
   const ts=now();p.aiControlled=true;p.connectionStatus='disconnected';p.disconnectAt=ts;
   if(!Number(p.reconnectUntil||0)||Number(p.reconnectUntil)<=ts)p.reconnectUntil=ts+RECONNECT_GRACE_MS;
   this.game.log.push(`${p.name} ficou desconectado. IA assumiu temporariamente.`);
  }
  if(this.game.hostConnId===uid){const next=this.game.players.find(x=>!x.eliminated&&!x.abandoned&&!x.aiControlled&&this.sockets.has(x.id));if(next){this.game.hostConnId=next.id;this.room.hostConnId=next.id;this.game.log.push(`${next.name} assumiu o comando da batalha.`);this.broadcast({type:'host_migrated',newHostConnId:next.id});}}
  await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'game_state_sync',state:this.game});await this.scheduleNextAlarm();
 }
 async scheduleNextAlarm(){
  if(await this.state.storage.get('pendingRoomCleanup')){await this.state.storage.setAlarm(now()+5000);return;}
  if(this.room&&!this.game){await this.state.storage.setAlarm(now()+5000);return;}
  const times=[],ts=now(),hasConnectedHuman=!!this.game?.players?.some(p=>!p.eliminated&&!p.abandoned&&!p.aiControlled&&this.sockets.has(p.id));
  if(this.game?.winner||this.game?.annulled){
   if(!this.game.finishedAt)this.game.finishedAt=ts;
   if(this.game.resultRecorded)times.push(Number(this.game.finishedAt)+FINISHED_ROOM_CLOSE_MS);
   else times.push(Math.max(ts+250,Number(this.game.resultRecordRetryAt||0)||ts+RESULT_RETRY_MS));
  }
  if(this.game?.airAttackPending?.resolveAt)times.push(Number(this.game.airAttackPending.resolveAt));
  if(this.game?.players)for(const p of this.game.players){
   if(p.aiControlled){
    if(p.kickActive&&Number(p.kickUntil||0)>ts)times.push(Number(p.kickUntil));
    else if(!p.abandoned&&Number(p.reconnectUntil||0)>0)times.push(Number(p.reconnectUntil));
    if(hasConnectedHuman&&!this.game.winner&&!this.game.annulled&&!this.game.resultRecorded&&this.game.players[this.game.turnIndex]?.id===p.id){if(this.game.aiScheduledPlayerId!==p.id||!Number(this.game.aiNextActionAt)){this.game.aiScheduledPlayerId=p.id;this.game.aiNextActionAt=ts+1200;await this.state.storage.put('game',this.game);}times.push(Number(this.game.aiNextActionAt));}
   }else if(!p.abandoned&&!p.eliminated&&this.sockets.has(p.id)){
    const lastSeen=Number(p.lastSeenAt||ts);times.push(lastSeen+CONNECTION_WATCHDOG_MS);
   }
  }
  if(!times.length)return;
  const at=Math.max(ts+250,Math.min(...times.filter(Number.isFinite)));
  try{await this.state.storage.setAlarm(at);}catch{}
 }
 async runAiTurn(){
  if(!this.game||this.game.winner||this.game.annulled||this.game.resultRecorded)return false;
  const p=this.game.players[this.game.turnIndex];if(!p||!p.aiControlled||p.eliminated)return false;
  const hasConnectedHuman=this.game.players.some(x=>!x.eliminated&&!x.abandoned&&!x.aiControlled&&this.sockets.has(x.id));if(!hasConnectedHuman)return false;
  if(p.kickActive&&Number(p.kickUntil||0)<=now()){p.reconnectUntil=Number(p.kickUntil)+RECONNECT_GRACE_MS;p.kickActive=false;p.kickUntil=0;p.connectionStatus='disconnected';this.game.log.push(`${p.name} encerrou o Kick e entrou no período normal de reconexão de 10 minutos.`);await this.persist();}
  if(!p.abandoned&&!p.kickActive&&Number(p.reconnectUntil||0)>0&&Number(p.reconnectUntil)<=now()){await this.registerExpiredDesertion(p.id);}
  if(this.game.aiScheduledPlayerId===p.id&&Number(this.game.aiNextActionAt)>now())return false;this.game.aiNextActionAt=0;this.game.aiScheduledPlayerId=null;
  let action=chooseAiAction(this.game,p.id);if(!action)return false;
  let candidate=structuredClone(this.game),next=applyAction(candidate,action,true);
  if(!next){const fallback=chooseAiFallbackAction(this.game,p.id);if(!fallback||fallback.kind===action.kind)return false;action=fallback;candidate=structuredClone(this.game);next=applyAction(candidate,action,true);if(!next)return false;}
  if(action.kind==='airAttack'&&next.airAttackPending)next.airAttackPending.resolveAt=now()+6000;
  this.game=next;this.game.winner=checkWinner(this.game);
  if(this.game.winner&&!this.game.finishedAt)this.game.finishedAt=now();
  if(this.game.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);
  await this.persist();if(action.kind==='airAttack')this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'air_attack_visual',action,ts:now()}});this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});return true;
 }
 async beginRoomCleanup(rid){
  await this.state.storage.put('pendingRoomCleanup',{id:rid});
  this.room=null;this.game=null;
  return this.cleanupClosedRoom();
 }
 async cleanupClosedRoom(){
  const pending=await this.state.storage.get('pendingRoomCleanup');if(!pending)return true;
  this.room=null;this.game=null;
  try{
   await ensureCommunitySchema(this.env);
   await this.env.DB.batch([this.env.DB.prepare('DELETE FROM user_room_memberships WHERE room_id=?').bind(pending.id),this.env.DB.prepare('DELETE FROM rooms WHERE id=?').bind(pending.id)]);
   await this.state.storage.put('room',null);await this.state.storage.put('game',null);
   await this.state.storage.delete('chatEvidence');await this.state.storage.delete('membershipRoomId');
   await this.state.storage.delete('pendingRoomCleanup');return true;
  }catch(e){console.error('UOR room cleanup will retry',e);await this.state.storage.setAlarm(now()+5000);return false;}
 }
 async closeFinishedRoom(reason='A partida foi encerrada.'){
  if(!this.game||!this.room||!this.game.resultRecorded)return false;
  const rid=this.room.id;
  this.broadcast({type:'room_relay',roomId:rid,payload:{type:'match_closed',reason}});await Promise.all([...this.sockets.values()].map(ws=>this.socketSends.get(ws)||Promise.resolve()));
  for(const ws of this.sockets.values()){try{ws.close(1000,'match_closed')}catch{}}this.sockets.clear();
  for(const set of this.presenceSockets.values())for(const ws of set){try{ws.close(1000,'match_closed')}catch{}}this.presenceSockets.clear();this.presenceUsers.clear();this.spectators.clear();
  this.userBlocks.clear();this.chatLastSent.clear();return this.beginRoomCleanup(rid);
 }
 async closeIfOnlyAiAfterGrace(){
  if(!this.game||!this.room||this.game.winner||this.game.annulled||this.game.resultRecorded)return false;
  const active=this.game.players.filter(p=>!p.isBot&&!p.eliminated);
  if((!active.length&&!isTrainingGame(this.game))||active.some(p=>!p.aiControlled&&!p.abandoned))return false;
  const ts=now();
  for(const p of active){
   if(p.abandoned)continue;
   if(p.kickActive&&Number(p.kickUntil||0)>ts)return false;
   if(Number(p.reconnectUntil||0)>ts)return false;
  }
  for(const p of [...active])if(!p.abandoned&&!p.kickActive)await this.registerExpiredDesertion(p.id);
  if(!this.game||!this.room)return false;
  const stillActiveHuman=this.game.players.some(p=>!p.eliminated&&!p.abandoned&&!p.aiControlled&&this.sockets.has(p.id));if(stillActiveHuman)return false;
  this.game.annulled=true;this.game.endedReason='no_human_players';this.game.finishedAt=this.game.finishedAt||now();
  this.game.log.push('Partida encerrada: não restou nenhum jogador humano conectado após o prazo de reconexão.');
  const committed=await recordResults(this.env,this.game);
  await this.persist();this.broadcast({type:'game_state_sync',state:this.game});
  if(!committed)return false;
  return this.closeFinishedRoom(isTrainingGame(this.game)?'Treino encerrado: não restou nenhum jogador humano. Sem pontos ou penalidades.':'A partida foi encerrada automaticamente porque não restou nenhum jogador humano. As deserções foram registradas.');
 }
 async registerExpiredDesertion(uid){
  const p=this.game?.players?.find(x=>x.id===uid);if(!p||p.isBot||p.abandoned||p.eliminated||p.kickActive)return null;
  const suspension=isTrainingGame(this.game)?null:await applyDesertionSuspension(this.env,uid);
  p.abandoned=true;p.aiControlled=true;p.connectionStatus='abandoned';p.disconnectAt=p.disconnectAt||now();p.reconnectUntil=0;p.logLabel=isTrainingGame(this.game)?'Saiu do treino':'Desertou';
  this.game.log.push(isTrainingGame(this.game)?`${p.name} saiu do treino após o prazo de reconexão, sem penalidade.`:`${p.name} não retornou em 10 minutos e foi registrado como deserção.`);
  this.broadcast({type:'game_state_sync',state:this.game});await this.persist();if(this.room)await syncRoomRow(this.env,this.room.id,await this.roomForPublic());return suspension;
 }
 async resolveAirAttack(){
  if(!this.game?.airAttackPending||this.game.winner||this.game.annulled||this.game.resultRecorded)return false;
  const pending=this.game.airAttackPending;
  if(Number(pending.resolveAt||0)>now())return false;
  if(!validTerritoryId(pending.toId)||!this.game.players?.some(p=>p.id===pending.attackerId)||!Number.isSafeInteger(Number(pending.destroyed))){this.game.airAttackPending=null;await this.persist();return false;}
  const candidate=structuredClone(this.game),resolved=finalizeAirAttack(candidate);if(!resolved)return false;
  candidate.winner=checkWinner(candidate);if(candidate.winner&&!candidate.finishedAt)candidate.finishedAt=now();
  if(candidate.winner&&!candidate.resultRecorded)await recordResults(this.env,candidate);
  this.game=candidate;await this.persist();this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});return true;
 }
 async alarmUnlocked(){if(await this.state.storage.get('pendingRoomCleanup')){await this.cleanupClosedRoom();return;}if(this.room&&!this.game){await this.checkWaitingRoom();if(this.room)await this.scheduleNextAlarm();return;}
  const lobbyChatCleanup=await this.state.storage.get('lobbyChatCleanup');
  if(lobbyChatCleanup){
   const due=Number(await this.state.storage.get('lobbyChatNextCleanupAt')||0);
   if(!due||due<=now()){await cleanupGlobalChat(this.env);if(this.presenceSockets.size>0){const next=now()+GLOBAL_CHAT_RESET_MS;await this.state.storage.put('lobbyChatNextCleanupAt',next);try{await this.state.storage.setAlarm(next)}catch{}}else{await this.state.storage.delete('lobbyChatCleanup');await this.state.storage.delete('lobbyChatNextCleanupAt');}}
   else{try{await this.state.storage.setAlarm(due)}catch{}}
  }
  await this.resolveAirAttack();await this.checkConnectionWatchdog();
  if(this.game){await this.persist();this.broadcast({type:'room_relay',roomId:this.room?.id,payload:{type:'game_state_sync',state:this.game}});}
  if(this.game){
   if(this.game.winner||this.game.annulled){
    if(!this.game.finishedAt)this.game.finishedAt=now();
    if(!this.game.resultRecorded)await recordResults(this.env,this.game);
    if(this.game.resultRecorded&&now()>=Number(this.game.finishedAt||0)+FINISHED_ROOM_CLOSE_MS){await this.closeFinishedRoom();return;}
    await this.persist();await this.scheduleNextAlarm();return;
   }
   for(const p of [...this.game.players]){
    if(p.kickActive&&Number(p.kickUntil||0)>0&&Number(p.kickUntil)<=now()){p.reconnectUntil=Number(p.kickUntil)+RECONNECT_GRACE_MS;p.kickActive=false;p.kickUntil=0;p.connectionStatus='disconnected';this.game.log.push(`${p.name} encerrou o Kick e entrou no período normal de reconexão de 10 minutos.`);}
    if(p.aiControlled&&!p.abandoned&&!p.kickActive&&Number(p.reconnectUntil||0)>0&&Number(p.reconnectUntil)<=now())await this.registerExpiredDesertion(p.id);
   }
   if(await this.closeIfOnlyAiAfterGrace())return;
   await this.runAiTurn();
   if(this.game?.winner&&!this.game.finishedAt)this.game.finishedAt=now();
   if(this.game?.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);
   if(this.game)await this.closeIfOnlyAiAfterGrace();
  }
  await this.persist();await this.scheduleNextAlarm();
 }
 async onMessageUnlocked(uid,ws,e){if(!this.allowSocketMessage(ws)||typeof e.data!=='string'||e.data.length>8192)return;if(!await this.validateSocketSession(uid,ws))return;if(this.sockets.get(uid)!==ws){try{ws.close(4001,'stale_connection')}catch{}return;}let m;try{m=JSON.parse(e.data)}catch{return}if(m?.type==='room_chat'||m?.type==='game_chat'){if(!await hasChatConsent(this.env,uid)){ws.send(JSON.stringify({type:'room_relay',roomId:this.room?.id,payload:{type:'chat_rejected',reason:'Leia e aceite os termos antes de usar o chat.'}}));return;}const ts=now();if(ts-Number(this.chatLastSent.get(uid)||0)<1000)return;this.chatLastSent.set(uid,ts);}const isSpectator=this.spectators.has(uid);if(this.game&&!isSpectator){const hp=this.game.players.find(x=>x.id===uid);if(hp)hp.lastSeenAt=now();}if(!m?.type)return;if(isSpectator&&m.type!=='sync_request'&&m.type!=='game_chat'&&m.type!=='heartbeat'){ws.send(JSON.stringify({type:'room_relay',roomId:this.room?.id,payload:{type:'spectator_action_rejected',reason:'Modo espectador: ações de jogo estão bloqueadas.'}}));return;}if(m.type==='heartbeat'){if(this.room&&!this.game&&!isSpectator){this.room.waitingLastActivityAt=now();const p=this.room.players.find(p=>p.id===uid);if(p){p.waitingSeenAt=now();delete p.waitingDisconnectedAt;}}try{ws.send(JSON.stringify({type:'heartbeat_ack',ts:now()}))}catch{};if(!isSpectator)await this.persist();await this.scheduleNextAlarm();return;}if(m.type==='sync_request'){try{ws.send(JSON.stringify({type:'heartbeat_ack',ts:now()}))}catch{};if(this.game){normalizeObjectives(this.game);if(this.game.phase==='reforco'&&(!Object.prototype.hasOwnProperty.call(this.game,'continentBonusRemaining')||!Object.prototype.hasOwnProperty.call(this.game,'reinforcementStage'))){const cp=this.game.players?.[this.game.turnIndex];if(cp)beginReinforcementPhase(this.game,cp.id);}await this.persist();ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.gameStateForClient(this.game,uid,isSpectator)}}));}else if(this.room)ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'room_state',room:await this.roomForPublic()}}));await this.scheduleNextAlarm();return;}if(m.type==='room_chat'){const muted=await getActiveMute(this.env,uid);if(muted){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'chat_rejected',reason:`Você está silenciado por mais ${Math.max(1,Math.ceil((muted.expiresAt-now())/60000))} minuto(s).`}}));return;}const rp=this.room.players.find(p=>p.id===uid);const entry={id:uuid(),userId:uid,name:rp?.name||'Jogador',color:rp?.color||COLORS[0],rankId:rp?.rankId||'soldado',role:normalizeRole(rp?.role),text:String(m.entry?.text||'').trim().slice(0,400),ts:now()};if(!entry.text)return;await this.saveChatEvidence(entry);this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'room_chat',entry}});return;}
  if(m.type==='game_chat'){if(!this.game)return;const muted=await getActiveMute(this.env,uid);if(muted){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'chat_rejected',reason:`Você está silenciado por mais ${Math.max(1,Math.ceil((muted.expiresAt-now())/60000))} minuto(s).`}}));return;}const text=String(m.entry?.text||'').trim().slice(0,400);if(!text)return;if(isSpectator){const u=await this.env.DB.prepare('SELECT u.id,u.nick,u.role,s.points FROM users u JOIN user_stats s ON s.user_id=u.id WHERE u.id=?').bind(uid).first();if(!u||!isStaffOrAdmin(u))return;const entry={id:uuid(),userId:uid,name:u.nick,color:COLORS[0],rankId:rankFor(Number(u.points||0)).id,role:normalizeRole(u.role),text,ts:now(),spectator:true};await this.saveChatEvidence(entry);this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_chat',entry}});return;}const p=this.game.players.find(x=>x.id===uid);if(!p||p.eliminated)return;const entry={id:uuid(),userId:uid,name:p.name,color:p.color,rankId:p.rankId||'soldado',role:normalizeRole(p.role),text,ts:now()};await this.saveChatEvidence(entry);this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_chat',entry}});return;}
  if(m.type==='room_ready'){if(this.game||!this.room||uid===this.room.hostConnId)return;const p=this.room.players.find(x=>x.id===uid);if(!p)return;p.ready=!p.ready;await this.persist();this.broadcast({type:'room_state',room:await this.roomForPublic()});await syncRoomRow(this.env,this.room.id,await this.roomForPublic());return;}
  if(m.type==='start_game'){await this.checkWaitingRoom();if(!this.room||this.room.players.some(p=>!p.isBot&&(!this.sockets.has(p.id)||p.waitingDisconnectedAt||now()-Number(p.waitingSeenAt||0)>=20000))){ws.send(JSON.stringify({type:'room_relay',roomId:this.room?.id,payload:{type:'chat_rejected',reason:'Aguarde todos os jogadores reconectarem à sala.'}}));return;}const othersReady=this.room?.players?.length>=2&&this.room.players.filter(p=>p.id!==this.room.hostConnId).every(p=>p.ready===true);if(uid!==this.room.hostConnId||!othersReady||this.game)return;this.room.settings=normalizeRoomSettings(this.room.settings);this.game=initGame(this.room);this.room.gameActive=true;await this.persist();await syncRoomRow(this.env,this.room.id,await this.roomForPublic());this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_start',state:this.game}});return;}
  if(m.type==='air_attack_request'){
   if(!this.game)return;
   if(this.game.winner||this.game.annulled||this.game.finishedAt||this.game.resultRecorded){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'A partida já foi encerrada.'}}));return;}
   if(!isPlainObject(m.action)||m.action.kind!=='airAttack'||!validTerritoryId(m.action.toId)){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'Ataque aéreo inválido.'}}));return;}
   const rawImpact=m.action.visualImpactMs==null?6000:Number(m.action.visualImpactMs);
   if(!Number.isFinite(rawImpact)||rawImpact<0){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'Tempo visual do ataque aéreo inválido.'}}));return;}
   const a={...m.action,kind:'airAttack',byConnId:uid},candidate=structuredClone(this.game),next=applyAction(candidate,a);
   if(!next||!next.airAttackPending){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'Ataque aéreo recusado pelo servidor.'}}));return;}
   const resolveDelay=Math.max(4000,Math.min(16000,Math.round(rawImpact||6000)));next.airAttackPending.resolveAt=now()+resolveDelay;this.game=next;
   await this.persist();const visualTs=now(),pendingStartedAt=next.airAttackPending.startedAt;
   this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'air_attack_visual',action:a,ts:visualTs}});
   this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});
   await this.scheduleNextAlarm();
   return;
  }
  if(m.type==='game_action'){
   if(!this.game)return;
   if(this.game.winner||this.game.annulled||this.game.finishedAt||this.game.resultRecorded){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'A partida já foi encerrada.'}}));return;}
   if(!isPlainObject(m.action)||m.action.kind==='airAttack'){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'Ação inválida ou canal incorreto.'}}));return;}
   const a={...m.action,byConnId:uid},candidate=structuredClone(this.game),next=applyAction(candidate,a);
   if(!next){ws.send(JSON.stringify({type:'room_relay',roomId:this.room.id,payload:{type:'game_action_rejected',reason:'Ação recusada pelo servidor. Confira valores inteiros, fase, alvo e sincronização.'}}));return;}
   this.game=next;this.game.winner=checkWinner(this.game);
   if(this.game.winner&&!this.game.finishedAt)this.game.finishedAt=now();
   if(this.game.winner&&!this.game.resultRecorded)await recordResults(this.env,this.game);
   await this.persist();this.broadcast({type:'room_relay',roomId:this.room.id,payload:{type:'game_state_sync',state:this.game}});await this.scheduleNextAlarm();
  }
 }
}

async function route(req,env,ctx){try{return await routeInner(req,env,ctx);}catch(e){console.error('UOR route error',e);if(e.status)return json({ok:false,error:e.message},e.status);if(new URL(req.url).pathname==='/api/account/delete')return json({ok:false,code:'DELETE_PENDING',error:'Não foi possível concluir a exclusão. Se a senha foi confirmada, a solicitação permanece registrada. Repita a operação ou tente novamente mais tarde.'},503);return json({ok:false,error:e.status?e.message:'Erro interno do servidor.'},e.status||500);}}
async function routeInner(req,env,ctx){const url=new URL(req.url),p=url.pathname;if(req.method==='POST'&&req.headers.get('Origin')&&req.headers.get('Origin')!==url.origin)return json({ok:false,error:'Origem inválida.'},403);if(p==='/api/account/delete'&&req.method==='POST')return apiDeleteAccount(req,env);if(p==='/api/admin/bootstrap-role'&&req.method==='POST')return apiAdminBootstrapRole(req,env);if(p==='/api/auth/me')return apiAuthMe(req,env);if(p==='/api/auth/register'&&req.method==='POST')return apiAuthRegister(req,env);if(p==='/api/auth/login'&&req.method==='POST')return apiAuthLogin(req,env);if(p==='/api/auth/logout'&&req.method==='POST')return apiAuthLogout(req,env);const user=await authUser(req,env);if(!user)return json({ok:false,error:'Faça login para continuar.'},401);if(user.deleting)return json({ok:false,error:'Exclusão pendente. Repita a solicitação em /delete-account.'},403); if(p==='/api/terms')return apiTerms(req,env,user);if(p==='/api/reports'||p==='/api/moderation/reports')return apiReports(req,env,user);if(p==='/api/profile')return apiProfile(req,env,user);if(p==='/api/public-profile')return apiPublicProfile(req,env,user.id);if(p==='/api/ranking')return apiRanking(req,env);if(p==='/api/history')return apiHistory(req,env,user);if(p==='/api/public-history')return apiPublicHistory(req,env,user.id);if(p==='/api/chat/mutes')return apiPersonalMutes(req,env,user);if(p==='/api/chat')return apiChat(req,env,user);if(p==='/api/moderation/mute'&&req.method==='POST')return apiModerationMute(req,env,user);if(p==='/api/moderation/unmute'&&req.method==='POST')return apiModerationUnmute(req,env,user);if(p==='/api/moderation/kick'&&req.method==='POST')return apiModerationKick(req,env,user);if(p==='/api/moderation/status'&&req.method==='GET')return apiModerationStatus(req,env,user);if(p==='/api/moderation/active'&&req.method==='GET')return apiModerationActive(req,env,user);if(p==='/api/admin/users'&&req.method==='GET')return apiAdminUsers(req,env,user);if(p==='/api/admin/role'&&req.method==='POST')return apiAdminSetRole(req,env,user);if(p==='/api/admin/remove-suspension'&&req.method==='POST')return apiAdminRemoveSuspension(req,env,user);if(p==='/api/social'&&req.method==='POST'){const d=await getRoomDO(env,'__uor_lobby_presence__');return d.fetch(new Request('https://uor-room/internal/social',{method:'POST',headers:internalHeaders(env,user.id),body:JSON.stringify(await body(req))}));}
if(p==='/api/admin/close-waiting'&&req.method==='POST'){if(normalizeRole(user.role)!=='ADMIN')return json({ok:false},403);const b=await body(req),d=await getRoomDO(env,String(b.roomId||''));return d.fetch(new Request('https://uor-room/internal/admin-close-waiting',{method:'POST',headers:internalHeaders(env,user.id),body:'{}'}));}
if(p==='/api/rooms'&&req.method==='GET')return apiRooms(req,env,user,ctx);if(p==='/api/rooms'&&req.method==='POST')return apiCreateRoom(req,env,user);if(p==='/api/waiting-room'&&req.method==='GET')return apiWaitingRoom(req,env,user);if(p==='/api/active-match'&&req.method==='GET')return apiActiveMatch(req,env,user);let m=p.match(/^\/api\/rooms\/([^/]+)\/(join|leave|reconnect)$/);if(m&&req.method==='POST'){if(m[2]==='join')return apiJoinRoom(req,env,user,m[1]);if(m[2]==='leave')return apiLeaveRoom(req,env,user,m[1]);return apiReconnectRoom(req,env,user,m[1]);}return json({ok:false,error:'Endpoint não encontrado.'},404);}

export default {async fetch(req,env,ctx){
 const url=new URL(req.url),legal=publicLegalPage(url.pathname,env);if(legal)return legal;
 if(url.pathname.startsWith('/ws/')){
  if(req.headers.get('Origin')&&req.headers.get('Origin')!==url.origin)return new Response('Origem inválida.',{status:403});
  const lobby=url.pathname==='/ws/lobby',match=url.pathname.match(/^\/ws\/rooms\/([a-zA-Z0-9_-]{1,128})$/);
  if(!lobby&&!match)return new Response('Not found',{status:404});
  if(req.method!=='GET'||req.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('WebSocket required',{status:426});
  const user=await authUser(req,env);if(!user||user.deleting)return new Response('Unauthorized',{status:401});
  const headers=new Headers(req.headers);for(const name of [...headers.keys()])if(name.toLowerCase().startsWith('x-uor-'))headers.delete(name);
  headers.set('x-uor-user',user.id);headers.set('x-uor-session-id',user.session_id);
  const spectator=!lobby&&url.searchParams.get('spectator')==='1';
  if(spectator){if(!isStaffOrAdmin(user))return new Response('Apenas STAFF/ADMIN pode assistir partidas.',{status:403});headers.set('x-uor-spectator','1');}
  if(lobby){headers.set('x-uor-name',user.nick);headers.set('x-uor-color',COLORS[0]);}
  const d=await getRoomDO(env,lobby?'__uor_lobby_presence__':match[1]);
  return d.fetch(new Request(lobby?'https://uor-room/ws/lobby':'https://uor-room/ws',{method:'GET',headers}));
 }
 if(url.pathname.startsWith('/api/'))return route(req,env,ctx);return env.ASSETS.fetch(req);
}};
