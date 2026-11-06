import assert from 'node:assert/strict';import {test} from 'node:test';import {createServer} from 'vite';import {fileURLToPath} from 'node:url';
test('changing standalone server and filters cannot retain an obsolete surl override',async()=>{
 const original=globalThis.window;const url=new URL('http://test/app/swatch?surl=http%3A%2F%2Fold%3A7912');const storage=new Map();
 globalThis.window={location:url,localStorage:{getItem:k=>storage.get(k)??null,setItem:(k,v)=>storage.set(k,v)},history:{replaceState:(_,__,next)=>url.href=new URL(next,url).href}};
 const server=await createServer({configFile:false,server:{middlewareMode:true,hmr:false,ws:false},optimizeDeps:{noDiscovery:true},resolve:{alias:{'@':fileURLToPath(new URL('../src',import.meta.url))}}});
 try {const {useSpoolmanUrl}=await server.ssrLoadModule('/src/composables/useSpoolmanUrl.ts');const {useFilaments}=await server.ssrLoadModule('/src/composables/useFilaments.ts');useSpoolmanUrl().setSpoolmanUrl('http://new:7912');useFilaments().filters.search='PLA';await new Promise(setImmediate);assert.equal(storage.get('spoolman-url'),'http://new:7912');assert.ok(!url.searchParams.has('surl')||url.searchParams.get('surl')==='http://new:7912');}
 finally{await server.close();globalThis.window=original;}
});
