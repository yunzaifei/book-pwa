import React, { Component } from 'react';
import './App.css';

class BookItem extends Component {
  /*constructor(props) {
    super(props);
  }*/

  render() {
    return (
      <div className="App-item">
        <img src={ this.props.book.img } alt=""/>
        <span>{ this.props.book.name }</span>
      </div>
    );
  }
}

export default BookItem;
