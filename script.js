"use strict";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");


let map 
let mapEv

class App{
  _map;
  _mapEv;
  constructor(){
    this._getPosition()
    form.addEventListener('submit', this._newWorkout.bind(this))
    inputType.addEventListener('change', this._toogleField.bind(this))
  }
  // метод запроса данных  о местоположении пользователя 
  _getPosition(){
    if(navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap.bind(this),
  
        function() {
          alert('Вы не предоставили доступ к своей геолокации')
        })
  }
  // Метод загрузки карты на страницу
  _loadMap(pos){
      const {latitude} = pos.coords
      const {longitude} = pos.coords
      const coord = [latitude,longitude]
      this._map = L.map('map').setView(coord, 13);
    
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(this._map);
    
      
        // Нажатие по карте 
        this._map.on('click', this._showForm.bind(this))
      }
  // Метод отображения формы 
  _showForm(mapE){ 
    this._mapEv = mapE
    form.classList.remove('hidden')
    inputDistance.focus()
  }
  //Переключатель типов тренеровки 
  _toogleField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden')
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
  }
  // Метод установки точки на карте
  _newWorkout(e){
      e.preventDefault()
      inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = ''
      const { lat, lng } = this._mapEv.latlng 
      L.marker([lat, lng])
      .addTo(this._map)
      .bindPopup(L.popup({
        maxWidth: 250, 
        minWidth: 100, 
        autoClose: false, 
        closeOnClick: false, 
        className: 'mark-popup'}))
      .setPopupContent('Тренировка')
      .openPopup(); 
  }
}

const app = new App()
app._getPosition





