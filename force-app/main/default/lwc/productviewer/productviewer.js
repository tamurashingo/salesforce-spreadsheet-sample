import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import SpreadsheetFiles from '@salesforce/resourceUrl/jspreadsheet';
import JsuitesFlies from '@salesforce/resourceUrl/jsuites';

export default class Productviewer extends LightningElement {

  /**
   * @type {boolean} initialized 初期化済みかどうかを表す
   */
  initialized = false;


  /**
   * @type {Array} data サンプルデータ
   */
  data = [
    ['Jazz', 'Honda', '2019-02-12', '', true, '$ 2.000,00', '#777700'],
    ['Civic', 'Honda', '2018-07-11', '', true, '$ 4.000,01', '#007777'],
  ];

  renderedCallback() {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    Promise.all([
      loadScript(this, SpreadsheetFiles + '/index.js'),
      loadStyle(this, SpreadsheetFiles + '/jspreadsheet.css'),
      loadScript(this, JsuitesFlies + '/jsuites.js'),
      loadStyle(this, JsuitesFlies + '/jsuites.css'),
    ]).then(() => {
      this.initializeUI();
    }).catch(error => {
      console.log(error);
      this.dispatchEvent(
        new ShowToastEvent({
          title: 'Error Loading Spreadsheet Library',
          message: 'error',
          variant: 'error'
        })
      )
    });
  }

  /**
   * UIの構築
   */
  initializeUI() {
    const ss = this.template.querySelector('div');

    jspreadsheet(ss, {
      data: this.data,
      columns: [
        { type: 'text', title: 'Car', width: 120 },
        { type: 'dropdown', title:'Make', width:200, source:[ "Alfa Romeo", "Audi", "Bmw" ] },
        { type: 'calendar', title:'Available', width:200 },
        { type: 'image', title:'Photo', width:120 },
        { type: 'checkbox', title:'Stock', width:80 },
        { type: 'numeric', title:'Price', width:100, mask:'$ #.##,00', decimal:',' },
        { type: 'color', width:100, render:'square', },
      ]
    });
  }
}