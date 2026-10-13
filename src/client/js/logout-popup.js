/* Popup orchestration, independent of Meteor for browser lifecycle testing. */

/**
 * Open the provider's shared logout prompt and wait for its verified outcome.
 * Local logout occurs only after full provider logout; cancellation preserves login.
 * @param {Object} options browser, getOptions, logoutLocal and confirmLogout
 * @returns {Promise<void>} provider and local logout completion, or user cancellation
 */
export async function logoutInPopup({ browser, getOptions, logoutLocal, confirmLogout=false }){
    const popup = browser.open( '', '_blank', 'popup=yes,width=620,height=480,resizable=yes,scrollbars=yes' );
    if( !popup ) throw new Error( 'Allow popups to sign out of izIAM, then try again.' );
    try {
        popup.document.title = 'Signing out';
        popup.document.body.textContent = 'Preparing izIAM sign-out…';
        const result = await getOptions();
        if( popup.closed ) throw new Error( 'The sign-out window was closed. Please try again.' );
        if( !result?.url ) throw new Error( 'No izIAM sign-out URL is available.' );
        const url = new URL( result.url );
        if( ![ 'http:', 'https:' ].includes( url.protocol )) throw new Error( 'Invalid izIAM sign-out URL.' );
        const state = Array.from( browser.crypto.getRandomValues( new Uint8Array( 32 )), byte => byte.toString( 16 ).padStart( 2, '0' )).join( '' );
        url.searchParams.delete( 'post_logout_redirect_uri' );
        url.searchParams.set( 'iziam_confirm_logout', String( confirmLogout ));
        url.searchParams.set( 'iziam_logout_origin', browser.location.origin );
        url.searchParams.set( 'iziam_logout_state', state );
        const status = await new Promise(( resolve, reject ) => {
            let closedAt;
            const cleanup = () => { clearInterval( timer ); browser.removeEventListener( 'message', onMessage ); };
            const onMessage = event => {
                if( event.source !== popup || event.origin !== url.origin || event.data?.type !== 'iziam.logout'
                    || event.data.state !== state || ![ 'complete', 'cancelled' ].includes( event.data.status )) return;
                cleanup();
                resolve( event.data.status );
            };
            const deadline = Date.now() + 600000;
            const timer = setInterval(() => {
                // Allow a queued completion message to arrive after the popup closes.
                if( popup.closed ) closedAt ??= Date.now();
                if( Date.now() > deadline || ( closedAt && Date.now() - closedAt > 500 )){
                    cleanup();
                    reject( new Error( 'izIAM sign-out was not completed. Please try again.' ));
                }
            }, 250 );
            browser.addEventListener( 'message', onMessage );
            try { popup.location.replace( url.href ); }
            catch( error ){ cleanup(); reject( error ); }
        });
        if( status === 'complete' ) await logoutLocal();
        popup.close();
    } catch( error ){
        popup.close();
        throw error;
    }
}
