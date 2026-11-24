# Browser entry point

Edit the JavaScript source modules, then run `python3 build-browser.py` and commit
the generated `app.js` along with the source changes. `index.html` loads `app.js`
as a deferred classic script so hash navigation works over HTTPS, localhost,
and when the HTML is opened directly from disk. No package installation is needed.

GNB and browser history navigation render synchronously. The portfolio layout
and interactions were restored to the saved version before the exploration redesign.

The contact form's public Formspree URL belongs in `contact-config.js`. Configure
it with the form endpoint from the owner's verified account before deployment;
do not place account passwords or API keys in the repository. Run the browser
build after changing it. Submission success is shown only after API acceptance.
