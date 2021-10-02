import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import SpreadsheetFiles from '@salesforce/resourceUrl/jspreadsheet';
import JsuitesFlies from '@salesforce/resourceUrl/jsuites';

import getListView from '@salesforce/apex/ProductViewer.getListView';
import getProducts from '@salesforce/apex/ProductViewer.getProducts';

export default class Productviewer extends LightningElement {

  /**
   * @type {boolean} initialized 初期化済みかどうかを表す
   */
  initialized = false;

  /**
   * jspreadsheet obj
   * initializeUIで設定する
   */
  spreadsheet = null;

  /**
   * 読込中のクルクル表示用
   * @type {boolean} loading
   */
  @track
  loading = false;


  /**
   * @type {{label:string, value:string}[]} - 商品情報のリストビューで使用する選択肢
   */
  @track
  productListView = [];

  @wire(getListView)
  wiredProductListView({error, data}) {
    console.log('wired');
    console.log(data);
    console.log(error);
    if (data) {
      console.log('update4');
      console.log(data);
      this.productListView = data.map(rec => {
        return {
          label: rec.label,
          value: rec.id
        };
      });
    } else if (error) {
      console.log('dated');
      console.log(error);
    }
  }
  
  /**
   * 
   * @param {Object[]} data - Apexからの戻り値
   * @param {String} data[].Id - 商品レコードのId
   * @param {String} data[].Name - 商品名
   * @param {String} data[].ProductCode - 商品コード
   * @param {String} data[].StockKeepingUnit - SKU
   * @return {Array<Array<String>>}
   */
  unwrap(data) {
    return data.map(p => {
      return [
        p.Id,
        p.Name,
        p.ProductCode,
        p.StockKeepingUnit
      ];
    });
  }

  handleListview(event) {
    this.loading = true;
    const filterId = event.detail.value;
    getProducts({filterId: filterId})
      .then(result => {
        this.spreadsheet.setData(this.unwrap(result));
      })
      .catch(error => {
        console.log(error);
      })
      .finally(onFinally => {
        this.loading = false;
      });
  }

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
    const ss = this.template.querySelector('.here');

    this.spreadsheet = jspreadsheet(ss, {
      data: [],
      columns: [
        { type: 'text', title: 'Id', width: 120 },
        { type: 'text', title: '商品名', width: 120},
        { type: 'text', title: '商品コード', width: 120},
        { type: 'text', title: 'SKU', width: 120},
      ]
    });
  }
}
