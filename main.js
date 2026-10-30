const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const fs = require('fs'), fsp = fs.promises, path = require('path'), os = require('os'), crypto = require('crypto');
const { spawn, spawnSync } = require('child_process');
const AdmZip = require('adm-zip');

const CFG = path.join(app.getPath('appData'), 'Mobinhrr', 'Grassed.json');
const DEF = path.join(app.getPath('appData'), 'Mobinhrr', 'Grassy'); // C:\Users\<you>\AppData\Roaming\Mobinhrr\Grassy
const dflt = () => ({ dir: DEF, ram: 2048, java: 'java', accent: '#4ade80', account: 'a1', instance: 'i1',
  accounts: [{ id: 'a1', type: 'offline', name: 'Player' }], instances: [{ id: 'i1', name: 'Latest release', ver: 'latest', loader: 'vanilla' }] });
let C = (() => { try { return { ...dflt(), ...JSON.parse(fs.readFileSync(CFG, 'utf8')) }; } catch { return dflt(); } })();
const R = () => C.dir || DEF;

const MANIFEST = 'https://piston-meta.mojang.com/mc/game/version_manifest_v2.json';
const META = { fabric: 'https://meta.fabricmc.net/v2', quilt: 'https://meta.quiltmc.org/v3' };
const PROMO = 'https://files.minecraftforge.net/net/minecraftforge/forge/promotions_slim.json';
const NEO = 'https://maven.neoforged.net/api/maven/versions/releases/net/neoforged/neoforge';
const MR = 'https://api.modrinth.com/v2';
const OS = { win32: 'windows', darwin: 'osx', linux: 'linux' }[process.platform];
const ARCH = process.arch === 'ia32' ? 'x86' : process.arch;
let win;
const send = (ch, d) => win && !win.isDestroyed() && win.webContents.send(ch, d);

