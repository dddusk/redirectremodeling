# 6point0

This is using Victor Hugo as the static site generator with Gulp, Weback, PostCSS and many more.

## Usage

Be sure that you have the latest node, npm and [Hugo](https://gohugo.io/) installed. If you need to install hugo, run:

```bash
brew install hugo
```

Next, clone this repository and run:

```bash
npm install
npm start
```

Then visit http://localhost:3000/ - BrowserSync will automatically reload CSS or
refresh the page when stylesheets or content changes.

To build your static output to the `/dist` folder, use:

```bash
npm run build
```

## Indexing the Site

To index the site locally simply run:

```bash
npm run index
```

_It auto-indexes on build in production._

## Deploying to netlify

Push your clone to your own GitHub repo, then start a new netlify project, pick
your repository and configure it like this:

* **Build Command:** npm run build
* **Directory:** dist

Now netlify will build and deploy your site whenever you push to git.
