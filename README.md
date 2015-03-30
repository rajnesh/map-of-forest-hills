This application is an **interactive map of Forest Hills, NY**, with markers at my favorite spots.

Its uses version 3.19 of the [Google Maps API](https://developers.google.com/maps/documentation/javascript/) and [Google Street View API](https://developers.google.com/maps/documentation/streetview/index) along with the very awesome [KnockoutJS](http://knockoutjs.com/) for UI bindings. It also uses jQuery (my eternal gratitude to John Resig for inventing it and the jQuery team for maintaining it so well) and Bootstrap for aesthetics. 

Other than knockoutJS, Bootstrap and jQuery libraries, the application has index.html, js/app.js and css/style.css.

Once the application launches, it shows a split-screen: the left half is a Google Map of Forest Hills with markers and the right half is a placeholder for street views.

You can interact with the map as follows:

1. Click on the places listed on the left side of the map. This will bring up its Street View on the right. The respective marker will become more opaque. The list item will turn blue.
2. Click on a marker. This will bring up its Street View on the right. The respective marker will become more opaque. The list item will turn blue.
3. Search for any of the items listed on the left side of the map using the search box. For example, searching for "pizza" will highlight in green two items in the list and show just their markers.
4. Searching for an empty string will bring all the markers back.


Note that if a marker is on the map, its corresponding list item is in green; if it's also on the Street View side, then it's blue. If the marker is not shown at all, it's list item is white.