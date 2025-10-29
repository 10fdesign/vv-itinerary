
const EVENTS_BASE_URL = "https://dev.directory.10fdesign.io/itinerary/events.json?";
const LISTINGS_BASE_URL = "https://dev.directory.10fdesign.io/itinerary/listings.json?";

const UNDO_TEMPLATE = `
<div class="tenf-undo-tile transition-all absolute inset-0 bg-white/80 backdrop-blur-sm p-4 flex justify-center items-center flex-col z-10 text-center gap-4" style="visibility: hidden; opacity: 0;">
  <div class="tenf-undo-text">NAMEHERE has been removed.</div>
  <a class="tenf-undo-button text-sm uppercase font-bold text-blue cursor-pointer">Undo</a>
</div>
`;

const tile_template = `
<img class="bg-red-50 aspect-3/2 w-full block object-cover tile-image" />
<a href="" class="bookmark-toggle block absolute top-4 right-4">
	<svg class="h-8 fill-yellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/></svg>
</a>
<div class="space-y-4 p-4 content">
  <div class="underlined-title">
    <a class="font-bold text-lg w-fit title-link hover:text-blue"><span class="title">Wilburton Inn</span><span class="measurement"></span></a>
    <div class="underline-element border-b-4 border-blue border-solid"></div>
  </div>
	<p class="excerpt text-md leading-8">Lorem ipsum dolor sit amet consectetur adipisicing, elit. Doloribus maiores enim, similique?</p>
</div>
${UNDO_TEMPLATE}
`;

const event_extra_content = `
<p class="italic date_range"></p>
<div class="flex flex-row items-center address_row">
	<svg class="h-6 fill-yellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg>
	<div class="address text-sm italic flex flex-col"></div>
</div>
`;

const listing_extra_content = `
<div class="flex flex-row items-center address_row">
	<svg class="h-6 fill-yellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M128 252.6C128 148.4 214 64 320 64C426 64 512 148.4 512 252.6C512 371.9 391.8 514.9 341.6 569.4C329.8 582.2 310.1 582.2 298.3 569.4C248.1 514.9 127.9 371.9 127.9 252.6zM320 320C355.3 320 384 291.3 384 256C384 220.7 355.3 192 320 192C284.7 192 256 220.7 256 256C256 291.3 284.7 320 320 320z"/></svg>
	<div class="address text-sm italic flex flex-col">2</div>
</div>
`;

const undo_tile_template = `
<div class="flex flex-col gap-4 p-4 content">
	<a class="font-bold text-lg border-b-4 border-b-blue border-b-solid w-fit">Bookmark Deleted</a>
	<p class="excerpt text-md leading-8">You removed the bookmark for <span class="title"></span></p>
	<a href="" class="undo text-center text-lg text-blue">Undo?</a>
</div>
`;

let wordpress_undo_bookmarks = [];
let undo_bookmarks = {
  events: [],
  listings: [],
  wordpress: []
};

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  const hostname = window.location.hostname;
  const match = hostname.match(/[\w]*\.(com|io)/);
  const domain = (match) ? match[0] : hostname;
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  const expires = "expires=" + d.toUTCString();
  let cookie = cname + "=" + cvalue + ";" + expires + ";path=/;";
  if (domain) {
    cookie += ` Domain=${domain}`;
  }
  document.cookie = cookie;
}

const bookmarkEquality = function (b1, b2) {
  return b1.domain == b2.domain && b1.postID == b2.postID && b1.postType == b2.postType;
}

const bookmarkEqualityDirectory = function (b1, b2) {
  return b1.id == b2.id && b1.type == b2.type;
}

/* Wordpress Posts and pages */

function loadWPBookmarksFromCookie() {
  let bookmarks = getCookie("wp_bookmarks");
  if (bookmarks == "") {
    bookmarks = [];
  } else {
    bookmarks = JSON.parse(bookmarks);
  }
  return bookmarks;
}

