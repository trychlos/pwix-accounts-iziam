# pwix:accounts-iziam

## ChangeLog

### 1.1.0-rc

    Release date: 

    - Handle cancelled dropdown logins like the login button, without logging an error object.

    - Complete provider logout in an izIAM interaction popup without navigating the client app.
    - Use pwix:logger universal logger, thus bumping minor candidate version number
    - Move asset resources to root directory (todo #1)
    - Add 'mobileHint' to iziamOptions before calling loginWithIziam()
    - Improve callback log when login is cancelled
    - Common registration code is isolated in register.js
    - Switch directly to pwix:iziam-oauth and expose its server grants through AccountsIziam
    - Require Meteor 3.3.1+; remove token polling and restrict published identity fields
    - Add password-change and provider-logout facade methods
    - Remove the undefined AccountsIziam.GrantType alias and its API documentation
    - Remove iziam-specific logout component and translated labels
    - Set a hook on AccountsCore.onCreateUser() to improve user documents, adding pwix:accounts-core dependency

### 1.0.0

Release date: 2024-11-29

- Initial release

---
P. Wieser
- Last updated on 2024, Nov. 29th
