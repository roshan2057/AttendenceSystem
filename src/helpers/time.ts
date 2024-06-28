import { adToBs } from "@sbmdkl/nepali-date-converter";

export class TimeCalculate {
  static async getTime(): Promise<string> {
    const nepalTime = this.getNepalTime();

    let hours: number | string = nepalTime.getHours();
    let minutes: number | string = nepalTime.getMinutes();
    let seconds: number | string = nepalTime.getSeconds();

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return `${hours}:${minutes}:${seconds}`;
  }

  static getNepalTime(): Date {
    const utcTime = new Date();
    const nepalTime = new Date(utcTime.getTime() + 5.75 * 60 * 60 * 1000);
    return nepalTime;
  }

  static async getDate(): Promise<string> {
    const nepalTime = this.getNepalTime();

    let year: number | string = nepalTime.getFullYear();
    let month: number | string = nepalTime.getMonth() + 1;
    let day: number | string = nepalTime.getDate();

    month = month < 10 ? "0" + month : month;
    day = day < 10 ? "0" + day : day;
    const convertedDate = adToBs(`${year}-${month}-${day}`).toString();
    return convertedDate;
  }
}
