import React, { Component } from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import BookData from './BookData';
import BookItem from './BookItem';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { books: [] };
    let bd = new BookData();
    bd.getBookList((data) => {
      this.setState({ books: data });
    });

    /*BookData.getBooks((data) => {
      this.setState({ books: data });
    })*/
  }

  render() {
    return(
      <div className="App">
        { this.state.books.map(book => {
            return (
              <Link to={{ pathname: '/content/' + book.id }} key={book.id}>
                <BookItem book={ book }/>
              </Link>
            );
          })
        }
      </div>
    );
  }
}

export default Home;
