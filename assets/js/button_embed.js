window.addEventListener("DOMContentLoaded", function () {
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.bottom = "32px";
  iframe.style.left = "32px";
  iframe.style.zIndex = "10";
  iframe.style.width = "48px";
  iframe.style.height = "48px";
  let postType = false;
  let postID = false;
  const body = document.body;
  body.classList.forEach((className) => {
    let matches;
    // page
    if (matches = className.match(/page-id-(\d*)/)) {
      postType = "page";
      postID = matches[1];
    }

    // post type and id
    if (matches = className.match(/([\w-]*)-id-(\d*)/)) {
      postType = matches[1];
      postID = matches[2];
    }

    // single post type
    if (matches = className.match(/single-([\w-]*)/)) {
      if (!className.match(/single-format/)) {
        console.log(matches);
        postType = matches[1];
      }
    }

    // single post id
    if (matches = className.match(/postid-(\d*)/)) {
      console.log(matches);
      postID = matches[1];
    }
  });

  if (postType == "page") {
    postType = "pages";
  }
  if (postType == "post") {
    postType = "posts";
  }
  const domain = window.location.origin;
  if (postType == false || postID == false) {
    // couldn't find a post id and/or post type, so do not create the iframe
    return;
  }
  iframe.setAttribute("id", "itinerary_button_iframe");
  iframe.setAttribute("src", `https://10fdesign.github.io/vv-itinerary/button?domain=${domain}&post_id=${postID}&post_type=${postType}`);
  document.body.appendChild(iframe);
});
