const tile_template = `
<img class="bg-red-50 aspect-3/2 w-full block object-cover tile-image" />
<a href="" class="bookmark-toggle block absolute top-4 right-4">
	<svg class="h-8 fill-yellow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><!--!Font Awesome Free v7.0.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M305 151.1L320 171.8L335 151.1C360 116.5 400.2 96 442.9 96C516.4 96 576 155.6 576 229.1L576 231.7C576 343.9 436.1 474.2 363.1 529.9C350.7 539.3 335.5 544 320 544C304.5 544 289.2 539.4 276.9 529.9C203.9 474.2 64 343.9 64 231.7L64 229.1C64 155.6 123.6 96 197.1 96C239.8 96 280 116.5 305 151.1z"/></svg>
</a>
<div class="flex flex-col gap-4 p-4 content">
	<a class="title font-bold text-lg border-b-4 border-b-blue border-b-solid w-fit">Wilburton Inn</a>
	<p class="excerpt text-md leading-8">Lorem ipsum dolor sit amet consectetur adipisicing, elit. Doloribus maiores enim, similique?</p>
</div>`;
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
  d.setTime(d.getTime() + (exdays*24*60*60*1000));
  const expires = "expires="+ d.toUTCString();
  let cookie = cname + "=" + cvalue + ";" + expires + ";path=/;";
  if (domain) {
    cookie += ` Domain=${domain}`;
  }
  document.cookie = cookie;
}

