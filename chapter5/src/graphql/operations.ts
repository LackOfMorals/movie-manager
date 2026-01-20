import { gql } from 'graphql-request';


export const GET_MOVIES = gql`
  query GetMovies {
    movies {
      title
      released
      tagline
      peopleActedIn {
        name
        born
      }
      peopleDirected {
        name
        born
      }
    }
  }
`;


export const CREATE_MOVIE = gql`
  mutation CreateMovie($title: String!, $released: Int!, $tagline: String) {
    createMovies(
      input: [{ 
        title: $title, 
        released: $released, 
        tagline: $tagline 
      }]
    ) {
      movies {
        title
        released
        tagline
      }
    }
  }
`;

export const CREATE_PERSON = gql`
  mutation CreatePerson($name: String!, $born: Int) {
    createPeople(
      input: [{ 
        name: $name, 
        born: $born 
      }]
    ) {
      people {
        name
        born
      }
    }
  }
`;

export const UPDATE_MOVIE = gql`
  mutation UpdateMovie($title: String!, $released: Int, $tagline: String) {
     updateMovies(
      where: {title: {eq: $title}}
      update: {tagline: {set: $tagline}, released: {set: $released}}
  ){
      movies {
        title
        released
        tagline
      }
    }
  }
`;


export const DELETE_MOVIE = gql`
  mutation DeleteMovie($title: String!) {
  deleteMovies(where: { title: { eq: $title } }) {
    nodesDeleted
  }
}
`;


