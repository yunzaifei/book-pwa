import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Home from './Home';
import Content from './Content';
import BookMenu from './BookMenu';

class App extends Component {
  render() {
    return(
      <main>
        <Route path='/' exact component={ Home } />
        <Route path='/content/:id' component= { Content } />
        <Route path='/menu/:id' component= { BookMenu } />
      </main>
    );
  }
}


export default App;
