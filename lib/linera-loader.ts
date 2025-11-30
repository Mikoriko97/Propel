// Linera WASM Loader - загружає модуль через HTTP замість file://
export async function loadLineraModule() {
    if (typeof window === 'undefined') {
        // SSR - повертаємо mock
        return null;
    }

    try {
        // Завантажуємо з public директорії через HTTP
        const baseUrl = window.location.origin;
        const moduleUrl = `${baseUrl}/linera/linera_web.js`;

        console.log('[Linera Loader] Loading module from:', moduleUrl);

        // Динамічний імпорт через HTTP
        const lineraModule = await import(/* webpackIgnore: true */ moduleUrl);

        // Ініціалізуємо WASM
        if (typeof lineraModule.default === 'function') {
            const wasmUrl = `${baseUrl}/linera/linera_web_bg.wasm`;
            await lineraModule.default({ module_or_path: wasmUrl });
            console.log('[Linera Loader] WASM initialized successfully');
        }

        return lineraModule;
    } catch (error) {
        console.error('[Linera Loader] Failed to load module:', error);
        throw error;
    }
}

// Експорт типів для TypeScript
export type LineraModule = Awaited<ReturnType<typeof loadLineraModule>>;
