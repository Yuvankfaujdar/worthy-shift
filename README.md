# Worth The Shift?

Every price, in hours at your desk.

Enter your in-hand salary once, then type anything you're tempted to buy. The app tells you how many hours you'd have to sit in the office to pay for it, with a little attitude.

## Privacy

- **Your salary never leaves your device.** It's stored only in your browser's local storage. There is no server, no database and no cookies.
- **Anonymous usage counts only** (Mixpanel, US region): visits, onboarding completed, number of checks, and a few button taps. Never salary, hourly rate, prices, hours or item names. Session replay, autocapture and IP storage are off, and Do Not Track is respected. See `assets/analytics.js`.
- No third-party scripts or fonts. Everything, including the Mixpanel library, is served from this site.
- "Forget my salary" in Settings wipes it from the device.
- **Screenshot mode** hides the price and the math. Price + hours is enough to work out someone's salary, so use it before sharing a screenshot.

## How the math works

```
monthly pay   = salary (or yearly ÷ 12)
hours / month = hours per day × days per week × 52 ÷ 12
hourly rate   = monthly pay ÷ hours per month
hours for it  = price ÷ hourly rate
```

Example: ₹1,00,000/month at 9h × 5 days ≈ 195 work hours → ₹513/hour → an iPhone 18 at ₹99,900 ≈ 195 hours.

## Run locally

It's a static site with no build step:

```
npx serve .
```

## Deploy (Cloudflare Pages)

1. Cloudflare dashboard → Workers & Pages → Create → Pages → Connect to Git → pick this repo.
2. Framework preset: **None**. Build command: *(empty)*. Output directory: `/`.
3. `_headers` sets the security headers automatically.
4. After the first deploy, put your real domain into the `og:image` tag in `index.html` so LinkedIn shows the preview card.
5. When you ship changes, bump `VERSION` in `sw.js` so installed copies update.
