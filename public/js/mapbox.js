/*  eslint-disable */

console.log('hello from the client side of the server');

const locations = JSON.parse(document.getElementById('map').dataset.locations);

console.log(locations);

mapboxgl.accessToken =
  'pk.eyJ1IjoiYW5tb2xub29yIiwiYSI6ImNreG5rcDlwZTA5Z3gydW9lcjQ1bGsweDAifQ.x7EHoYqOocQzIIKL1DD1LA';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/anmolnoor/ckxnkrep62dp316ryp8gftmsy',
});
