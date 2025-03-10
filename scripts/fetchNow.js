console.log("fetchNow.js is running");

// Define the URL for the backend API
const url = "http://localhost:3000/api/schedule/now";

// variables for date
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
console.log(year, month, day);

// Fetch the data from the backend API
async function fetchNow(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.log("Error: ", error);
    }
    return null;
}
fetchNow(url);
