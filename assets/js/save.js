window.addEventListener("DOMContentLoaded", function() {
    let copy_link = document.getElementById("copy-link");
    copy_link.addEventListener('click', handleCopyLink);
});

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
