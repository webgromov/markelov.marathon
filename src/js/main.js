window.addEventListener('load', () => {
    // Loader if u need
    const $loader = document.querySelector('#loader')
    $loader.classList.add('loaded')
    
    // Lazy loading img
    for($img of document.querySelectorAll('img[data-lazy-src]')) {
        $img.setAttribute('src', $img.dataset.lazySrc)
        delete $img.dataset.lazySrc
    }

    // Highlight
    const mobileWebkitHighlight = `* {-webkit-tap-highlight-color: none;}`
    if(detectMob()) {
        console.log('U r using mobile version')
    }

})

function detectMob() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ];

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem);
    });
}