import {Column} from './column';
import {RenderStation} from './renderStation';
export class Station {
  #queue = [];
  #filling = [];
  #ready = [];

  constructor(typeStation, renderApp = null) {
    if (!typeStation || !Array.isArray(typeStation) || typeStation.length === 0) {
      this.typeStation = [
        {
          type: 'petrol',
          count: 1,
          speed: 5,
        },
      ];
    } else {
      this.typeStation = typeStation;
    }
    this.renderApp = renderApp;
    this.renderStation = null;
  }

  get filling() {
    return this.#filling;
  }

  get queue() {
    return this.#queue;
  }

  #createColumns() {
    for (const optionStation of this.typeStation) {
      this.#addColumnGroup(optionStation);
    }
  }

  #addColumnGroup(optionStation) {
    const count = optionStation.count || 1;
    const speed = optionStation.speed || 5;

    for (let i = 0; i < count; i++) {
      this.#filling.push(new Column(optionStation.type, speed));
    }
  }

  #initRender() {
    if (this.renderApp) {
      this.renderStation = new RenderStation(this.renderApp, this);
    }
  }

  #startIntervals() {
    setInterval(() => {
      this.checkQueueToFilling();
    }, 2000);
  }

  init() {
    this.#createColumns();
    this.#initRender();
    this.#startIntervals();
  }

  checkQueueToFilling() {
    if (this.#queue.length) {
      for (let i = 0; i < this.#queue.length; i++) {
        for (let j = 0; j < this.#filling.length; j++) {
          if (!this.#filling[j].car && this.#queue[i].typeFuel === this.#filling[j].type) {
            this.#filling[j].car = this.#queue.splice(i, 1)[0];
            this.fillingGo(this.#filling[j]);
            this.renderStation?.renderStation();
            break;
          }
        }
      }
    }
  }

  fillingGo(column) {
    const car = column.car;

    let nowTank = car.nowTank;
    const timerId = setInterval(() => {
      nowTank += column.speed;
      if (nowTank >= car.maxTank) {
        clearInterval(timerId);
        const total = nowTank - car.nowTank;
        car.fillUp();
        column.car = null;
        this.leaveClient({car, total});
      }
    }, 1000);
  }

  leaveClient({car, total}) {
    this.#ready.push(car);
    this.renderStation?.renderStation();
  }

  addCarQueue(car) {
    this.#queue.push(car);
    this.renderStation?.renderStation();
  }
}
