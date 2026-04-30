var accessToken, refreshToken;
// set tokens from cookies if they exist
const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
}, {});

accessToken = cookies.accessToken || null;
refreshToken = cookies.refreshToken || null;

function getImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.style.height = '300px';
    img.style.width = 'auto';
    img.onload = () => resolve(img.naturalWidth > 0 ? img : null); // Confirms it has actual dimensions
    img.onerror = () => resolve(null); // Not a valid image
    img.src = url;
  });
}

/**
 * Makes a fetch request with locally stored authorization tokens.
 * 
 * Updates locally stored authorization tokens automatically if the `Set-Session-Tokens` header
 * @param input url to make the fetch request to
 * @param init data included in the fetch request
 * @returns Response of the fetch request
 */
async function fetchWithAuth(input, init, resetTokens = false) {
    // Define init and get headers
    if (init === undefined){
        init = {};
    }
    const headers = new Headers(init.headers);

    // Get tokens
    if (!resetTokens && accessToken !== null && refreshToken !== null){
        headers.set('Authorization', `Bearer ${accessToken} ${refreshToken}`)
    }

    // Update headers with tokens
    init.headers = headers;

    // Make fetch request
    const response = await fetch(input, init);

    // Update locally stored session tokens
    const tokens = response.headers.get("Set-Session-Tokens")

    if (tokens){
        [ accessToken, refreshToken ] = tokens.split(' ');
        // update cookies
        document.cookie = `accessToken=${accessToken}; path=/;`;
        document.cookie = `refreshToken=${refreshToken}; path=/;`;
    }

    return response;
}

const loginStatus = document.querySelector('#login-status');
if (accessToken && refreshToken) {
    loginStatus.textContent = "Status: Logged in";
}

const form = document.querySelector('#login-form');
form.addEventListener('submit', async (e) =>{
    e.preventDefault(); // Prevent page reload
    const data = new FormData(e.target);
    const values = Object.fromEntries(data.entries());
  
    const response = await fetchWithAuth('/api/account/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: values.email,
            password: values.password
        })
    }, true);

    if (response.ok) {
        loginStatus.textContent = "Status: Logged in";
    } else {
        loginStatus.textContent = "Status: Login failed";
    }
}); 

const contentTypeSelect = document.getElementById('content-type');
const methodSelect = document.getElementById('method');
const container = document.getElementById('dynamic-input-container');
// const payloadHeaders = document.getElementById('payload-headers');
const payloadHeaders = [];
const headersContainer = document.getElementById('add-headers-container');

contentTypeSelect.addEventListener('change', (e) => {
  const type = e.target.value;
  container.innerHTML = ''; // Clear current input

  if (type === 'json' || type === 'plain') {
    const label = document.createElement('label');
    label.textContent = type === 'json' ? 'Body (JSON):' : 'Body (Text):';
    label.classList.add('payload-label');

    const textarea = document.createElement('textarea');
    textarea.id = 'payload';
    textarea.name = 'payload';
    textarea.rows = 8;
    textarea.value = '{\n\n}';
    textarea.classList.add('payload-textarea');

    container.append(label, textarea);
  } 
  else if (type === 'file') {
    const label = document.createElement('label');
    label.textContent = 'Upload File:';
    
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'payload';
    fileInput.name = 'payload';
    
    container.append(label, fileInput);
  }
});

methodSelect.addEventListener('change', (e) => {
    const method = e.target.value;
    if (method === 'GET') {
        contentTypeSelect.value = 'plain';
        container.innerHTML = '';
    }
    else if (container.innerHTML.trim() === '') {
        const type = contentTypeSelect.value;
        if (type === 'json' || type === 'plain') {
            const label = document.createElement('label');
            label.textContent = type === 'json' ? 'Body (JSON):' : 'Body (Text):';
            label.classList.add('payload-label');

            const textarea = document.createElement('textarea');
            textarea.id = 'payload';
            textarea.name = 'payload';
            textarea.rows = 8;
            textarea.value = '{\n\n}';
            textarea.classList.add('payload-textarea');

            container.append(label, textarea);
        } 
        else if (type === 'file') {
            const label = document.createElement('label');
            label.textContent = 'Upload File:';

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'payload';
            fileInput.name = 'payload';

            container.append(label, fileInput);
        }
    }

    
});

