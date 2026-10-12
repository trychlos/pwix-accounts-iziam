import assert from 'node:assert/strict';
import { test } from 'node:test';
import { logoutInPopup } from '../../src/client/js/logout-popup.js';

function fixture() {
    const events = [];
    const popup = {closed:false, document:{body:{}},
        close(){ this.closed=true; events.push('close'); },
        location:{replace(url){events.push(['navigate',url]);}}};
    const browser = {open(){events.push('open');return popup;}, get location(){throw new Error('Main window must not navigate');}};
    return {events,popup,browser};
}

test('opens synchronously before options lookup, logs out locally and navigates only the popup', async () => {
    const f = fixture();
    let release;
    const wait = new Promise(resolve => {release=resolve;});
    const task = logoutInPopup({browser:f.browser,
        getOptions:async()=>{f.events.push('options');await wait;return {url:'https://id.example/logout?id_token_hint=test&post_logout_redirect_uri=https%3A%2F%2Fapp.example%2F'};},
        logoutLocal:async()=>{f.events.push('logout');}});
    assert.deepEqual(f.events,['open','options']);
    release(); await task;
    assert.equal(f.events[2],'logout');
    const url = new URL(f.events[3][1]);
    assert.equal(url.origin,'https://id.example');
    assert.equal(url.searchParams.get('id_token_hint'),'test');
    assert.equal(url.searchParams.has('post_logout_redirect_uri'),false);
});

test('blocked popup does not call either server lookup or local logout', async () => {
    await assert.rejects(logoutInPopup({browser:{open:()=>null},
        getOptions:()=>assert.fail('lookup'),logoutLocal:()=>assert.fail('logout')}), /Allow popups/);
});

test('lookup failure closes the blank popup and preserves local login', async () => {
    const f=fixture();
    await assert.rejects(logoutInPopup({browser:f.browser,
        getOptions:async()=>{throw new Error('lookup failed');},logoutLocal:()=>assert.fail('logout')}), /lookup failed/);
    assert.equal(f.popup.closed,true);
});

test('premature close and invalid URLs are rejected before local logout', async () => {
    for (const variant of ['closed','invalid']) {
        const f=fixture();
        await assert.rejects(logoutInPopup({browser:f.browser,
            getOptions:async()=>{f.popup.closed=variant==='closed';return {url:'javascript:alert(1)'};},
            logoutLocal:()=>assert.fail('logout')}), /closed|Invalid/);
    }
});

test('missing provider logout URL performs local logout and closes the popup', async () => {
    const f=fixture();
    await logoutInPopup({browser:f.browser,getOptions:async()=>null,logoutLocal:async()=>f.events.push('logout')});
    assert.deepEqual(f.events,['open','logout','close']);
});

test('local logout failure closes the popup without sending it to the provider', async () => {
    const f=fixture();
    await assert.rejects(logoutInPopup({browser:f.browser,getOptions:async()=>({url:'https://id.example/logout'}),
        logoutLocal:async()=>{throw new Error('local failure');}}), /local failure/);
    assert.deepEqual(f.events,['open','close']);
});


test('declining configured confirmation preserves both sessions and opens no popup', async () => {
    const f = fixture();
    f.browser.confirm = message => { assert.equal(message, 'Confirm logout?'); return false; };
    await logoutInPopup({browser:f.browser, confirmLogout:true, confirmationMessage:'Confirm logout?',
        getOptions:()=>assert.fail('lookup'), logoutLocal:()=>assert.fail('logout')});
    assert.deepEqual(f.events, []);
});

test('accepting configured confirmation starts logout synchronously', async () => {
    const f = fixture();
    f.browser.confirm = () => { f.events.push('confirm'); return true; };
    const task = logoutInPopup({browser:f.browser, confirmLogout:true, confirmationMessage:'Confirm logout?',
        getOptions:async()=>({url:'https://id.example/logout?id_token_hint=test'}),
        logoutLocal:async()=>f.events.push('logout')});
    assert.deepEqual(f.events, ['confirm','open']);
    await task;
    assert.equal(f.events[2], 'logout');
    assert.equal(f.events[3][0], 'navigate');
});

test('disabled confirmation never asks the user', async () => {
    const f = fixture();
    f.browser.confirm = () => assert.fail('confirmation');
    await logoutInPopup({browser:f.browser, confirmLogout:false,
        getOptions:async()=>({url:'https://id.example/logout?id_token_hint=test'}),
        logoutLocal:async()=>f.events.push('logout')});
    assert.equal(f.events[0], 'open');
});
