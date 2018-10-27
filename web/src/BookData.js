import Axios from 'axios';
Axios.defaults.baseURL = 'http://127.0.0.1:8000';
var db;

class BookData {

  constructor() {
    let request = window.indexedDB.open('books');
    request.onsuccess = (event) => {
      db = request.result;
    };
    request.onerror = function(event) {
      console.error('open indexeddb error!');
    };
    request.onupgradeneeded = (event) => {
      db = event.target.result;
      if (!db.objectStoreNames.contains('list')) {
        let objectStore = db.createObjectStore('list', { keyPath: 'id' });
        objectStore.createIndex('id', 'id', { unique: true });
      }
      if (!db.objectStoreNames.contains('contents')) {
        let objectStore = db.createObjectStore('contents', { keyPath: 'id' });
        objectStore.createIndex('id', 'id', { unique: true });
      }
    }
  }

  _getBooks(callback) {
    Axios.get('/books')
    .then(res => {
      console.log('res', res.data);
      if(callback){
        callback(res.data);
      }
      this._setIndexedDB(res.data, 'list');
    })
  }

  _getContents(bookID, cIndex, callback) {
    Axios.get('/contents', { params: { bookId: bookID, index: cIndex } })
    .then(res => {
      console.log('res', res.data);
      if(callback){
        callback(res.data[0]);
      }
      this._setIndexedDB(res.data, 'contents');
    })
  }

  _getMenu(bookID, callback) {
    Axios.get('/contents', { params: { bookId: bookID, _embed: 'content' } })
    .then(res => {
      //console.log('res', res.data);
      let data = [];
      for(let d of res.data){
        data.push(d.title);
      }
      if(callback){
        callback(data);
      }
      this._setBookMenu(data, bookID);
    })
  }

  _setIndexedDB(data, storeName) {
    let store = db.transaction([storeName], 'readwrite').objectStore(storeName);
    for(let d of data){
      let request;
      let oldv = store.get(d.id);
      if(oldv){
        request = store.put(d);
        if(storeName === 'list'){
          this._getMenu(d.id);
        }
      }else{
        request = store.add(d);
      }

      request.onsuccess = function (event) {
        console.log('数据写入成功');
      };
      request.onerror = function (event) {
        console.log('数据写入失败');
      }
    }
  }

  _setBookMenu(data, bookID) {
    let store = db.transaction(['list'], 'readwrite').objectStore('list');
    let request = store.get(bookID);

    request.onsuccess = function (event) {
      let oldv = request.result;
      oldv.menu = data;
      let u_request = store.put(oldv);
      u_request.onsuccess = function (event) {
        console.log('目录写入成功');
      }
      u_request.onerror = function (event) {
        console.log('目录写入失败');
      }
    };
  }

  getBookList(callback) {
    setTimeout(()=>{
      let data = [];
      db.transaction('list').objectStore('list').openCursor().onsuccess = (event) => {
        var cursor = event.target.result;
        //console.log('cursor', cursor);
        if(cursor){
          data.push(cursor.value);
          cursor.continue();
        }else{
          if(data.length === 0){
            this._getBooks(callback);
          }else{
            callback(data);
            this._getBooks();
          }
        }
      }
    }, 500);
  }

  getContent(bookID, cIndex, callback) {
    setTimeout(() => {
      let dbID = bookID + '_' + cIndex;
      db.transaction('contents').objectStore('contents').get(dbID).onsuccess = (event) => {
        let data = event.target.result;
        //console.log('data', data);
        if(data){
          callback(data);
          //this._getContents(bookID, cIndex);
        }else{
          this._getContents(bookID, cIndex, callback);
        }
      }
    }, 500);
  }

  getBookMenu(bookID, callback) {
    setTimeout(()=>{
      bookID = parseInt(bookID);
      db.transaction('list').objectStore('list').get(bookID).onsuccess = (event) => {
        var data = event.target.result;
        if(!data.menu || data.menu.length === 0){
          this._getMenu(bookID, callback);
        }else{
          callback(data.menu);
        }
      }
    }, 500);
  }

}

export default BookData
