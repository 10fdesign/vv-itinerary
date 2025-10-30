window.addEventListener("DOMContentLoaded", function () {
  const copy_link = document.getElementById("copy-link");
  copy_link.addEventListener('click', handleCopyLink);

  const view_saved_trip_link = document.getElementById("view-saved-trip-link");
  view_saved_trip_link.addEventListener('click', handleViewSavedTripLink);

  const make_saved_trip_link = document.getElementById("make-saved-trip-link");
  make_saved_trip_link.addEventListener('click', handleMakeSavedTrip);

  const shareTripLink = document.getElementById("email_trip");
  shareTripLink.addEventListener('click', handleShareTrip);

  handleUrlParams();
});

function handleShareTrip(e) {
  e.preventDefault();
  const subject = "My Vermont trip"
  const body = "Here's a link to my trip: " + generateURLFromCookies() + " ";
  const url = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = url;
  return false;
}

function handleViewSavedTripLink(e) {
  e.preventDefault();

  window.location.href = window.location.origin;
}

function handleMakeSavedTrip(e) {
  e.preventDefault();

  let userConfirmed = confirm("This will replace your saved itinerary with the current itinerary.")

  if (!userConfirmed) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);

  const wpBookmarks = URIDecodeWP(urlParams.get('w'));
  const directoryBookmarks = URIDecodeDirectory(urlParams.get('d'));

  setCookie("wp_bookmarks", JSON.stringify(wpBookmarks), 365);
  setCookie("stayandplay_bookmarks", JSON.stringify(directoryBookmarks), 365);

  window.location.href = window.location.origin;
}

function handleUrlParams() {
  // Load bookmarks from URL
  // TODO: When you load the page, if there’s a query string, load those tiles
  // If there are no cookies, write the query string to cookies
  // If the query string matches the cookies, nobody cares
  // If the query string doesn’t match the cookies, show the optional top panel

  const saveBanner = document.getElementById('save-banner');

  const urlParams = new URLSearchParams(window.location.search);
  console.log("urlParams", urlParams);

  // Exit early if no urlParams
  if (urlParams.size == 0) {
    return urlParams;
  }

  const urlparams__wp_bookmarks = URIDecodeWP(urlParams.get('w'));
  const urlparams__stayandplay_bookmarks = URIDecodeDirectory(urlParams.get('d'));

  const cookie__wp_bookmarks = getCookie("wp_bookmarks");
  const cookie__stayandplay_bookmarks = getCookie("stayandplay_bookmarks");

  const cookieObjectWP = JSON.parse(cookie__wp_bookmarks);
  const cookieObjectDirectory = JSON.parse(cookie__stayandplay_bookmarks);

  if (cookie__stayandplay_bookmarks == "" && cookie__wp_bookmarks == "") {
    // If there are no cookies, write the query string to cookies

    setCookie("wp_bookmarks", JSON.stringify(urlparams__wp_bookmarks), 365);
    setCookie("stayandplay_bookmarks", JSON.stringify(urlparams__stayandplay_bookmarks), 365);

    console.log("No cookies found. Saved urlParams to cookies.");
  } else if (objectArrayEquality(cookieObjectWP, urlparams__wp_bookmarks) && objectArrayEquality(cookieObjectDirectory, urlparams__stayandplay_bookmarks)) {
    // If the query string matches the cookies, nobody cares

    console.log("Cookies match urlParams. No change.")
  } else {
    saveBanner.classList.remove("hidden");

    console.log("Cookies don't match urlParams. Unhiding save-banner.");
  }
  return urlParams;
}

function handleCopyLink(e) {
  e.preventDefault();

  let save_url = generateURLFromCookies();

  copyToClipboard(save_url);
}

function generateURLFromCookies() {
  let save_url = window.location.origin + '/?w=' + URIEncodeWP();
  save_url += '&d=' + URIEncodeDirectory();

  return save_url;
}

function URIEncodeWP() {
  let bookmarks = getCookie("wp_bookmarks");
  if (bookmarks == "") {
    bookmarks = [];
  } else {
    bookmarks = JSON.parse(bookmarks);
  }
  const compressed = compressWPBookmarks(bookmarks);
  const json = JSON.stringify(compressed);
  const b64 = btoa(json);
  const encoded = encodeURIComponent(b64);
  return encoded;
}

function URIEncodeDirectory() {
  let bookmarks = getCookie("stayandplay_bookmarks");
  if (bookmarks == "") {
    bookmarks = [];
  } else {
    bookmarks = JSON.parse(bookmarks);
  }
  const compressed = compressDirectoryBookmarks(bookmarks);
  const json = JSON.stringify(compressed);
  const b64 = btoa(json);
  const encoded = encodeURIComponent(b64);
  return encoded;
}

function compressWPBookmarks(bookmarks) {
  let compressed = {};
  bookmarks.forEach(bookmark => {
    if (!compressed.hasOwnProperty(bookmark.domain)) {
      compressed[bookmark.domain] = {};
    }
    let byDomain = compressed[bookmark.domain];
    if (!byDomain.hasOwnProperty(bookmark.postType)) {
      byDomain[bookmark.postType] = []
    }
    byDomain[bookmark.postType].push(bookmark.postID);
  });
  return compressed;
}

function compressDirectoryBookmarks(bookmarks) {
  let compressed = {};
  bookmarks.forEach(bookmark => {
    if (!compressed.hasOwnProperty(bookmark.domain)) {
      compressed[bookmark.domain] = {};
    }
    let byDomain = compressed[bookmark.domain];
    if (!byDomain.hasOwnProperty(bookmark.type)) {
      byDomain[bookmark.type] = []
    }
    byDomain[bookmark.type].push(bookmark.id);
  });
  return compressed;
}

function URIDecodeWP(uriParameter) {
  if (!uriParameter) {
    return [];
  }
  let object;
  try {
    const b64 = decodeURIComponent(uriParameter);
    const json = atob(b64);
    object = JSON.parse(json);
  } catch (error) {
    console.log("Error in URIDecodeWP: ", error);
    return [];
  }
  let result = [];
  for (const domain in object) {
    for (const type in object[domain]) {
      object[domain][type].forEach(id => {
        const row = {"domain": domain, "postType": type, "postID": id};
        result.push(row);
      });
    }
  }
  return result;
}

function URIDecodeDirectory(uriParameter) {
  if (!uriParameter) {
    return [];
  }
  let object;
  try {
    const b64 = decodeURIComponent(uriParameter);
    const json = atob(b64);
    object = JSON.parse(json);
  } catch (error) {
    console.log("Error in URIDecodeDirectory: ", error);
    return [];
  }
  let result = [];
  for (const domain in object) {
    for (const type in object[domain]) {
      object[domain][type].forEach(id => {
        const row = {"domain": domain, "type": type, "id": id};
        result.push(row);
      });
    }
  }
  return result;
}


function objectArrayEquality(a, b) {
  if (a.length != b.length) {
    return false;
  }
  a.forEach((x, i) => {
    const y = b[i];
    for (const property in x) {
      if (!y.hasOwnProperty(property)) {
        return false;
      }
      if (x[property] != y[property]) {
        return false;
      }
    }
  });
  return true;
}

async function copyToClipboard(textToCopy) {
  try {
    await navigator.clipboard.writeText(textToCopy);
    console.log('Text copied to clipboard:', textToCopy);
  } catch (err) {
    console.error('Failed to copy text:', err);
  }
}
