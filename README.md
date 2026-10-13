# pwix:accounts-iziam

## What is it ?

`pwix:accounts-iziam` is the application-facing izIAM integration for Meteor. Applications use this
package for login, password change, and server-side OAuth or OpenID grants. It
relies exclusively on `pwix:iziam-oauth` for OAuth 2 and OpenID Connect 1.0.

On client side, this package defines `Meteor.loginWithIziam()` function.

The former`pwix:iziam-oidc` implementation is retired; there is no compatibility wrapper.

## Installation and settings

Requires Meteor 3.3.1 or later (tested on 3.5.2) and Node 22.12 or later.

```sh
    meteor add pwix:accounts-iziam
    meteor npm install lodash
```

The pwix settings, logging, i18n and UI packages retain their own npm peers.
Configure `private.iziam` in the selected environment, or provide
`Meteor.settings.private.iziam` directly. A minimal configuration is:

```json
{
    "private": {
        "iziam": {
            "issuerUrl": "https://identity.example/tenant",
            "client_id": "application-client",
            "client_secret": "configure-outside-source-control",
            "scopes": [ "openid", "profile", "email" ]
        }
    }
}
```

`redirect_uri` is automatically computed as `Meteor.absoluteUrl('_oauth/iziam')`.
Do not omit to set `ROOT_URL` correctly and register the URL with izIAM. Client secrets remain server-side.
The complete settings and server-grant contract are documented in
[pwix:iziam-oauth](https://github.com/trychlos/pwix-iziam-oauth#readme).

## Browser API

- `Meteor.loginWithIzIAM( options?, callback? )` / `AccountsIziam.login(...)`:
  start OIDC login. Options: `loginStyle` (`popup` or `redirect`), `popupOptions`
  (object), `scopes` (array), and `mobileHint` (forces redirect).

- `AccountsIziam.changePassword(o ptions?, callback? )`: start izIAM's password
  interaction for the logged-in identity. A different returned subject is
  rejected. The callback reports completion or failure; tokens are not polled.

- `await AccountsIziam.logout()`: call directly from a user action to open the izIAM
  logout popup. `confirmLogout: true` shows the shared server-rendered confirmation
  prompt. The default `false` skips the question when the ID-token hint identifies
  the current provider session. Cancellation preserves both sessions.
  The promise waits for verified provider completion before ending the local Meteor
  session. Closing the popup early, blocked popups, missing logout URLs and lookup
  failures reject without performing local logout. The application window stays put.
  Plain `Meteor.logout()` performs local logout only.

Options cannot override the issuer, callback endpoint or client credentials.
OIDC login adds the `openid` scope and validates the ID token and UserInfo subject.
Users keep the `services.iziam` identity; only public identity fields are selected
for autopublication. Access tokens, refresh tokens and ID tokens stay private.

## Server API

```js
    import { AccountsIziam } from 'meteor/pwix:accounts-iziam';

    const machine = await AccountsIziam.authorizationFlow( 'client_credentials', {
        scopes: ['api:read']
    });
    const renewed = await AccountsIziam.authorizationFlow( 'refresh_token', {
        credentials: storedCredentials
    });
```

These functions are server-only and are not anonymous Meteor methods. The
application stores the resulting credentials and serializes refreshes for each
grant so rotated refresh tokens cannot overwrite each other.

For OAuth-only authorization code, set private `oauth_redirect_uri` to your own
server callback (distinct from `/_oauth/iziam`):

```js
    const launch = await AccountsIziam.authorizationFlow('authorization_code', {
        scopes: ['api:read']
    });
    // Save launch.credentialToken in the initiating application session and direct
    // that session's browser to launch.url.

    // In the application's server callback, recover the expected value from that
    // same session, never from the callback query itself:
    const credentials = await AccountsIziam.completeAuthorization(query, savedCredentialToken);
```

OAuth-only authorization returns tokens and does not establish a Meteor login.
Grant results use `accessToken`, `tokenType`, optional `refreshToken`, `idToken`,
`scope`, and `expiresAt` (milliseconds since epoch). If a refresh omits a refresh
token or scope, the previous value is preserved.

## Blaze components

`iziamLoginButton` and `iziamChangeButton` both accept `btnClasses`
and `btnLabel`. Login accepts `withLabel`, `withLogo`, and `iziamOptions` (the
login options above). Password change accepts `onComplete(error)` for application
notifications.

## Validation

The consolidated package includes Node protocol tests, Meteor client/server
tests, and a Chromium walkthrough covering login and password change.
See its maintainer documentation. Nothing is published automatically.

## Configuration

The package's behavior can be configured through a call to the `AccountsIziam.configure()` method, with just a single javascript object argument, which itself should only contains the options you want override.

Known configuration options are:

- `changeLabel`
- `changeLogo`
- `changeTitle`

    Repectively label, logo path and title of the `Change password` popup dialog.

    They default to respectively:

    - (translated) 'Change izIAM password'
    - /path/to/iziam/logo
    - (translated) 'Change your password in izIAM Identity Manager'.

- `confirmLogout`

    Whether `AccountsIziam.logout()` asks for confirmation before terminating the session.

    Defaults to `false`.

- `loginLabel`
- `loginLogo`
- `loginTitle`

    Repectively label, logo path and title of the `Login` popup dialog.

    They default to respectively:

    - (translated) 'Login with izIAM'
    - /path/to/iziam/logo
    - (translated) 'Login with izIAM Identity Manager'.

- `verbosity`

    Defines the expected verbosity level.

    The accepted value can be any or-ed combination of following:

    - `AccountsIziam.C.Verbose.NONE`

        Do not display any trace log to the console

    - `AccountsIziam.C.Verbose.CONFIGURE`

        Display the configuration options and result.

    Defaults to `AccountsIziam.C.Verbose.CONFIGURE`.

Please note that `AccountsIziam.configure()` method should be called in the same terms both in client and server sides.

Remind too that Meteor packages are instanciated at application level. They are so only configurable once, or, in other words, only one instance has to be or can be configured. Addtionnal calls to `AccountsIziam.configure()` will just override the previous one. You have been warned: **only the application should configure a package**.

## NPM peer dependencies

Starting with v 1.0.0, and in accordance with advices from [the Meteor Guide](https://guide.meteor.com/writing-atmosphere-packages.html#peer-npm-dependencies), we no more hardcode NPM dependencies in the `Npm.depends` clause of the `package.js`.

Instead we check npm versions of installed packages at runtime, on server startup, in development environment.

Dependencies as of v 1.1.0:

```js
    'lodash': '^4.17.0'
```

Each of these dependencies should be installed at application level:

```sh
    meteor npm install <package> --save
```

## Translations

New and updated translations are willingly accepted, and more than welcome. Just be kind enough to submit a PR on the [Github repository](https://github.com/trychlos/pwix-accounts-iziam/pulls).

## Cookies and comparable technologies

None at the moment.

---
P. Wieser
- Last updated on 2026, May. 2nd
