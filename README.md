# Front-end Nanodegree Neighborhood Map project

## Getting Started
1. Clone the repo to your local machine. Go to the directory where you want to put the repo and run this:
```bash
$> git clone git@github.com:WisnuMulya/frontend-nanodegree-neighborhood-map.git
```
2. Start a local server while also watching changes in the src directory by running the following in this project root directory:
```bash
$> npm run dev
```
3. Build a production version of this project from the source version by running the following in this project root directory:
```bash
$> npm run build
```

## Description
This project shows some interest spots of my city neighborhood, Jakarta, by marking them on the map and show some informations of the spot, such as the description provided by Wikipedia and images provided by Flickr.

### Features
* Wikipedia description is available on info window of the marker upon clicking the marker or the spot list in the navigation.
* Flickr images is available on info window of the marker upon clicking the marker or the spot list in the navigation.
* Each spot has their own type and is shown on the map as a different marker.
* Spot can be searched in the search box in the navigation.
* Spot can be filtered by types by selecting radio button of filter in the navigation.
* Navigation menu can be toggled by clicking menu icon in the navigation.

## References
* This project uses NPM as a task runner as recommended in [this article](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/).
* NPM Packages:
  * [clean-css](https://www.npmjs.com/package/clean-css)
  * [html-minifier](https://www.npmjs.com/package/html-minifier)
  * [http-server](https://www.npmjs.com/package/http-server)
  * [onchange](https://www.npmjs.com/package/onchange)
  * [opener](https://www.npmjs.com/package/opener)
  * [parallelshell](https://www.npmjs.com/package/parallelshell)
  * [uglify-js](https://www.npmjs.com/package/uglify-js)
* [Global NPM JSDoc](https://www.npmjs.com/package/jsdoc) to create documentation in jsdoc directory
* Icon menu symbol unicode info from [this page](https://css-tricks.com/three-line-menu-navicon/).
* Styling of font border for headings in navigation from [this page](http://stackoverflow.com/questions/2570972/css-font-border).
* Calculate RGBA value from HEX in [this page](http://hex2rgba.devoth.com/).
* Learn JSDoc usage from [this](https://dzone.com/articles/introduction-jsdoc) and [this](http://usejsdoc.org/index.html) pages.
* [Google Maps API](https://developers.google.com/maps/documentation/javascript/)
* Learn binding info window of Google Maps with KnockoutJS from [here](http://techcrawler.riedme.de/2012/09/14/google-maps-infowindow-with-knockout/).
* Learn KnockoutJS from [here](http://knockoutjs.com/documentation/introduction.html).
* Marker's shapes informations from [here](http://kml4earth.appspot.com/icons.html#shapes).
* Info window close event/callback informations from [here](http://stackoverflow.com/questions/6777721/google-maps-api-v3-infowindow-close-event-callback).
* [Google Maps Geocoding](https://developers.google.com/maps/documentation/geocoding/intro)
* Learn integrating Google Maps and KnockoutJS from [here](http://jsfiddle.net/t9wcC/).
* Learn filtering spots from search box from [here](http://jsfiddle.net/mythical/XJEzc/).
* [Flickr Public Feeds API](https://www.flickr.com/services/feeds/docs/photos_public/)
* [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page)
