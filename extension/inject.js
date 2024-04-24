// CONST
const SEARCH_RETRIES = 10
const CACHE_URL_BASE = 'https://webcache.googleusercontent.com/search?q=cache:'

console.log('injected :)')

const sleep = ms => {
    return new Promise(resolve => setTimeout(() => resolve(), ms))
}

async function initOnMedium(attempt = SEARCH_RETRIES) {
    // trying to find Upgrade button
    if (attempt) {
        const upgradeButton = document.getElementById('paywallButton-programming')
        if (upgradeButton) {
            return upgradeButton
        } else {
            console.log('searching for the "Upgrade" button..')
            await sleep(2000)
            return initOnMedium(--attempt)
        }
    }
    // if not found
    return null
}

const initOnCache = currentUrl => {
    // console.log('YES')

    // requesting the same page
    const cachePage = fetch(currentUrl, {
        referrerPolicy: 'strict-origin-when-cross-origin',
        method: 'GET',
        credentials: 'include',
    })
        .then(res => {
            // console.log('Res...')
            return res.text()
        })
        .then(html => {
            // console.log('HTML loaded')
            // document.open();
            document.write(
                html.replace(
                    '<script>window.main();</script>',
                    '<script>const cacheBar = document.querySelectorAll(\'[id$=__google-cache-hdr]\'); if (cacheBar.length > 0) { cacheBar[0].style.display = \'none\';}</script>',
                ),
            )
            document.close()

            document.body.style = 'display:block;'
        })
        .catch(err => console.log('er Damn...', err))

    // TODO Add youtube loading
}

// Starting point.
// Waiting until document is loaded
document.addEventListener('readystatechange', async event => {
    if (event.target.readyState === 'complete') {
        const currentUrl = window.location.href

        // initOnMedium
        if (currentUrl.startsWith('https://medium.com')) {

            console.log('loading complete')
            initOnMedium()
                .then(upgradeButton => {
                    if (upgradeButton) {
                        console.log('success!')

                        // beautifying Upgrade button
                        upgradeButton.classList.add('upgrade_button')

                        // redirecting to cache page onClick
                        upgradeButton.onclick = () => {
                            window.open(CACHE_URL_BASE + currentUrl, '_self')
                            return false
                        }
                    } else {
                        console.log('Upgrade button not found, try reload the page')
                    }
                })
                .catch(err => console.log('Smth went wrong..', err))
        }

        // initOnCache
        if (currentUrl.startsWith('https://webcache.googleusercontent.com/')) {

            document.body.style = 'display:flex; flex-direction:column; justify-content:center;'

            const loadingSpinner = document.createElement('span')
            loadingSpinner.className = 'loader'
            document.body.insertBefore(loadingSpinner, document.body.firstChild)

            // hiding Google's bar
            const cacheBar = document.querySelectorAll('[id$=__google-cache-hdr]')
            if (cacheBar.length > 0) {
                cacheBar[0].style.display = 'none'
            }

            initOnCache(currentUrl)
        }
    }
})
