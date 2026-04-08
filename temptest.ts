// Copy paste the access token from the terminal after successful log in to avoid logging in every time while testing.

var accessToken: string | null = null; // "eyJhbGciOiJFUzI1NiIsImtpZCI6ImEzNTRjZDI1LWQ0YzUtNGEyNS05YzIyLWYyOWI0NTkxMGQ2OCIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2hvcHh2dmlxcnp2ZW9zcHh6dmR6LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI3ODRhOTUxZC0zMmFhLTQ0NTktYTIyYy02NTNjNjQ5MWE3NzYiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzc1MTE5MzYxLCJpYXQiOjE3NzUxMTU3NjEsImVtYWlsIjoiaXJhd2l6emFAdW1hc3MuZWR1IiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6eyJlbWFpbCI6ImlyYXdpenphQHVtYXNzLmVkdSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmdWxsX25hbWUiOiJJYW4gUmF3aXp6YSIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiNzg0YTk1MWQtMzJhYS00NDU5LWEyMmMtNjUzYzY0OTFhNzc2In0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NzUxMTU3NjF9XSwic2Vzc2lvbl9pZCI6ImRkOGE1MWIwLTkxN2ItNDRmNS1hMjk1LTBmODg0YjJlZTUxYyIsImlzX2Fub255bW91cyI6ZmFsc2V9.wWjjYUqlY8_zC9lN-UYXL1iFav1X7cFP2LoFU046FfemJcJYykox-Ivp1zTfnqrxL6CGh36I7Pj-wfTslQbsew";
var refreshToken: string | null = null; // "p4wc4vp3f64a";

if (!accessToken) {
    const response = await fetch('localhost:3000/api/account/login', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    body: JSON.stringify({
        email: "irawizza@umass.edu",
        password: "123456",
        name: "Ian Rawizza"
    })
    });

    console.log(response);

    const responseJson = await response.body?.json();

    console.log(responseJson);

    const { session } = responseJson;
    accessToken = session?.access_token || null;
    refreshToken = session?.refresh_token || null;
}

// const authResponse = await fetch('localhost:3000/api/account', {
//   method: 'GET',
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${accessToken} ${refreshToken}`
//     }
// });

// console.log(authResponse);

// const authResponseJson = await authResponse.body?.json();

// console.log(authResponseJson);


// const getUserResponse = await fetch('localhost:3000/api/user', {
//   method: 'GET',
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${accessToken} ${refreshToken}`
//     }
// });

// console.log(getUserResponse);

// const getUserResponseJson = await getUserResponse.body?.json();

// console.log(getUserResponseJson);

// const updateUser = await fetch('localhost:3000/api/user', {
//   method: 'PATCH',
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${accessToken} ${refreshToken}`
//     },
//     body: JSON.stringify({
//         address: "124 Main St",
//     })
// });

// console.log(updateUser);

// const updateUserJson = await updateUser.body?.json();

// console.log(updateUserJson);


// const postListing = await fetch('localhost:3000/api/listing', {
//   method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//         'Authorization': `Bearer ${accessToken} ${refreshToken}`
//     },
//     body: JSON.stringify({
//         product_name: "Test Product",
//         item_condition: "New",
//         price: 19.99
//     })
// });

// console.log(postListing);

// const postListingJson = await postListing.body?.json();

// console.log(postListingJson);

const patchListing = await fetch('localhost:3000/api/listing/2', {
  method: 'PATCH',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken} ${refreshToken}`
    },
    body: JSON.stringify({
        product_name: "My product",
        price: 15.99
    })
});

console.log(patchListing);

const patchListingJson = await patchListing.body?.json();

console.log(patchListingJson);




