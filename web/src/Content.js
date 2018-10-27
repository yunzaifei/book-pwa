import React, { Component } from 'react';
import queryString from 'query-string';
import BookData from './BookData';
import './App.css';

class Content extends Component {
  constructor(props) {
    super(props);
    let bookID = this.props.match.params.id;
    let bd = new BookData();
    this.state = { bookID: bookID, bd: bd, book: { title: '', content: [] }, dayStyle: true };
    if(window.location.search){
      let query = queryString.parse(window.location.search);
      let index = query.index;
      this.setIndex(index);
    }
    this.getData();
  }

  getData = () => {
    this.state.bd.getContent(this.state.bookID, this.getIndex(), (data)=>{
      if(data){
        this.setState({ book: data });
      }else{
        alert('已经是最新章节！');
        this.goPrevious();
      }
    });
  }

  goBookPage = () => {
    this.props.history.push('/');
  }

  goMenuPage = () => {
    this.props.history.push('/menu/' + this.state.bookID);
  }

  getIndex = () => {
    let bookID = this.state.bookID;
    let read = localStorage.getItem('read');
    if(read){
      read = JSON.parse(read);
      if(read[bookID]){
        return read[bookID];
      }else{
        this.setIndex(0);
        return 0;
      }
    }else{
      this.setIndex(0);
      return 0;
    }
  }

  setIndex = (index) => {
    let bookID = this.state.bookID;
    let read = localStorage.getItem('read');
    if(read){
      read = JSON.parse(read);
      read[bookID] = index;
    }else{
      read = {};
      read[bookID] = index;
    }
    localStorage.setItem('read', JSON.stringify(read));
  }

  goPrevious = () => {
    let index = parseInt(this.getIndex());
    if(index > 0){
      this.setIndex(index-1);
      this.getData();
    }
    window.scroll(0, 0);
  }

  goNext = () => {
    let index = parseInt(this.getIndex());
    this.setIndex(index+1);
    this.getData();
    window.scroll(0, 0);
  }

  changeDayStyle = () => {
    this.setState({ dayStyle: !this.state.dayStyle });
  }

  saveAll = () => {
    this.state.bd.getContent(this.state.bookID);
  }

  render() {
    return (
      <div>
        <div className={ this.state.dayStyle? 'Content': 'Content night'}>
          <div className='Content-title'>
            <span className='title'>{ this.state.book.title }</span>
            <span className='return' onClick={ this.goBookPage }>返回</span>
          </div>
          {
            this.state.book.content.map((p, i) => {
              return ( <p className='Content-item' key={i}>{ p }</p> );
            })
          }
        </div>
        <div className={ this.state.dayStyle? 'Content-menu': 'Content-menu night-menu'}>
          <span onClick={ this.changeDayStyle }>{ this.state.dayStyle? '白天': '夜晚'}</span>
          <span onClick={ this.goMenuPage }>目录</span>
          <span onClick={ this.saveAll }>缓存</span>
          <span onClick={ this.goPrevious }>上一章</span>
          <span onClick={ this.goNext }>下一章</span>
        </div>
      </div>
    );
  }
}

export default Content;