function createPostTile(postData, postType, domain) {
  let pageTilesContainer = document.getElementById("page-tiles");
  if (!pageTilesContainer) {
    console.log("Couldn't find #page-tiles!");
    return;
  }
  let tile = document.createElement("div");
  tile.bookmark = {
    domain: domain,
    postType: postType,
    postID: "" + postData.id,
  }
  console.log(postData);
  tile.classList.add("flex");
  tile.classList.add("relative");
  tile.classList.add("bg-white");
  tile.classList.add("flex-col");
  tile.innerHTML = tile_template.trim();
  const undoTile = tile.querySelector(".tenf-undo-tile");
  if (postData?.title?.rendered != undefined) {
    tile.querySelector(".title").innerHTML =
      postData.title.rendered;
    undoTile.querySelector(".tenf-undo-text").innerHTML = `<strong>${postData.title.rendered}</strong> has been removed.`;
  }
  if (postData?.excerpt?.rendered != undefined) {
    tile.querySelector(".excerpt").innerHTML =
      postData.excerpt.rendered;
  }
  if (postData?.featured_image_src != undefined) {
    tile
      .querySelector(".tile-image")
      .setAttribute("src", postData.featured_image_src);
  }
  if (postData?.link != undefined) {
    console.log("setting link!");
    tile
      .querySelector(".title-link")
      .setAttribute("href", postData.link);
  }
  pageTilesContainer.appendChild(tile);

  tile.querySelector(".tenf-undo-button").addEventListener("click", function (e) {
    e.preventDefault();
    let bookmarks = loadWPBookmarksFromCookie();
    const index = bookmarks.findIndex(function (b) {
      return bookmarkEquality(b, tile.bookmark);
    });
    if (index == -1) {
      bookmarks.push(tile.bookmark);
      setCookie("wp_bookmarks", JSON.stringify(bookmarks), 365);
    }
    undoTile.style.visibility = "hidden";
    undoTile.style.opacity = "0";
  });
  tile.querySelector(".bookmark-toggle").addEventListener("click", function (e) {
    e.preventDefault();

    let bookmarks = loadWPBookmarksFromCookie();

    const index = bookmarks.findIndex(function (b) {
      return bookmarkEquality(b, tile.bookmark);
    });

    undoTile.style.visibility = "visible";
    undoTile.style.opacity = "1";
    if (index != -1) {
      bookmarks.splice(index, 1);
    }
    setCookie("wp_bookmarks", JSON.stringify(bookmarks), 365);
    return -1;
  });


  const xhttp = new XMLHttpRequest();
  xhttp.onload = function () {
    let imageData;
    try {
      imageData = JSON.parse(this.responseText);
    } catch (e) {
      return console.error(e);
    }
    if (imageData?.image != undefined) {
      tile
        .querySelector(".tile-image")
        .setAttribute("src", imageData.image);
    }
  };
  xhttp.open(
    "GET",
    `${domain}/wp-json/mydata/v1/hero/${postData.id}`,
    true
  );
  xhttp.send();

}

