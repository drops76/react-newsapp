import React, { Component } from 'react';
import { Grid, Row } from 'react-bootstrap';

import { 
  DEFAULT_QUERY, DEFAULT_PAGE, DEFAULT_HPP, PATH_BASE, PATH_SEARCH, 
  PARAM_SEARCH, PARAM_PAGE, PARAM_HPP 
} from '../../constants';

import Table from '../Table';
import { Button, Loading } from '../Button';
import Search from '../Search';

//const url = `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${DEFAULT_QUERY}`;
//console.log(url);



// filter the results by search
// function isSearched(searchTerm) {
//   return function(item) {
//     return !searchTerm || item.title.toLowerCase().includes(searchTerm.toLowerCase());
//   }
// } 

//higher order component
const withLoading = (Component) => (isLoading, ...rest) => 
  isLoading ? <Loading /> : <Component {...rest} />

const updateTopStories = (hits, page) => prevState => {
  const { searchKey, results } = prevState;
  const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
  const updatedHits = [...oldHits, ...hits];

  return { results: { ...results, [searchKey]: { hits: updatedHits, page } },
  isLoading: false };
}

class Javascript extends Component {

  constructor(props) {
    super(props);

    //setting up state
    this.state = {
      results: null,      //ES6, object initializer, zamiast pisać: list: list, można tylko list
      searchKey: '',
      searchTerm: 'Javascript',
      isLoading: false,
      
    }

    //bind the functions to this (app component)
    this.removeItem = this.removeItem.bind(this);
    this.searchValue = this.searchValue.bind(this);
    this.fetchTopStories = this.fetchTopStories.bind(this);
    this.setTopStories = this.setTopStories.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
   
  }




  checkTopStoriesSearchTerm(searchTerm) {
    return !this.state.results[searchTerm];
  }

  //set top stories
  setTopStories(result) {
    const { hits, page } = result;
    
    this.setState(updateTopStories(hits, page));

  }

  // fetch data from api
  fetchTopStories(searchTerm, page) {

    this.setState({ isLoading: true });

    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
    .then(response => response.json())
    .then(result => this.setTopStories(result))
    .catch(e => e);
  }

  //component did mount
  componentDidMount() {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });
    this.fetchTopStories(searchTerm, DEFAULT_PAGE);
  }

  // on search submit function
  onSubmit(event) {
    const { searchTerm } = this.state;
    this.setState({ searchKey: searchTerm });

    if (this.checkTopStoriesSearchTerm(searchTerm)) {
      this.fetchTopStories(searchTerm, DEFAULT_PAGE);
    }

    event.preventDefault();
  }

  removeItem(id) {
    const { results, searchKey } = this.state;
    const { hits, page } = results[searchKey];
    //const isNotId = item => item.objectID !== id;
    const updatedList = hits.filter(item => item.objectID !== id);
    //this.setState({ result: Object.assign({}, this.state.result, {hits: updatedList}) });   //tworzy nowy obiekt, w ktorym ustawia hits
    this.setState({ results: {...results, [searchKey] : { hits: updatedList, page } } });   //spread operator
  }

  searchValue(event) {
    this.setState({ searchTerm: event.target.value });
  }

  render() {

    const { results, searchTerm, searchKey, isLoading } = this.state;  // deconstructing: zamiast uzywac this.state.list uzywam list, analogicznie this.state.searchTerm

    //if(!result) { return null; }

    const page = (results && results[searchKey] && results[searchKey].page) || 0;

    const list = (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div>
        
      <Grid>
        <Row>
          <Table 
            list = { list }
            removeItem = { this.removeItem }
          /> 

          <div className="text-center alert">
            
            <ButtonWithLoading 
              isLoading = { isLoading }
              className="btn btn-success" 
              onClick={ () => this.fetchTopStories(searchTerm, page + 1)}>
              Load more
            </ButtonWithLoading>
            
          </div>
        </Row>
      </Grid>
      </div>
    );
  }
}

const ButtonWithLoading = withLoading(Button);

export default Javascript;
