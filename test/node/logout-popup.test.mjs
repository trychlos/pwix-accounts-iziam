import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { test } from 'node:test';
import { logoutInPopup } from '../../src/client/js/logout-popup.js';

function fixture(){
    const events = [];
    let listener;
    let navigated;
    const navigation = new Promise(resolve => { navigated = resolve; });
    const popup = { closed: false, document: { body: {} },
        close(){ this.closed = true; },
        location: { replace(url){ events.push('navigate'); navigated(new URL(url)); } } };
    const browser = { crypto: webcrypto, location: { origin: 'https://app.example' },
        open(){ events.push('open'); return popup; },
        addEventListener(type, fn){ listener = fn; }, removeEventListener(){ listener = null; },
        confirm(){ assert.fail('Native confirmation must not be used'); } };
    const send = (url, status, overrides={}) => listener?.({ source: popup, origin: url.origin,
        data: { type: 'iziam.logout', state: url.searchParams.get('iziam_logout_state'), status }, ...overrides });
    const options = { browser, getOptions: async () => ({ url: 'https://id.example/logout?id_token_hint=test&post_logout_redirect_uri=https%3A%2F%2Fapp.example' }),
        logoutLocal: async () => { events.push('logout'); } };
    return { events, popup, browser, navigation, send, options, hasListener: () => Boolean(listener) };
}

for( const confirmLogout of [true, false] ){
    test(`confirmation=${confirmLogout} uses the provider and waits before local logout`, async () => {
        const f = fixture();
        const task = logoutInPopup({ ...f.options, confirmLogout });
        assert.deepEqual(f.events, ['open']);
        const url = await f.navigation;
        assert.equal(url.searchParams.get('iziam_confirm_logout'), String(confirmLogout));
        assert.equal(url.searchParams.get('iziam_logout_origin'), 'https://app.example');
        assert.equal(url.searchParams.get('id_token_hint'), 'test');
        assert.equal(url.searchParams.has('post_logout_redirect_uri'), false);
        assert.deepEqual(f.events, ['open', 'navigate']);
        for( const overrides of [{ source: {} }, { origin: 'https://evil.example' },
            { data: { type: 'iziam.logout', state: 'wrong', status: 'complete' } }] ) f.send(url, 'complete', overrides);
        await Promise.resolve();
        assert.equal(f.events.includes('logout'), false);
        f.send(url, 'complete');
        await task;
        assert.deepEqual(f.events, ['open', 'navigate', 'logout']);
        assert.equal(f.hasListener(), false);
    });
}
test('cancelling the provider prompt preserves local login', async () => {
    const f = fixture(); const task = logoutInPopup(f.options);
    f.send(await f.navigation, 'cancelled'); await task;
    assert.equal(f.events.includes('logout'), false);
    assert.equal(f.hasListener(), false);
});
test('blocked popup preserves login without requesting options', async () => {
    await assert.rejects(logoutInPopup({ browser: { open: () => null },
        getOptions: () => assert.fail(), logoutLocal: () => assert.fail() }), /Allow popups/);
});
test('lookup failures, missing URLs and unsafe URLs preserve local login', async () => {
    for( const getOptions of [async () => { throw Error('lookup failed'); }, async () => null,
        async () => ({ url: 'javascript:alert(1)' })] ){
        const f = fixture();
        await assert.rejects(logoutInPopup({ ...f.options, getOptions }));
        assert.equal(f.events.includes('logout'), false);
        assert.equal(f.popup.closed, true);
    }
});
test('closing an unfinished popup preserves login and removes the listener', async () => {
    const f = fixture(); const task = logoutInPopup(f.options);
    await f.navigation; f.popup.close();
    await assert.rejects(task, /not completed/);
    assert.equal(f.events.includes('logout'), false);
    assert.equal(f.hasListener(), false);
});
test('local logout errors remain visible after provider completion', async () => {
    const f = fixture(); const task = logoutInPopup({ ...f.options, logoutLocal: async () => { throw Error('local failure'); } });
    f.send(await f.navigation, 'complete');
    await assert.rejects(task, /local failure/);
    assert.equal(f.hasListener(), false);
});