const get = async (u, json = true, o = {}) => { const r = await fetch(u, { ...o, headers: { 'User-Agent': 'Mobinhrr/Grassed/0.1.1', ...o.headers } }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return json ? r.json() : Buffer.from(await r.arrayBuffer()); };
const netErr = e => e instanceof TypeError || /fetch failed|ENOTFOUND|ECONNRESET|ETIMEDOUT/.test(e.message) ? 'No internet connection. Check your network and try again.' : e.message;
const sha1 = b => crypto.createHash('sha1').update(b).digest('hex');
async function dl(url, dest, hash) {
  try { const b = await fsp.readFile(dest); if (!hash || sha1(b) === hash) return; } catch {}
  await fsp.mkdir(path.dirname(dest), { recursive: true });
  for (let k = 0; ; k++) try { return await fsp.writeFile(dest, await get(url, false)); } catch (e) { if (k > 1) throw e; }
}
async function pool(items, n, fn) { let i = 0; await Promise.all(Array.from({ length: n }, async () => { while (i < items.length) await fn(items[i++]); })); }
const ruleOk = rules => !rules || rules.reduce((ok, r) => {
  const o = r.os, m = !r.features && (!o || ((!o.name || o.name === OS) && (!o.arch || o.arch === ARCH) && (!o.version || new RegExp(o.version).test(os.release()))));
  return m ? r.action === 'allow' : ok;
}, false);
const offlineUUID = n => { const h = crypto.createHash('md5').update('OfflinePlayer:' + n).digest(); h[6] = (h[6] & 15) | 48; h[8] = (h[8] & 63) | 128; return h.toString('hex'); };
const mvn = n => { const [g, a, v, c] = n.split(':'); return `${g.replace(/\./g, '/')}/${a}/${v}/${a}-${v}${c ? '-' + c : ''}.jar`; };
const neoMc = v => { const [a, b] = v.split('.'); return b === '0' ? `1.${a}` : `1.${a}.${b}`; };

let M;
const man = async () => M || (M = await get(MANIFEST).then(m => { fs.mkdirSync(R(), { recursive: true }); fs.writeFileSync(path.join(R(), 'manifest.json'), JSON.stringify(m)); return m; })
  .catch(() => JSON.parse(fs.readFileSync(path.join(R(), 'manifest.json'), 'utf8'))));

async function injector() {
  const f = path.join(R(), 'authlib-injector.jar'), vf = f + '.ver';
  try {
    const j = await get('https://authlib-injector.yushi.moe/artifact/latest.json');
    if (!fs.existsSync(f) || fs.readFileSync(vf, 'utf8') !== String(j.build_number)) { await fsp.writeFile(f, await get(j.download_url, false)); fs.writeFileSync(vf, String(j.build_number)); }
  } catch (e) { if (!fs.existsSync(f)) throw e; }
  return f;
}

// ---- loaders -------------------------------------------------------------
async function vanilla(id) {
  const f = path.join(R(), 'versions', id, id + '.json');
  try { return JSON.parse(await fsp.readFile(f, 'utf8')); } catch {}
  const v = await get((await man()).versions.find(x => x.id === id).url);
  await fsp.mkdir(path.dirname(f), { recursive: true }); await fsp.writeFile(f, JSON.stringify(v)); return v;
}
async function loaderVer(i) {
  if (i.lv) return i.lv;
  if (META[i.loader]) { const a = await get(`${META[i.loader]}/versions/loader/${i.ver}`); return (a.find(x => x.loader.stable) || a[0]).loader.version; }
  if (i.loader === 'forge') { const p = (await get(PROMO)).promos; return p[i.ver + '-recommended'] || p[i.ver + '-latest']; }
  const vs = (await get(NEO)).versions.filter(v => neoMc(v) === i.ver); return vs.filter(v => !/alpha|beta/.test(v)).at(-1) || vs.at(-1);
}
async function installer(i, lv) { // Forge / NeoForge: run the official installer headlessly
  const forge = i.loader === 'forge', vid = forge ? `${i.ver}-forge-${lv}` : `neoforge-${lv}`, vf = path.join(R(), 'versions', vid, vid + '.json');
  if (!fs.existsSync(vf)) {
    const url = forge ? `https://maven.minecraftforge.net/net/minecraftforge/forge/${i.ver}-${lv}/forge-${i.ver}-${lv}-installer.jar` : `https://maven.neoforged.net/releases/net/neoforged/neoforge/${lv}/neoforge-${lv}-installer.jar`;
    const jar = path.join(R(), 'installers', path.basename(url)); await dl(url, jar);
    const lp = path.join(R(), 'launcher_profiles.json'); if (!fs.existsSync(lp)) fs.writeFileSync(lp, '{"profiles":{}}');
    send('progress', { label: `Installing ${i.loader} ${lv}`, pct: 0.04 });
    await new Promise((ok, no) => { const p = spawn(C.java || 'java', ['-jar', jar, '--installClient', R()], { cwd: R() });
      p.stdout.on('data', d => send('log', d + '')); p.on('error', no); p.on('exit', c => c ? no(new Error('The loader installer failed. Check the log.')) : ok()); });
  }
  return JSON.parse(await fsp.readFile(vf, 'utf8'));
}
const merge = (b, p) => ({ ...b, ...p, assetIndex: b.assetIndex, downloads: b.downloads, javaVersion: p.javaVersion || b.javaVersion, libraries: [...p.libraries, ...b.libraries],
  arguments: b.arguments && { game: [...b.arguments.game, ...(p.arguments?.game || [])], jvm: [...b.arguments.jvm, ...(p.arguments?.jvm || [])] },
  minecraftArguments: p.minecraftArguments || b.minecraftArguments });
async function resolve(i) {
  if (i.ver === 'latest') i = { ...i, ver: (await man()).latest.release };
  const base = await vanilla(i.ver);
  if (i.loader === 'vanilla') return { v: base, i };
  if (i.loader === 'liteloader') throw new Error('LiteLoader installs are not supported yet.');
  const lv = await loaderVer(i); let p;
  if (META[i.loader]) {
    const pf = path.join(R(), 'versions', `${i.loader}-${i.ver}-${lv}.json`);
    try { p = JSON.parse(fs.readFileSync(pf, 'utf8')); } catch { p = await get(`${META[i.loader]}/versions/loader/${i.ver}/${lv}/profile/json`); fs.mkdirSync(path.dirname(pf), { recursive: true }); fs.writeFileSync(pf, JSON.stringify(p)); }
  } else p = await installer(i, lv);
  return { v: merge(base, p), i, lv };
}

// ---- ipc -----------------------------------------------------------------
ipcMain.handle('cfg:get', () => ({ ...C, def: DEF }));
ipcMain.handle('cfg:set', (_, c) => { C = c; fs.mkdirSync(path.dirname(CFG), { recursive: true }); fs.writeFileSync(CFG, JSON.stringify(c, null, 2)); });
ipcMain.on('win', (_, a) => a === 'min' ? win.minimize() : a === 'max' ? (win.isMaximized() ? win.unmaximize() : win.maximize()) : win.close());
ipcMain.handle('versions', () => man());
ipcMain.handle('pick', async () => { const r = await dialog.showOpenDialog(win, { properties: ['openDirectory', 'createDirectory'] }); return r.canceled ? null : r.filePaths[0]; });
ipcMain.handle('open', (_, inst) => { const p = path.join(R(), inst ? 'instances/' + inst : ''); fs.mkdirSync(p, { recursive: true }); shell.openPath(p); });

ipcMain.handle('games', async (_, l) => { // Minecraft versions each loader supports
  try {
    const ids = new Set((await man()).versions.filter(v => v.type === 'release').map(v => v.id));
    if (META[l]) return (await get(`${META[l]}/versions/game`)).map(v => v.version);
    if (l === 'forge') return [...new Set(Object.keys((await get(PROMO)).promos).map(k => k.split('-')[0]))];
    if (l === 'neoforge') return [...new Set((await get(NEO)).versions.map(neoMc))].filter(v => ids.has(v));
    return [];
  } catch (e) { throw new Error(netErr(e)); }
});

ipcMain.handle('login', async (_, { server, user, pass }) => {
  try {
    const u = /^https?:\/\//.test(server) ? server : 'https://' + server;
    const loc = (await fetch(u)).headers.get('x-authlib-injector-api-location');
    const root = (loc ? new URL(loc, u).href : u).replace(/\/$/, '');
    const r = await fetch(root + '/authserver/authenticate', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: user, password: pass, agent: { name: 'Minecraft', version: 1 }, requestUser: true }) });
    const d = await r.json(); if (!r.ok) throw new Error(d.errorMessage || 'Sign in failed');
    return { type: 'authlib', server: root, name: d.selectedProfile.name, uuid: d.selectedProfile.id, token: d.accessToken };
  } catch (e) { throw new Error(netErr(e)); }
});