function buildPostTiles(bookmarks) {
  let pageTilesContainer = document.getElementById("page-tiles");
  if (!pageTilesContainer) {
    console.log("Couldn't find #page-tiles!");
    return;
  }
  console.log("building page tiles!");

  if (bookmarks.length == 0) {
    let _not_found = document.createElement("p");
    _not_found.innerHTML = "You haven't saved any pages yet."
    pageTilesContainer.appendChild(_not_found);
    return;
  }

  // group bookmarks by domain
  let byDomain = new Map();
  for (const bookmark of bookmarks) {
    if (!byDomain.has(bookmark.domain)) {
      byDomain.set(bookmark.domain, []);
    }
    let bookmarksForDomain = byDomain.get(bookmark.domain);
    bookmarksForDomain.push(bookmark);
  }

  for (const domainArray of byDomain) {
    let byPostType = new Map();
    const domain = domainArray[0];
    const domainBookmarks = domainArray[1];
    // subgroup by postType
    for (const domainBookmark of domainBookmarks) {
      if (!byPostType.has(domainBookmark.postType)) {
        byPostType.set(domainBookmark.postType, []);
      }
      let bookmarksForPostType = byPostType.get(
        domainBookmark.postType
      );
      bookmarksForPostType.push(domainBookmark);
    }

    for (const postTypeArray of byPostType) {
      const postType = postTypeArray[0];
      const postTypeBookmarks = postTypeArray[1];
      const xhttp = new XMLHttpRequest();
      xhttp.onload = function () {
        let postsData;
        try {
          postsData = JSON.parse(this.responseText);
        } catch (e) {
          return console.error(e);
        }

        for (const postData of postsData) {
          createPostTile(postData, postType, domain);
        }
        resizeUnderlines();
      };
      const includes = postTypeBookmarks
        .map((b) => `include[]=${b.postID}`)
        .join("&");
      xhttp.open(
        "GET",
        `${domain}/wp-json/wp/v2/${postType}/?${includes}`,
        true
      );
      xhttp.send();
    }
  }
}

/* Events and Listings */

function loadDirectoryBookmarksFromCookie() {
  let stayandplayBookmarks = getCookie("stayandplay_bookmarks");
  if (stayandplayBookmarks == "") {
    stayandplayBookmarks = [];
  } else {
    stayandplayBookmarks = JSON.parse(stayandplayBookmarks);
  }
  let directoryBookmarks = { events: [], listings: [] };
  for (let row of stayandplayBookmarks) {
    if (row.type == "event") {
      directoryBookmarks.events.push({ id: row.id });
    } else if (row.type == "listing") {
      directoryBookmarks.listings.push({ id: row.id });
    }
  }
  return directoryBookmarks;
}

/* Events */

function createEventTile(eventData) {
  const eventTilesContainer = document.getElementById("event-tiles");
  if (!eventTilesContainer) {
    console.log("Couldn't find #event-tiles");
    return;
  }
  let tile = document.createElement("div");
  tile.bookmark = {
    id: eventData.id
  }
  tile.classList.add("flex");
  tile.classList.add("flex-col");
  tile.classList.add("bg-white");
  tile.classList.add("relative");
  tile.innerHTML = tile_template.trim();
  const undoTile = tile.querySelector(".tenf-undo-tile");
  tile.querySelector(".title").innerHTML = eventData.name;
  undoTile.querySelector(".tenf-undo-text").innerHTML = `<strong>${eventData.name}</strong> has been removed.`;
  tile.querySelector(".title-link").setAttribute("href", eventData.url);
  tile.querySelector(".excerpt").innerHTML = eventData.excerpt;
  tile.querySelector(".tile-image").setAttribute("src", eventData.hero_image_url);
  tile.querySelector(".content").innerHTML += event_extra_content
  if (eventData.date_range) {
    tile.querySelector(".date_range").innerHTML = eventData.date_range;
  } else {
    tile.querySelector(".date_range").style.display = "none";
  }

  if (eventData.address) {
    tile.querySelector(".address").innerHTML = eventData.address;
  } else {
    tile.querySelector(".address_row").style.display = "none";
  }

  tile.querySelector(".tenf-undo-button").addEventListener("click", function (e) {
    e.preventDefault();
    let directoryBookmarks = loadDirectoryBookmarksFromCookie();
    const index = directoryBookmarks.events.findIndex((b) => bookmarkEqualityDirectory(b, { id: tile.bookmark.id }));
    if (index == -1) {
      directoryBookmarks.events.push({id: tile.bookmark.id});
    }
    saveStayAndPlayBookmarks(directoryBookmarks);
    undoTile.style.visibility = "hidden";
    undoTile.style.opacity = "0";
  });
  tile.querySelector(".bookmark-toggle").addEventListener("click", function (e) {
    e.preventDefault();
    let directoryBookmarks = loadDirectoryBookmarksFromCookie();
    const index = directoryBookmarks.events.findIndex((b) => bookmarkEqualityDirectory(b, { id: tile.bookmark.id }));
    if (index != -1) {
      directoryBookmarks.events.splice(index, 1);
    }
    undoTile.style.visibility = "visible";
    undoTile.style.opacity = "1";
    saveStayAndPlayBookmarks(directoryBookmarks);
    return -1;
  });

  eventTilesContainer.appendChild(tile);
}

