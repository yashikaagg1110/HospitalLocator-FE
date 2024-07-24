// script.js
document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById('autocomplete-input');
    const autocompleteList = document.getElementById('autocomplete-list');

    // Base URL for the API endpoint (replace with your actual API endpoint)
    const apiUrl = `https://geocode.maps.co/search`; // Replace with your actual API URL
    function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}


     function fetchSuggestions(query) {
        // Replace this URL with the URL of your API and adjust query parameter if needed
        return  fetch(`${apiUrl}?q=${encodeURIComponent(input.value)}&api_key=668f77953c443921364690nrf6d0eb9`)
            .then(response => response.json())
            .then(data => {
            //console.log(data,"data");
                // Extract display_name from each suggestion
                return data.map(item => item.display_name);
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
                return [];
            });
    }
    
         const debouncedFetchSearchResults = debounce(async(query)=>{
        const result = await fetchSuggestions(query);
        console.log(result,"result");
        displaySuggestions(result)
        return result;
        }, 1000);

    function closeAllLists() {
        const items = document.querySelectorAll('.autocomplete-items');
        items.forEach(item => item.parentNode.removeChild(item));
    }

    function displaySuggestions(suggestions) {
        closeAllLists();
        if (!suggestions.length) return;

        const autocompleteDiv = document.createElement('div');
        autocompleteDiv.setAttribute('id', 'autocomplete-list');
        autocompleteDiv.setAttribute('class', 'autocomplete-items');
        suggestions.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `<strong>${item.substr(0, input.value.length)}</strong>${item.substr(input.value.length)}`;
            itemDiv.addEventListener('click', () => {
                input.value = item;
                closeAllLists();
            });
            autocompleteDiv.appendChild(itemDiv);
        });
        input.parentNode.appendChild(autocompleteDiv);
    }

    input.addEventListener('input', () => {
        const value = input.value;
        if (value.length < 3) {
            closeAllLists();
            return; // Optionally, you can start fetching data only if the input length is more than 2 characters
        }

        debouncedFetchSearchResults(value);
    });

    document.addEventListener('click', (e) => {
        if (e.target !== input) {
            closeAllLists();
        }
    });
});