ipcMain.handle('skin', async (_, { id, model }) => { // Yggdrasil texture upload (authlib-injector API)
  const a = C.accounts.find(x => x.id === id), r = await dialog.showOpenDialog(win, { filters: [{ name: 'Skin', extensions: ['png'] }] });
  if (r.canceled) return;
  const f = new FormData(); f.append('model', model === 'slim' ? 'slim' : ''); f.append('file', new Blob([fs.readFileSync(r.filePaths[0])], { type: 'image/png' }), 'skin.png');
  try { const res = await fetch(`${a.server}/api/user/profile/${a.uuid}/skin`, { method: 'PUT', headers: { Authorization: 'Bearer ' + a.token }, body: f });
    if (!res.ok) throw new Error(`The server rejected the skin (HTTP ${res.status}). Sign in again if your session expired.`); } catch (e) { throw new Error(netErr(e)); }
});

ipcMain.handle('mods:search', async (_, { q, loader, ver, sort, cat }) => {
  try {
    const f = [['project_type:mod'], [`categories:${loader}`], [`versions:${ver}`]]; if (cat) f.push([`categories:${cat}`]);
    const r = await get(`${MR}/search?query=${encodeURIComponent(q)}&limit=30&index=${sort}&facets=${encodeURIComponent(JSON.stringify(f))}`);
    return r.hits.map(h => ({ id: h.project_id, title: h.title, author: h.author, desc: h.description, icon: h.icon_url, dl: h.downloads }));
  } catch (e) { throw new Error(netErr(e)); }
});
async function installMod(id, loader, ver, dir, seen) {
  if (seen.has(id)) return; seen.add(id);
  const j = s => encodeURIComponent(JSON.stringify([s]));
  const vs = await get(`${MR}/project/${id}/version?loaders=${j(loader)}&game_versions=${j(ver)}`);
  if (!vs.length) throw new Error('No compatible file for this version.');
  const f = vs[0].files.find(x => x.primary) || vs[0].files[0];
  await dl(f.url, path.join(dir, f.filename), f.hashes.sha1);
  for (const d of vs[0].dependencies) if (d.dependency_type === 'required' && d.project_id) await installMod(d.project_id, loader, ver, dir, seen);
}
ipcMain.handle('mods:install', async (_, { id, loader, ver, inst }) => {
  try { await installMod(id, loader, ver, path.join(R(), 'instances', inst, 'mods'), new Set()); } catch (e) { throw new Error(netErr(e)); }
});

