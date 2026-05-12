const hash = window.location.hash.substring(1); // Remove the '#'
const params = new URLSearchParams(hash);
const accessToken = params.get('access_token');
// console.log(accessToken); // Logs the access token if it exists
const refreshToken = params.get('refresh_token');
// console.log(refreshToken); // Logs the refresh token if it exists

const form = document.querySelector('form');
form.addEventListener('submit', async (e) =>{
    e.preventDefault(); // Prevent page reload
    const data = new FormData(e.target);
    const values = Object.fromEntries(data.entries());
  
    const response = await fetch('/api/account', {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken} ${refreshToken}`
        },
        body: JSON.stringify({
            password: values.password
        })
    });

    if (response.ok) {
        window.location.href = '/pages/confirmation/index.html'; // Redirect to confirmation page
    }
}); 

