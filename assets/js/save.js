window.addEventListener("DOMContentLoaded", function() {
    const copy_link = document.getElementById("copy-link");
    copy_link.addEventListener('click', handleCopyLink);

    const view_saved_trip_link = document.getElementById("view-saved-trip-link");
    view_saved_trip_link.addEventListener('click', handleViewSavedTripLink);

    const make_saved_trip_link = document.getElementById("make-saved-trip-link");
    make_saved_trip_link.addEventListener('click', handleMakeSavedTrip);

    handleUrlParams();
});

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

    const urlparams__wp_bookmarks = urlParams.get('wp_bookmarks');
    const urlparams__stayandplay_bookmarks = urlParams.get('stayandplay_bookmarks');

    setCookie("wp_bookmarks", urlparams__wp_bookmarks, 365);
    setCookie("stayandplay_bookmarks", urlparams__stayandplay_bookmarks, 365);

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
    if ( urlParams.size == 0 ) {
        return;
    }

    const urlparams__wp_bookmarks = urlParams.get('wp_bookmarks');
    const urlparams__stayandplay_bookmarks = urlParams.get('stayandplay_bookmarks');

    const cookie__wp_bookmarks = getCookie("wp_bookmarks");
    const cookie__stayandplay_bookmarks = getCookie("stayandplay_bookmarks");

    if ( cookie__stayandplay_bookmarks == "" && cookie__wp_bookmarks == "" ) {
        // If there are no cookies, write the query string to cookies

        setCookie("stayandplay_bookmarks", urlParams.get('stayandplay_bookmarks'), 365);
        setCookie("wp_bookmarks", urlParams.get('wp_bookmarks'), 365);

        console.log("No cookies found. Saved urlParams to cookies.");
    } else if ( cookie__stayandplay_bookmarks == urlparams__stayandplay_bookmarks && cookie__wp_bookmarks == urlparams__wp_bookmarks ) {
        // If the query string matches the cookies, nobody cares

        console.log("Cookies match urlParams. No change.")
    } else {
        saveBanner.classList.remove("hidden");

        console.log("Cookies don't match urlParams. Unhiding save-banner.")
    }
}

function handleCopyLink(e) {
    e.preventDefault();

    let save_url = generateURLFromCookies();

    copyToClipboard(save_url);
}

function generateURLFromCookies() {
    let wp_bookmarks = getCookie("wp_bookmarks");
    if (wp_bookmarks == "") {
        wp_bookmarks = [];
    } else {
        wp_bookmarks = JSON.parse(wp_bookmarks);
    }
    console.log(wp_bookmarks);

    let stayandplay_bookmarks = getCookie("stayandplay_bookmarks");
    if (stayandplay_bookmarks == "") {
        stayandplay_bookmarks = [];
    } else {
        stayandplay_bookmarks = JSON.parse(stayandplay_bookmarks);
    }

    // var directory_bookmarks = { events: [], listings: [] };
    // for ( row of stayandplay_bookmarks ) {
    //     if ( row.type == "event" ) {
    //         directory_bookmarks.events.push( { id: row.id, domain: row.domain } );
    //     } else if ( row.type == "listing" ) {
    //         directory_bookmarks.listings.push( { id: row.id, domain: row.domain } );
    //     }
    // }
    // console.log(directory_bookmarks['events']);

    // save_url += '?events=' + directory_bookmarks['events'].map(item => item.id).join(',');
    // save_url += '&listings=' + directory_bookmarks['listings'].map(item => item.id).join(',');

    let save_url = window.location.origin + '/?wp_bookmarks=' + getCookie('wp_bookmarks');
    save_url += '&stayandplay_bookmarks=' + getCookie('stayandplay_bookmarks');

    return save_url;
}

async function copyToClipboard(textToCopy) {
  try {
    await navigator.clipboard.writeText(textToCopy);
    console.log('Text copied to clipboard:', textToCopy);
  } catch (err) {
    console.error('Failed to copy text:', err);
  }
}