function buildEventTiles(eventBookmarks) {
  let eventTilesContainer = document.getElementById("event-tiles");
  const eventsRequest = new XMLHttpRequest();
  eventsRequest.onload = function () {
    let eventsData = JSON.parse(this.responseText);
    const mapElement = document.getElementById("events-map");
    buildMap(eventsData.events, mapElement);

    if (eventsData.events.length == 0) {
      let _not_found = document.createElement("p");
      _not_found.innerHTML = "You haven't saved any events yet."
      eventTilesContainer.appendChild(_not_found);
      mapElement.hidden = true;
    } else {
      for (const eventData of eventsData.events) {
        createEventTile(eventData);
      }
    }
    resizeUnderlines();
  };
  let events_url = EVENTS_BASE_URL;
  for (let event_row of eventBookmarks) {
    events_url = events_url + "ids[]=" + event_row.id + "&";
  }
  eventsRequest.open("GET", events_url);
  eventsRequest.send();

}

/* Listings */

function createListingTile(listingData) {
  let listingTilesContainer = document.getElementById("listing-tiles");
  if (!listingTilesContainer) {
    console.log("Couldn't find $listing-tiles!");
    return;
  }
  let id = parseInt(listingData.url.split("/")[4]);
  let tile = document.createElement("div");
  console.log(listingData);
  tile.bookmark = {
    id: listingData.id
  }
  tile.classList.add("flex");
  tile.classList.add("flex-col");
  tile.classList.add("relative");
  tile.classList.add("bg-white");
  tile.innerHTML = tile_template.trim();
  const undoTile = tile.querySelector(".tenf-undo-tile");
  tile.querySelector(".title").innerHTML = listingData.name;
  undoTile.querySelector(".tenf-undo-text").innerHTML = `<strong>${listingData.name}</strong> has been removed.`;
  tile.querySelector(".title-link").setAttribute("href", listingData.url);
  tile.querySelector(".excerpt").innerHTML = listingData.excerpt;
  tile.querySelector(".tile-image").setAttribute("src", listingData.hero_image_url);
  tile.querySelector(".content").innerHTML += listing_extra_content
  if (listingData.address) {
    tile.querySelector(".address").innerHTML = listingData.address;
  } else {
    tile.querySelector(".address_row").style.display = "none";
  }
  tile.querySelector(".tenf-undo-button").addEventListener("click", function (e) {
    e.preventDefault();
    let directoryBookmarks = loadDirectoryBookmarksFromCookie();
    const index = directoryBookmarks.listings.findIndex((b) => bookmarkEqualityDirectory(b, { id: tile.bookmark.id }));
    if (index == -1) {
      directoryBookmarks.listings.push({id: tile.bookmark.id});
    }
    saveStayAndPlayBookmarks(directoryBookmarks);
    undoTile.style.visibility = "hidden";
    undoTile.style.opacity = "0";
  });
  tile.querySelector(".bookmark-toggle").addEventListener("click", function (e) {
    e.preventDefault();
    let directoryBookmarks = loadDirectoryBookmarksFromCookie();
    const index = directoryBookmarks.listings.findIndex((b) => bookmarkEqualityDirectory(b, { id: tile.bookmark.id }));
    if (index != -1) {
      directoryBookmarks.listings.splice(index, 1);
    }
    undoTile.style.visibility = "visible";
    undoTile.style.opacity = "1";
    saveStayAndPlayBookmarks(directoryBookmarks);
    return -1;
  });
  listingTilesContainer.appendChild(tile);
}

