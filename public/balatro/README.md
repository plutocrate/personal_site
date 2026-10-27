# Balatro Web Port

A full browser-compatible port of [Balatro](https://www.playbalatro.com/) running on [Love.js](https://github.com/2dengine/love.js) (Emscripten WebAssembly).

All game files from your native copy are extracted and patched for web runtime execution. The game and saves run entirely locally in your browser with no network dependency or external servers.

---

## Quick Start

1. Start the local server:
   ```bash
   ./start.sh
   # Or: python3 server.py
   ```
2. Open your browser:
   - **Launcher & Mod Manager**: [http://localhost:8000/index.html](http://localhost:8000/index.html)
   - **Direct Fullscreen Play**: [http://localhost:8000/play.html](http://localhost:8000/play.html)

---

## Features

- **Ready to Play**: `game.love` is pre-built and pre-patched from your `Balatro.exe`. Opening the launcher auto-installs it into your browser's IndexedDB cache.
- **Direct Play Mode (`play.html`)**: Instant fullscreen play with auto audio unlocking and key shortcut (`F` for fullscreen).
- **Balatro-Themed Launcher (`index.html`)**:
  - CRT background animation and Balatro pixel typography.
  - One-click launch (`Play`).
  - **Restore PC Save**: 1-click button to import your existing desktop save (`pc_save.zip` containing `settings.jkr`, `1/profile.jkr`, `1/meta.jkr`).
  - **Save Management**: Download and upload zip backups of your save files.
  - **Mod Support**: Support for simple mods and Lovely dumps.
  - **Portable Export**: Generate a standalone offline zip package.
- **Local Persistence**: Saves are stored in browser IndexedDB (`/home/web_user/love/game`) and persist across sessions.

---

## Technical Web Patches Applied

The native Balatro Love2D bundle requires several web/browser adaptations applied via `build_love.py`:

1. **Threading & Channels**: Love2D threads (`love.thread`) are replaced with coroutine-based scheduling (`FakeThread`, `FakeChannel`) since web browsers run in a single-threaded WebAssembly event loop. Sound threads (`F_SOUND_THREAD = false`) are handled in the main thread.
2. **Bit Operations**: LuaBitOp / Bit32 polyfill (`bit.lua`) provides pure-Lua fallback for bitwise operations.
3. **Texture Mipmaps**: Disabled mipmap generation on texture loading for WebGL compliance.
4. **Shaders**: Fixed `resources/shaders/hologram.fs` `glow_samples;` statement for WebGL GLSL parser compatibility.
5. **Filesystem & Saves**: Mounted Emscripten IDBFS to `/home/web_user/love` with auto-sync to browser IndexedDB.
6. **OS Check Bypass**: Bypassed native Windows/macOS Steam API calls.

---

## Rebuilding / Updating

If you ever update `Balatro.exe`, simply re-run:
```bash
python3 build_love.py /path/to/Balatro.exe game.love
```
