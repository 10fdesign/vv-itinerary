function buildMap(listings, mapElement) {
  console.log("listings = ", listings);
  let map = new google.maps.Map(mapElement, {
    zoom: 7,
    center: new google.maps.LatLng(44.0, -72.7),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  let places = listings.map((l) => l.google_place_id).filter((id) => id);

  let directionsSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 573.3 573.3">
  <path d="M286.7,15.1C136.7,15.1,15.1,136.7,15.1,286.7s121.6,271.6,271.6,271.6,271.6-121.6,271.6-271.6S436.6,15.1,286.7,15.1ZM403.6,236.8h0c0,0-72,71.9-72,71.9-9.4,9.4-24.6,9.4-33.9,0-9.3-9.4-9.4-24.6,0-33.9l31-31h-78.1c-13.3,0-24,10.7-24,24v157.7c0,13.3-10.7,24-24,24s-24-10.7-24-24v-157.7c0-39.8,32.2-72,72-72h78.1l-31-31c-9.4-9.4-9.4-24.6,0-33.9,9.4-9.3,24.6-9.4,33.9,0l72,72c9.4,9.4,9.4,24.6,0,33.9Z"/>
</svg>
`;
  let globeSVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 573.3 573.3">
  <path d="M74.2,226.9l32.8,32.8c6.4,6.4,15,10,24,10h22.8c9,0,17.6,3.6,24,10l31.1,31.1c6.4,6.4,10,15,10,24v39.8c0,9,3.6,17.6,10,24l14.1,14.1c6.4,6.4,10,15,10,24v19.8c0,18.8,15.2,33.9,33.9,33.9s33.9-15.2,33.9-33.9v-2.9c0-9,3.6-17.6,10-24l48.1-48.1c6.4-6.4,10-15,10-24v-36.8c0-18.8-15.2-33.9-33.9-33.9h-87.7c-9,0-17.6-3.6-24-10l-17-17c-4.5-4.5-7-10.6-7-17,0-13.3,10.7-24,24-24h36.8c13.3,0,24-10.7,24-24s-2.5-12.5-7-17l-20.9-20.9c-4.1-4-6.3-9.2-6.3-14.6s2.1-10.6,6-14.5l18.4-18.4c6.2-6.2,9.7-14.5,9.7-23.2s-2.5-14.5-6.8-20c-3.4-.1-6.8-.2-10.2-.2-101.2,0-186.4,68.1-212.5,160.9h-.1ZM507.3,286.7c0-36.7-8.9-71.3-24.8-101.6-6.8,1-13.5,4.1-19,9.7l-14.2,14.2c-6.4,6.4-10,15-10,24v36.8c0,18.8,15.2,33.9,33.9,33.9h25.6c2.7,0,5.3-.3,7.7-.8.4-5.3.5-10.7.5-16.1h.2ZM15.1,286.7C15.1,136.6,136.6,15.1,286.7,15.1s271.6,121.6,271.6,271.6-121.6,271.6-271.6,271.6S15.1,436.7,15.1,286.7Z"/>
</svg>
`;

  let listingsByPlaceId = new Map();
  listings
    .filter((l) => l.google_place_id)
    .forEach((l) => listingsByPlaceId.set(l.google_place_id, l));

  let markerMap = new Map();

  let infowindow = new google.maps.InfoWindow({
    // maxWidth: 400
  });

  document.addEventListener('click', function (e) {
    if (e.target && e.target.classList.contains('infowindow-close')) {
      infowindow.close();
    }
  });

  var service = new google.maps.places.PlacesService(map);
  for (const place of places) {
    service.getDetails({
      placeId: place
    }, function (result, status) {
      listingsByPlaceId.set(result.place_id, listingsByPlaceId.get(place));
      const marker = new google.maps.Marker({
        map: map,
        place: {
          placeId: result.place_id,
          location: result.geometry.location
        },
        placeId: place
      });

      google.maps.event.addListener(marker, 'click', (function (marker) {
        return function () {
          console.log(listingsByPlaceId);
          console.log("result.place_id = ", result.place_id)
          const listing = listingsByPlaceId.get(result.place_id);
          console.log("hey!");
          if (!listing) {
            console.log("returning!");
            return;
          }
          let textContent = "";
          let imageContent = "";

          if (listing.hero_image_url) {
            imageContent += `<div class="image-content"><img src="${listing.hero_image_url}"></div>`;
          }
          textContent += `
            <div class="listing-title">
              <h2>${listing.name}</h2>
              <div class="infowindow-close">×</div>
            </div>`;
          textContent += `<div class="address">${result.adr_address}</div>`
          if (listing.description) {
            textContent += `<p>${listing.description}</p>`;
          }
          console.log(listing.url);
          if (listing.url) {
            console.log("listing.url = ", listing.url)
            // textContent += `<a class="url plain-link" href="${listing.url}">${globeSVG} ${linkLabel}</a>`;
            textContent += `<a class="url plain-link" href="${listing.url}">${globeSVG} See More</a>`;
          }
          textContent += `<a href="https://www.google.com/maps/dir/?api=1&destination_place_id=${result.place_id}&destination=d" target="_blank" class="plain-link directions">${directionsSVG} Get Directions</a>`;

          const contentString = `
            <div class="map-infowindow">
              ${imageContent}
              <div class="text-content">
                ${textContent}
              </div>
            </div>
            `;

          infowindow.setContent(contentString);

          infowindow.open(map, marker);
        }
      })(marker));
    });
  }
  mapElement.listingsByPlaceId = listingsByPlaceId;
}
