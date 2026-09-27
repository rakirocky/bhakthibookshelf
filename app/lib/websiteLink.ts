/**
 * Link to the website that should open in the phone's browser when tapped
 * inside the app. The app's WebView serves https://bhakthibookshelf.in
 * (capacitor.config.ts); Capacitor keeps links to that exact host inside
 * the app but hands any other host to the system browser — so the www
 * form (same site, nginx serves both) opens outside the app. On the
 * website it is just a normal link.
 */
export const WEBSITE_URL = "https://www.bhakthibookshelf.in";
export const WEBSITE_LABEL = "www.bhakthibookshelf.in";
