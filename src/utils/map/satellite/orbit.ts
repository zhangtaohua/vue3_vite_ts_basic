import { twoline2satrec, sgp4, propagate, gstime, eciToGeodetic, degreesLong, degreesLat } from "satellite.js";

import {
  getGeoPointFromLongitudeLatitude,
  getTwoDimArrayFromLngLatObj,
  getGeoLineFromArray,
  calibratePosions,
} from "../geoCommon";

export default class SatelliteOrbit {
  public satrec: any = null;
  public minsPerInterval = 0;
  public __tleLine1 = "";
  public __tleLine2 = "";

  constructor(tleLine1: string, tleLine2: string) {
    this.updateTLE(tleLine1, tleLine2);
  }

  public destructor() {
    this.__tleLine1 = "";
    this.__tleLine2 = "";
    this.minsPerInterval = 0;
    this.satrec = null;
  }

  public updateTLE(tleLine1: string, tleLine2: string) {
    this.__tleLine1 = tleLine1;
    this.__tleLine2 = tleLine2;
    this.satrec = twoline2satrec(tleLine1, tleLine2);
    // const totalIntervalsInDay = this.satrec.no * 1440 * 0.159155; // 1440 = min && 0.159155 = 1turn
    // const minsPerInterval = 1440 / totalIntervalsInDay;
    this.minsPerInterval = 1 / (this.satrec.no * 0.159155);
  }

  public getCurrentPosition(currentTime: any) {
    const positionAndVelocity = propagate(this.satrec, currentTime);
    const gmst = gstime(new Date(currentTime));
    const positionEci = positionAndVelocity.position;
    const positionGd = eciToGeodetic(positionEci, gmst);

    const longitude = positionGd.longitude;
    const latitude = positionGd.latitude;
    const height = positionGd.height;

    const longitudeDeg = degreesLong(longitude);
    const latitudeDeg = degreesLat(latitude);

    return {
      longitude: longitudeDeg,
      latitude: latitudeDeg,
      altitude: height,
    };
  }

  public getOneCircle(startTime: any, intervalInMilliSeconds = 1000) {
    this.getOrbitByNumbers(startTime, this.minsPerInterval, intervalInMilliSeconds);
  }

  public getOrbitByNumbers(startTime: any, numbers: number, intervalInMilliSeconds = 1000) {
    const positions = [];
    const startTimeNow = new Date(startTime).getTime();
    for (let i = 0; i <= numbers; i++) {
      const currentTime = new Date(startTimeNow + i * intervalInMilliSeconds);
      const lngLatObj = this.getCurrentPosition(currentTime);
      positions.push(lngLatObj);
    }
    return positions;
  }

  public getOrbitDatas(startTime: any, endTime: any, intervalInMilliSeconds = 1000) {
    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();
    if (end > start) {
      const numbers = Math.ceil((end - start) / intervalInMilliSeconds);
      return this.getOrbitByNumbers(startTime, numbers, intervalInMilliSeconds);
    } else {
      return [];
    }
  }

  public getOrbitGeojson(startTime: any, endTime: any, intervalInMilliSeconds = 1000, isCalibrate = true) {
    const positions = this.getOrbitDatas(startTime, endTime, intervalInMilliSeconds);
    let positionNew = null;
    if (isCalibrate) {
      positionNew = calibratePosions(positions);
    }
    const twoDimArray = getTwoDimArrayFromLngLatObj(positionNew);
    const geojsonData = getGeoLineFromArray(twoDimArray);
    return {
      geojson: geojsonData,
      positions: positions,
    };
  }

  public getCurrenPositionGeojson(startTime: any) {
    const start = new Date(startTime);
    const lngLatObj = this.getCurrentPosition(start);
    const geojsonData = getGeoPointFromLongitudeLatitude(lngLatObj.longitude, lngLatObj.latitude);
    return {
      geojson: geojsonData,
      position: lngLatObj,
    };
  }
}
