var map;

const set_view = async (lat, lng) => {
    scrollTo(0, 65);
    map.flyTo([lat, lng], 13);
    await loadMap();
    await loadPlaces();
}

const loadPlaces = async () => {  
    const response = await axios.get('/contacts');  
    if (response && response.data && response.data.contacts) {
        for (const c of response.data.contacts) {            
            L.marker([c.latitude, c.longitude]).addTo(map).bindPopup('<b>' + c.fname + " " + c.lname + '</b><br>' + c.address).openPopup();
        }
    }    
}

const loadMap = async () => {    
    map = L.map('map').setView([41.08224455, -74.1738235180645], 13);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
}