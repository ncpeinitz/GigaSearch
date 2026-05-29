# GigaSearch

Aurora Search is a styled search-engine web app built with HTML, CSS, JavaScript, jQuery, and jQuery UI. It performs live searches through a search API and presents results in a familiar search-engine layout with knowledge graph results, organic links, people-also-ask content, and related searches.

## Features

- Search input with a custom search-engine interface
- Search results area for:
  - Knowledge graph
  - Organic results
  - People also ask
  - Related searches
- Dynamic background image cycling by clicking the site title
- Current time button that opens a jQuery UI dialog
- Hidden results/time panels that appear after interaction
- Azure-published deployment
- Bonus support for an "I'm Feeling Lucky" redirect

## Tech Stack

- HTML5
- CSS3
- JavaScript
- jQuery
- jQuery UI
- CDN-hosted libraries with SRI hashes

## Project Structure

- `index.html` – page structure
- `styles.css` – all styling
- `script.js` – all interactivity and API logic

## How It Works

1. Enter a query in the search box.
2. Click **Search** to call the search API.
3. View structured search output in the results panel.
4. Click the site title to rotate the background image.
5. Click the time button to open a jQuery UI dialog showing the current time.

## Highlights

- All HTML, CSS, and JavaScript are separated into their own files
- Uses jQuery, jQuery UI, and a matching jQuery UI theme from CDNs
- Uses SRI hashes for external resources
- Includes custom styling and responsive layout work
- Designed to run without console errors or broken assets

## Deployment

This site was published to Microsoft Azure as part of the project requirements.
