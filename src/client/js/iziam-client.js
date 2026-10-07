import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';
import { iziamOAuth } from 'meteor/pwix:iziam-oauth';

AccountsIziam.configure = options => iziamOAuth.configure(options);
AccountsIziam.login = (options, callback) => {
    if (typeof options === 'function') { callback = options; options = {}; }
    iziamOAuth.requestCredential(options, Accounts.oauth.credentialRequestCompleteHandler(callback));
};
Accounts.registerClientLoginFunction('iziam', AccountsIziam.login);
Meteor.loginWithIzIAM = (...args) => Accounts.applyLoginFunction('iziam', args);

AccountsIziam.changePassword = (options, callback) => {
    if (typeof options === 'function') { callback = options; options = {}; }
    iziamOAuth.requestCredential(options, Accounts.oauth.credentialRequestCompleteHandler(callback),
        'pwix.accountsIziam.changeOptions');
};

// Fetch the end-session URL while this DDP connection is still authenticated.
AccountsIziam.logout = async () => {
    const result = await Meteor.callAsync('pwix.accountsIziam.logoutOptions');
    await new Promise((resolve, reject) => Meteor.logout(error => error ? reject(error) : resolve()));
    if (result?.url) window.location.assign(result.url);
};
