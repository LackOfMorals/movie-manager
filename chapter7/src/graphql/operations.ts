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


// Add a query to get all people
export const GET_PEOPLE = gql`
  query GetPeople {
    people {
      name
      born
    }
  }
`;




// Relationship management mutations
export const ASSIGN_ACTOR = gql`
mutation AssignActor($movieTitle: String!, $actorName: String!) {
  updateMovies(
    where: { title: { eq: $movieTitle } }
    update: {
      peopleActedIn: {
        connect: {
          edge: { roles: "actor" }
          where: { node: { name: { eq: $actorName } } }
        }
      }
    }
  ) {
    movies {
      title
      peopleActedIn {
        name
      }
    }
  }
}
`;




export const REMOVE_ACTOR = gql`
mutation RemoveActor($movieTitle: String!, $actorName: String!) {
  updateMovies(
    where: { title: { eq: $movieTitle } }
    update: {
      peopleActedIn: {
        disconnect: {
          where: { node: { name: { eq: $actorName } } }
        }
      }
    }
  ) {
    movies {
      title
      peopleActedIn {
        name
      }
    }
  }
}
`;


export const ASSIGN_DIRECTOR = gql`
mutation AssignDirector($movieTitle: String!, $directorName: String!) {
  updateMovies(
    where: { title: { eq: $movieTitle } }
    update: {
      peopleDirected: {
        connect: { where: { node: { name: { eq: $directorName } } } }
      }
    }
  ) {
    movies {
      title
      peopleDirected {
        name
      }
    }
  }
}
`;


export const REMOVE_DIRECTOR = gql`
  mutation RemoveDirector($movieTitle: String!, $directorName: String!) {
    updateMovies(
    where: { title: { eq: $movieTitle } }
    update: {
      peopleDirected: {
        disconnect: {
          where: { node: { name: { eq: $directorName } } }
        }
      }
    }
  ) {
      movies {
        title
        peopleDirected {
          name
        }
      }
    }
  }
`;

export const SEARCH_ALL = gql`
  query SearchAll($searchTerm: String!) {
  movies(
    where: {
      OR: [
        { title: { contains: $searchTerm } },
        { tagline: { contains: $searchTerm } }
      ]
    }
    sort: { released: ASC }
  ) {
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
