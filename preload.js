const { contextBridge, ipcRenderer: ipc } = require('electron');
const inv = c => a => ipc.invoke(c, a);
contextBridge.exposeInMainWorld('g', {
  versions: inv('versions'), getCfg: inv('cfg:get'), setCfg: inv('cfg:set'), login: inv('login'), launch: inv('launch'), games: inv('games'),
  search: inv('mods:search'), install: inv('mods:install'), skin: inv('skin'), pick: inv('pick'), open: inv('open'),
  win: a => ipc.send('win', a), on: (ch, f) => ipc.on(ch, (_, d) => f(d)),
});
