# Browser entry point

Edit the JavaScript source modules, then run `python3 build-browser.py` and commit
the generated `app.js` along with the source changes. `index.html` loads `app.js`
as a deferred classic script so hash navigation works over HTTPS, localhost,
and when the HTML is opened directly from disk. No package installation is needed.

GNB and browser history navigation render synchronously. Card filtering uses
the optional View Transition API with a Web Animations fallback.
