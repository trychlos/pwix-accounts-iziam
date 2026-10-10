/* Popup orchestration, independent of Meteor for browser lifecycle testing. */

/**
 * Open the logout window before any asynchronous work, then end the local session.
 * Resolves when local logout and popup navigation complete, not when the user
 * confirms provider logout. Closing the popup early does not imply provider logout.
 * @param {Object} options browser window, getOptions and logoutLocal callbacks
 * @returns {Promise<void>} local logout and launch completion
 */
export async function logoutInPopup({ browser, getOptions, logoutLocal }){
    const popup = browser.open( '', '_blank', 'popup=yes,width=620,height=480,resizable=yes,scrollbars=yes' );
    if( !popup ) throw new Error( 'Allow popups to sign out of izIAM, then try again.' );
    try {
        popup.document.title = 'Signing out';
        popup.document.body.textContent = 'Preparing izIAM sign-out…';
        const result = await getOptions();
        if( popup.closed ) throw new Error( 'The sign-out window was closed. Please try again.' );
        let url;
        if( result?.url ){
            url = new URL( result.url );
            if( ![ 'http:', 'https:' ].includes( url.protocol )) throw new Error( 'Invalid izIAM sign-out URL.' );
            // Finish at izIAM's interaction completion page, which closes this popup.
            // A configured post-logout redirect remains applicable to redirect flows.
            url.searchParams.delete( 'post_logout_redirect_uri' );
        }
        await logoutLocal();
        if( !url ){
            popup.close();
            return;
        }
        if( popup.closed ) throw new Error( 'Signed out locally, but the izIAM sign-out window was closed.' );
        popup.location.replace( url.href );
    } catch( error ){
        popup.close();
        throw error;
    }
}
