import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import BookData from './BookData';

class BookMenu extends Component {
  constructor(props) {
    super(props);
    let bookID = this.props.match.params.id;
    let bd = new BookData();
    this.state = { bookID: bookID, bd: bd, menus: [] };
    bd.getBookMenu(bookID, (data) => {
      this.setState({ menus: data });
    });
  }

  componentDidUpdate() {
    let bookID = this.state.bookID;
    let read = localStorage.getItem('read');
    if(read){
      read = JSON.parse(read);
      let index = read[bookID];
      if(index !== undefined){
        let div = document.querySelector('#menu_' + index);
        div.scrollIntoView(false);
      }
    }
  }

  render() {
    return (
      <div className="Menu">
        {
          this.state.menus.map((m, i) => {
            return (
              <div id={ 'menu_' + i } className="Menu-item" key={i}>
                <Link to={'/content/' + this.state.bookID +'?index=' + i }>{ m }</Link>
              </div>
            );
          })
        }
      </div>
    )
  }
}

export default BookMenu