window.addEventListener("DOMContentLoaded", function () {

  const EVENTS_BASE_URL = "https://dev.directory.10fdesign.io/itinerary/events.json?"
  const LISTINGS_BASE_URL = "https://dev.directory.10fdesign.io/itinerary/listings.json?"

  let page_tiles_container = document.getElementById("page-tiles");
  let event_tiles_container = document.getElementById("event-tiles");
  let listing_tiles_container = document.getElementById("listing-tiles");

  let bookmarks = getCookie("wp_bookmarks");
  if (bookmarks == "") {
    bookmarks = [];
  } else {
    bookmarks = JSON.parse(bookmarks);
  }

  let stayandplay_bookmarks = getCookie("stayandplay_bookmarks");
  if (stayandplay_bookmarks == "") {
    stayandplay_bookmarks = [];
  } else {
    stayandplay_bookmarks = JSON.parse(stayandplay_bookmarks);
  }

  var directory_bookmarks = { events: [], listings: [] };
  for (row of stayandplay_bookmarks) {
    if (row.type == "event") {
      directory_bookmarks.events.push({ id: row.id });
    } else if (row.type == "listing") {
      directory_bookmarks.listings.push({ id: row.id });
    }
  }

  function saveStayAndPlayBookmarks() {
    stayandplay_bookmarks = [];
    for (listing_row of directory_bookmarks.listings) {
      stayandplay_bookmarks.push({ type: "listing", domain: listing_row.domain, id: listing_row.id });
    }
    for (event_row of directory_bookmarks.events) {
      stayandplay_bookmarks.push({ type: "event", domain: listing_row.domain, id: listing_row.id });
    }
    setCookie("stayandplay_bookmarks", JSON.stringify(stayandplay_bookmarks), 365);
  }

  const bookmarkEquality = function (b1, b2) {
    return b1.domain == b2.domain && b1.postID == b2.postID && b1.postType == b2.postType;
  }

  const bookmarkEqualityDirectory = function (b1, b2) {
    return b1.id == b2.id && b1.type == b2.type;
  }

  if (bookmarks.length == 0) {
    let _not_found = document.createElement("p");
    _not_found.innerHTML = "You haven't saved any pages yet."
    page_tiles_container.appendChild(_not_found);
  } else {
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
          let posts_data;
          try {
            posts_data = JSON.parse(this.responseText);
          } catch (e) {
            return console.error(e);
          }

          for (post_data of posts_data) {
            let _tile = document.createElement("div");
            _tile.bookmark = {
              domain: domain,
              postType: postType,
              postID: "" + post_data.id,
            }
            _tile.classList.add("flex");
            _tile.classList.add("relative");
            _tile.classList.add("flex-col");
            _tile.innerHTML = tile_template.trim();
            if (post_data?.title?.rendered != undefined) {
              _tile.querySelector(".title").innerHTML =
                post_data.title.rendered;
            }
            if (post_data?.excerpt?.rendered != undefined) {
              _tile.querySelector(".excerpt").innerHTML =
                post_data.excerpt.rendered;
            }
            if (post_data?.featured_image_src != undefined) {
              _tile
                .querySelector(".tile-image")
                .setAttribute("src", post_data.featured_image_src);
            }
            page_tiles_container.appendChild(_tile);
            _tile.querySelector(".bookmark-toggle").setAttribute("data-id", post_data.id);
            _tile.querySelector(".bookmark-toggle").addEventListener("click", function (e) {
              let bookmarks = getCookie("wp_bookmarks");
              if (bookmarks == "") {
                bookmarks = [];
              } else {
                bookmarks = JSON.parse(bookmarks);
              }

              const index = bookmarks.findIndex(function(b) {
                return bookmarkEquality(b, _tile.bookmark);
              });
              if (index != -1) {
                bookmarks.splice(index, 1);
                setCookie("wp_bookmarks", JSON.stringify(bookmarks), 365);
              }
              page_tiles_container.removeChild(_tile);
              e.preventDefault();
              return -1;
            });
          }
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

  const events_xhttp = new XMLHttpRequest();
  events_xhttp.onload = function () {
    var events_data = JSON.parse(this.responseText);
    const mapElement = document.getElementById("events-map");
    buildMap(events_data.events, mapElement);

    if (events_data.events.length == 0) {
      let _not_found = document.createElement("p");
      _not_found.innerHTML = "You haven't saved any events yet."
      event_tiles_container.appendChild(_not_found);
      mapElement.hidden = true;
    } else {
      for (event_data of events_data.events) {
        let _tile = document.createElement("div");
        _tile.classList.add("flex");
        _tile.classList.add("flex-col");
        _tile.classList.add("bg-white");
        _tile.classList.add("relative");
        _tile.innerHTML = tile_template.trim()
        _tile.querySelector(".title").innerHTML = event_data.name;
        _tile.querySelector(".title").setAttribute("href", event_data.url);
        _tile.querySelector(".excerpt").innerHTML = event_data.excerpt;
        _tile.querySelector(".tile-image").setAttribute("src", event_data.hero_image_url);
        _tile.querySelector(".content").innerHTML += event_extra_content
        if (event_data.date_range) {
          _tile.querySelector(".date_range").innerHTML = event_data.date_range;
        } else {
          _tile.querySelector(".date_range").style.display = "none";
        }

        if (event_data.address) {
          _tile.querySelector(".address").innerHTML = event_data.address;
        } else {
          _tile.querySelector(".address_row").style.display = "none";
        }

        _tile.querySelector(".bookmark-toggle").setAttribute("data-id", event_data.id);
        _tile.querySelector(".bookmark-toggle").addEventListener("click", function (e) {
          e.preventDefault();
          const index = directory_bookmarks.events.findIndex((b) => bookmarkEqualityDirectory(b, { id: this.getAttribute("data-id") }));
          if (index == -1) {
            // nothing
          } else {
            directory_bookmarks.events.splice(index, 1);
          }
          event_tiles_container.removeChild(_tile);
          saveStayAndPlayBookmarks();
          return -1;
        });

        event_tiles_container.appendChild(_tile);
      }
    }
  };
  let events_url = EVENTS_BASE_URL;
  for (event_row of directory_bookmarks.events) {
    events_url = events_url + "ids[]=" + event_row.id + "&";
  }
  events_xhttp.open("GET", events_url);
  events_xhttp.send();

  const listings_xhttp = new XMLHttpRequest();
  listings_xhttp.onload = function () {
    var listings_data = JSON.parse(this.responseText);
    const mapElement = document.getElementById("listings-map");
    buildMap(listings_data.listings, mapElement);

    if (listings_data.listings.length == 0) {
      let _not_found = document.createElement("p");
      _not_found.innerHTML = "You haven't saved any listings yet."
      listing_tiles_container.appendChild(_not_found);
      mapElement.hidden = true;
    } else {
      for (listing_data of listings_data.listings) {
        let id = parseInt(listing_data.url.split("/")[4]);
        let _tile = document.createElement("div");
        _tile.classList.add("listing-tile");
        _tile.classList.add("flex");
        _tile.classList.add("flex-col");
        _tile.classList.add("relative");
        _tile.classList.add("bg-white");
        _tile.innerHTML = tile_template.trim();
        _tile.querySelector(".title").innerHTML = listing_data.name;
        _tile.querySelector(".title").setAttribute("href", listing_data.url);
        _tile.querySelector(".excerpt").innerHTML = listing_data.excerpt;
        _tile.querySelector(".tile-image").setAttribute("src", listing_data.hero_image_url);
        _tile.querySelector(".content").innerHTML += listing_extra_content
        if (listing_data.address) {
          _tile.querySelector(".address").innerHTML = listing_data.address;
        } else {
          _tile.querySelector(".address_row").style.display = "none";
        }
        _tile.querySelector(".bookmark-toggle").setAttribute("data-id", id);
        _tile.querySelector(".bookmark-toggle").addEventListener("click", function (e) {
          e.preventDefault();
          const index = directory_bookmarks.listings.findIndex((b) => bookmarkEqualityDirectory(b, { id: this.getAttribute("data-id") }));
          if (index == -1) {
            // nothing
          } else {
            directory_bookmarks.listings.splice(index, 1);
          }
          listing_tiles_container.removeChild(_tile);
          saveStayAndPlayBookmarks();
          return -1;
        });
        listing_tiles_container.appendChild(_tile);
      }
    }
  };
  let listings_url = LISTINGS_BASE_URL;
  for (listing_row of directory_bookmarks.listings) {
    listings_url = listings_url + "ids[]=" + listing_row.id + "&";
  }
  listings_xhttp.open("GET", listings_url);
  listings_xhttp.send();

  document.getElementById("clear_itinerary").addEventListener("click", function () {
    if (window.confirm("This will clear your entire itinerary.  Are you sure you wish to proceed?")) {
      setCookie("stayandplay_bookmarks", "", 365);
      setCookie("wp_bookmarks", "", 365);
      window.reload();
    }
  });

});
