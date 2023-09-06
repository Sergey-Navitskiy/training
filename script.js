"use strict";

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
  _setDescription() {
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
    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Training {
  type = "running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Training {
  type = "cycling";
  constructor(coords, distance, duration, elevation) {
    super(coords, distance, duration);
    this.elevation = elevation;
    this.calcSpeed();
    this._setDescription();
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
    this._getLocalStorage()
    // обработчик который вызывает метод ньюВоркаут
    form.addEventListener("submit", this._newWorkout.bind(this));

    // Обработчик события который вызывает метод _toogleField.
    inputType.addEventListener("change", this._toogleField);
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));

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

    this.workouts.forEach((work) => {
      this._renderWorkMarker(work)
    })
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
    this._renderWorkMarker(workout);
    // рендер
    this._renderWorkOut(workout);
    this._hideForm();
    this._setLocalStorage()
  }
  _renderWorkMarker(workout) {
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
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
    //
  }
  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    form.classList.add("hidden");
  }

  // рендер списка тренеровок
  _renderWorkOut(workout) {
    let html = `
  <li class="workout workout--${workout.type}" data-id="${workout.id}">
  <h2 class="workout__title">${workout.description}</h2>
  <div class="workout__details">
    <span class="workout__icon">${
      workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
    }</span>
    <span class="workout__value">${workout.distance}</span>
    <span class="workout__unit">км</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">⏱</span>
    <span class="workout__value">${workout.duration}</span>
    <span class="workout__unit">мин</span>
  </div>`;
    if (workout.type === "running") {
      html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">мин/км</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">шаг</span>
        </div>
      </li>
      
    `;
    }
    if (workout.type === "cycling") {
      html += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">км/час</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevation}</span>
        <span class="workout__unit">м</span>
      </div>
    </li> 
    `;
    }
    form.insertAdjacentHTML("afterend", html);
  }

  _moveToPopup(e) {
    const workoutEL = e.target.closest(".workout");
    console.log(workoutEL);
    if (!workoutEL) return;

    const workout = this._workouts.find(
      (work) => work.id === workoutEL.dataset.id
    );
    console.log(workout);
    this._map.setView(workout.coords, 13, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this._workouts))
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'))
    if(!data) return
    this.workouts = data 
    this.workouts.forEach((work) => {
      this._renderWorkOut(work)
    })
  }


 reset() {
  localStorage.removeItem('workouts')
  location.reload()
 }
}

const app = new App();