function buildListingTiles(listingBookmarks) {
  let listingTilesContainer = document.getElementById("listing-tiles");
  const listingsRequest = new XMLHttpRequest();
  listingsRequest.onload = function () {
    let listingsData = JSON.parse(this.responseText);
    const mapElement = document.getElementById("listings-map");
    buildMap(listingsData.listings, mapElement);

    if (listingsData.listings.length == 0) {
      let _not_found = document.createElement("p");
      _not_found.innerHTML = "You haven't saved any listings yet."
      listingTilesContainer.appendChild(_not_found);
      mapElement.hidden = true;
    } else {
      for (const listingData of listingsData.listings) {
        createListingTile(listingData);
      }
    }
    resizeUnderlines();
  };
  let listingsURL = LISTINGS_BASE_URL;
  for (let listingRow of listingBookmarks) {
    listingsURL = listingsURL + "ids[]=" + listingRow.id + "&";
  }
  listingsRequest.open("GET", listingsURL);
  listingsRequest.send();
}

function saveStayAndPlayBookmarks(directoryBookmarks) {
  let stayandplayBookmarks = [];
  for (let listing_row of directoryBookmarks.listings) {
    stayandplayBookmarks.push({ type: "listing", domain: listing_row.domain, id: listing_row.id });
  }
  for (let event_row of directoryBookmarks.events) {
    stayandplayBookmarks.push({ type: "event", domain: event_row.domain, id: event_row.id });
  }
  setCookie("stayandplay_bookmarks", JSON.stringify(stayandplayBookmarks), 365);
  return stayandplayBookmarks;
}

/* resize */
function resizeUnderlines() {
  const results = document.querySelectorAll(".underlined-title");
  results.forEach((el) => {
    console.log(el);
    const measurementElement = el.querySelector('.measurement');
    console.log(measurementElement.offsetLeft);
    let underlineElement = el.querySelector('.underline-element');
    underlineElement.style.width = "calc(" + measurementElement.offsetLeft + "px - 1rem)";
  });
}

window.addEventListener("DOMContentLoaded", function () {

  let wpBookmarks = loadWPBookmarksFromCookie();
  let directoryBookmarks = loadDirectoryBookmarksFromCookie();

  const urlParams = new URLSearchParams(window.location.search);
  let usingUrlParams = false;
  let URLWPBookmarks = [];
  if ((UrlWPBookmarks = urlParams.get("wp_bookmarks")) != null && UrlWPBookmarks != "") {
    UrlWPBookmarks = JSON.parse(UrlWPBookmarks);
    usingUrlParams = true;
  }
  let UrlDirectoryBookmarks = {};
  if ((UrlDirectoryBookmarks = urlParams.get("stayandplay_bookmarks")) != null && UrlDirectoryBookmarks != "") {
    UrlDirectoryBookmarks = JSON.parse(UrlDirectoryBookmarks);
    let bookmarks = { events: [], listings: [] };
    for (let row of UrlDirectoryBookmarks) {
      if (row.type == "event") {
        bookmarks.events.push({ id: row.id });
      } else if (row.type == "listing") {
        bookmarks.listings.push({ id: row.id });
      }
    }
    UrlDirectoryBookmarks = bookmarks;
    usingUrlParams = true;
  }

  if (usingUrlParams) {
    wpBookmarks = UrlWPBookmarks;
    directoryBookmarks = UrlDirectoryBookmarks;
    document.body.classList.add("tenf-preview");
  }

  buildPostTiles(wpBookmarks);
  buildEventTiles(directoryBookmarks.events);
  buildListingTiles(directoryBookmarks.listings);

  document.getElementById("clear_itinerary").addEventListener("click", function (e) {
    e.preventDefault();

    if (window.confirm("This will clear your entire itinerary.  Are you sure you wish to proceed?")) {
      setCookie("stayandplay_bookmarks", "", 365);
      setCookie("wp_bookmarks", "", 365);

      window.location.href = window.location.origin;
    }
  });

  resizeUnderlines();
  window.addEventListener("resize", resizeUnderlines);

});