// ---- launch --------------------------------------------------------------
ipcMain.handle('launch', async (_, inst) => {
  const prog = (label, pct) => send('progress', { label, pct });
  try {
    const acc = C.accounts.find(a => a.id === C.account) || C.accounts[0];
    await fsp.mkdir(R(), { recursive: true });
    prog('Preparing ' + inst.name, 0.02);
    const { v, i, lv } = await resolve(inst), id = i.ver;

    const need = v.javaVersion?.majorVersion || 8, jv = spawnSync(C.java || 'java', ['-version'], { encoding: 'utf8' });
    if (jv.error) throw new Error('Java not found. Set the Java path in Settings.');
    const jm = /version "(\d+)(?:\.(\d+))?/.exec(jv.stderr), have = jm ? (jm[1] === '1' ? +jm[2] : +jm[1]) : 0;
    if (have < need) throw new Error(`${id} needs Java ${need} or newer (found ${have}).`);

    const lib = p => path.join(R(), 'libraries', p), vdir = path.join(R(), 'versions', id), jar = path.join(vdir, id + '.jar');
    const T = new Map(), add = (u, d, h) => u && T.set(d, [u, d, h]), cp = [], nat = [], seen = new Set();
    for (const l of v.libraries) {
      if (!ruleOk(l.rules)) continue;
      const k = l.name.split(':').filter((_, n) => n !== 2).join(':'); if (seen.has(k)) continue; seen.add(k);
      const d = l.downloads || {}, a = d.artifact || (!l.natives && { path: mvn(l.name), url: (l.url || 'https://libraries.minecraft.net/') + mvn(l.name) });
      if (a) { add(a.url, lib(a.path), a.sha1); cp.push(lib(a.path)); if (/:natives-/.test(l.name)) nat.push(a); }
      const cls = l.natives?.[OS]?.replace('${arch}', process.arch === 'x64' ? '64' : '32'), c = cls && d.classifiers?.[cls];
      if (c) { add(c.url, lib(c.path), c.sha1); nat.push(c); }
    }
    cp.push(jar); add(v.downloads.client.url, jar, v.downloads.client.sha1);

    const ai = v.assetIndex, aif = path.join(R(), 'assets', 'indexes', ai.id + '.json');
    await dl(ai.url, aif, ai.sha1);
    for (const h of new Set(Object.values(JSON.parse(await fsp.readFile(aif, 'utf8')).objects).map(o => o.hash)))
      add(`https://resources.download.minecraft.net/${h.slice(0, 2)}/${h}`, path.join(R(), 'assets', 'objects', h.slice(0, 2), h), h);

    const tasks = [...T.values()]; let n = 0;
    await pool(tasks, 24, async t => { await dl(...t); if (++n % 25 === 0 || n === tasks.length) prog(`Downloading ${n} of ${tasks.length} files`, 0.08 + 0.87 * n / tasks.length); });

    const ndir = path.join(vdir, 'natives-' + inst.id); await fsp.rm(ndir, { recursive: true, force: true }); await fsp.mkdir(ndir, { recursive: true });
    for (const a of nat) { const z = new AdmZip(lib(a.path)); for (const e of z.getEntries()) if (/\.(dll|so|dylib|jnilib)$/.test(e.entryName)) z.extractEntryTo(e, ndir, false, true); }

    const gdir = path.join(R(), 'instances', inst.id); await fsp.mkdir(gdir, { recursive: true });
    const vars = { auth_player_name: acc.name, version_name: id, game_directory: gdir, assets_root: path.join(R(), 'assets'), game_assets: path.join(R(), 'assets'),
      assets_index_name: ai.id, auth_uuid: acc.type === 'authlib' ? acc.uuid : offlineUUID(acc.name), auth_access_token: acc.token || '0', auth_session: acc.token || '0',
      user_type: acc.type === 'authlib' ? 'mojang' : 'legacy', version_type: v.type, user_properties: '{}', natives_directory: ndir, launcher_name: 'Grassed',
      launcher_version: '0.1.1', classpath: cp.join(path.delimiter), library_directory: path.join(R(), 'libraries'), classpath_separator: path.delimiter };
    const sub = s => s.replace(/\$\{(\w+)\}/g, (_, k) => vars[k] ?? '0');
    const flat = list => list.flatMap(a => typeof a === 'string' ? [a] : ruleOk(a.rules) ? [].concat(a.value) : []);
    const jvm = v.arguments ? flat(v.arguments.jvm) : ['-Djava.library.path=${natives_directory}', '-cp', '${classpath}'];
    const game = v.arguments ? flat(v.arguments.game) : v.minecraftArguments.split(' ');

    const args = [`-Xmx${C.ram || 2048}M`, '-Xms512M'];
    if (OS === 'osx' && v.libraries.some(l => l.name.startsWith('org.lwjgl:lwjgl:3'))) args.push('-XstartOnFirstThread');
    if (acc.type === 'authlib') args.push(`-javaagent:${await injector()}=${acc.server}`);
    args.push(...jvm.map(sub), v.mainClass, ...game.map(sub));

    prog('Launching', 1);
    const p = spawn(C.java || 'java', args, { cwd: gdir });
    p.stdout.on('data', d => send('log', d.toString())); p.stderr.on('data', d => send('log', d.toString()));
    p.on('error', e => send('exit', e.message)); p.on('exit', c => send('exit', c));
    return { ok: true, lv };
  } catch (e) { return { error: netErr(e) }; }
});

app.whenReady().then(() => {
  win = new BrowserWindow({ width: 1120, height: 700, minWidth: 980, minHeight: 640, frame: false, backgroundColor: '#070d09', icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: { preload: path.join(__dirname, 'preload.js') } });
  win.loadFile('index.html');
  win.on('maximize', () => send('max', true)); win.on('unmaximize', () => send('max', false));
});
app.on('window-all-closed', () => app.quit());
