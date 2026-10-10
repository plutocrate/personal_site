// Load a WebAssembly module from /public/wasm and return its exports.
// Example: const { add } = await loadWasm('/wasm/sim.wasm');
// Build from Rust (wasm-pack / wasm32-unknown-unknown) or C (emcc -O3 -s STANDALONE_WASM) into /public/wasm.
export async function loadWasm(url, imports = {}) {
  const res = await fetch(url);
  if (WebAssembly.instantiateStreaming) {
    try { return (await WebAssembly.instantiateStreaming(res.clone(), imports)).instance.exports; } catch { /* wrong MIME: fall through */ }
  }
  return (await WebAssembly.instantiate(await res.arrayBuffer(), imports)).instance.exports;
}