const fetchForm = document.getElementById('fetch-form');
const historyContainer = document.getElementById('history-container');

fetchForm.addEventListener('submit', async (e) => {
    const photosContainer = document.getElementById('photos-container');
    photosContainer.innerHTML = ''; // Clear previous photos
    e.preventDefault();

    const fetchStatus = document.getElementById('fetch-status');
    const fetchResponse = document.getElementById('fetch-response');
    historyContainer.innerHTML = fetchResponse.innerHTML + "<hr>" + historyContainer.innerHTML; // Append previous response to history
    fetchResponse.innerHTML = ''; // Clear previous response
    fetchStatus.textContent = `Status: Fetching...`;

    const url = document.getElementById('url').value;
    const method = methodSelect.value;
    const contentType = document.getElementById('content-type').value;
    const payloadElement = document.getElementById('payload');

    let body;
    let headers = {};

    if (method !== 'GET'){
        if (contentType === 'file') {
            // Files must be sent using FormData; browser sets the boundary header automatically
            body = payloadElement.files[0]; // Get the first selected file
            console.log(payloadElement.files[0].type);
        } else if (contentType === 'json') {
            body = payloadElement.value;
            headers['Content-Type'] = 'application/json';
        } else {
            body = payloadElement.value;
            headers['Content-Type'] = 'text/plain';
        }
    }

    if (payloadHeaders.length > 0) {
        headers = { ...headers, ...Object.fromEntries(payloadHeaders.map(h => [h.keyInput.value, h.valueInput.value])) };
    }

    try {
        const response = await fetchWithAuth(url, {
            method: method,
            headers: headers,
            body: method !== 'GET' ? body : null // GET requests cannot have a body
        });
        fetchStatus.textContent = `Status: ${response.status} ${response.statusText}`;

        const result = await response.json();
        console.log('Success:', result);
        // alert('Request successful! Check console for details.');
        fetchResponse.innerHTML = `Response: <pre>${JSON.stringify(result, null, 2)}</pre>`;
    } catch (error) {
        console.error('Error:', error);
        // alert('Request failed.');
        fetchResponse.innerHTML = `Error: ${error}`;
    }
});

const loadPhotosBtn = document.getElementById('load-photos');

loadPhotosBtn.addEventListener('click', async () => {
    const html = document.getElementById('fetch-response').innerHTML;
    const urls = html.match(/https?:\/\/[^"\s<>{}|\\^~[\]` ]+/g);
    
    const photosContainer = document.getElementById('photos-container');
    photosContainer.innerHTML = ''; // Clear previous photos
    
    photosContainer.innerHTML = '<h3>Extracted Photos:</h3>';

    if (urls) {
        await Promise.all(urls.map(url => getImage(url).then(img => img ? photosContainer.appendChild(img) : null)));
    } else {
        photosContainer.innerHTML += '<p>No image URLs found in the response.</p>';
    }
});

const addHeadersBtn = document.getElementById('add-header-btn');
addHeadersBtn.addEventListener('click', () => {
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header-input-wrapper');
    const headerKey = document.createElement('input');
    headerKey.type = 'text';
    headerKey.placeholder = 'Header Key';
    const headerValue = document.createElement('input');
    headerValue.type = 'text';
    headerValue.placeholder = 'Header Value';
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.textContent = 'X';
    headerDiv.append(headerKey, headerValue, removeBtn);
    headersContainer.appendChild(headerDiv);

    const index = payloadHeaders.push({ keyInput: headerKey, valueInput: headerValue }) - 1;
    removeBtn.addEventListener('click', () => {
        headersContainer.removeChild(headerDiv);
        payloadHeaders.splice(index, 1);
    });

    
});


