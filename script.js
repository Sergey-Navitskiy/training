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

class Training {
  date = new Date();
  id = (Date.now() + "").slice(-10);
  constructor(coords, distance, duration) {
    this.coords = coords;
    this.distance = distance;
    this.duration = duration;
  }
}

class Running extends Training {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Training {
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
    return this.calcSpeed;
  }
}

class App {
  _workouts = [];
  _map;
  _mapEv;
  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkout.bind(this));
    inputType.addEventListener("change", this._toogleField.bind(this));
  }

  // метод запроса данных  о местоположении пользователя

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),

        function () {
          alert("Вы не предоставили доступ к своей геолокации");
        }
      );
  }

  // Метод загрузки карты на страницу

  _loadMap(pos) {
    const { latitude } = pos.coords;
    const { longitude } = pos.coords;
    const coord = [latitude, longitude];
    this._map = L.map("map").setView(coord, 13);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this._map);

    // Нажатие по карте
    this._map.on("click", this._showForm.bind(this));
  }

  // Метод отображения формы

  _showForm(mapE) {
    this._mapEv = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  //Переключатель типов тренеровки

  _toogleField() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
  }

  // Метод установки точки на карте

  _newWorkout(e) {
    e.preventDefault();

    const validInput = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    //Данные из форм
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this._mapEv.latlng;
    let workout;

    if (type === "running") {
      const cadience = +inputCadence.value;

      if (
        !validInput(distance, duration, cadience) ||
        !allPositive(distance, duration, cadience)
      ) {
        return alert("Необходимо ввести целое положительное число");
      }
      workout = new Running([lat, lng], distance, duration, cadience);
    }

    if (type === "cycling") {
      const elevat = +inputElevation.value;

      if (
        !validInput(distance, duration, elevat) ||
        !allPositive(distance, duration, elevat)
      ) {
        return alert("Необходимо ввести целое положительное число");
      }
      workout = new Cycling([lat, lng], distance, duration, elevat);
    }
    this._workouts.push(workout);


    
    

    // рендер маркера тренировки 
    this.renderWorkMarker(workout)
  }
  renderWorkMarker(workout) {
    L.marker(workout.coords)
    .addTo(this._map)
    .bindPopup(
      L.popup({
        maxWidth: 250,
        minWidth: 100,
        autoClose: false,
        closeOnClick: false,
        className: "mark-popup",
      })
    )
    .setPopupContent('workout.distance')
    .openPopup();
  }
}

inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";

const app = new App();
app._getPosition;
