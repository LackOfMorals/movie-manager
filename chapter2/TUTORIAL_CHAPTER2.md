# Chapter 2: Read Data from Neo4j

Now that your environment is set up, let's fetch and display movie data from your Neo4j database. In this chapter, you'll learn how to write GraphQL queries and display the results in your application.


> It is assumed that you have a local copy of this repository.  If you have not, then clone it now
> - ```git clone https://github.com/LackOfMorals/movie-manager.git```
> 
> And then move into this chapter
> - ```cd movie-manager/chapter2```


## Understanding GraphQL Queries

GraphQL is a query language that lets you request exactly the data you need. Unlike REST APIs where you get fixed data structures, GraphQL lets you specify:

- Which **fields** you want
- How **deep** to traverse relationships
- What **filters** to apply

Here's a simple example:

```graphql
query {
  movies {
    title
    released
  }
}
```

This query asks for all movies, but only retrieves the `title` and `released` fields for each.

Let's now set up our React application to support GraphQL 

## The GraphQL Client

In ```src/lib/graphql-client.ts``` you will see this

```typescript
import { GraphQLClient } from 'graphql-request';

export const graphqlClient = new GraphQLClient(
  import.meta.env.VITE_NEO4J_GRAPHQL_URL,
  {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": `${import.meta.env.VITE_NEO4J_GRAPHQL_TOKEN}`,
    },
  }
);
```

We are using GraphQLClient from graphql-request, a simple & lightweight GraphQL client, to work with the Neo4j GraphQL DataAPI.  There are others available , such as Apollo Client and Strawberry Shake from Chilli Cream.    

If you are looking for more information for graphql-request, now known as Graffle, you can find it here [Graffle website](https://graffle.js.org/)

You will notice that our headers do not contain an authorization key / value pair.  This is because the Neo4j DataAPI GraphQL endpoint expects to have a header key  **x-api-key** that contains an API Key for authentication. This is found in the download file from creating the DataAPI GraphQL endpoint. 


## React Query

To use GraphQLClient for GraphQL queries and mutations, we will use react-query from [Tanstack](https://tanstack.com/query/latest).  This is a popular tool that provides a number of capabilities that we will use throughout this project. Of particular interest is the ability to invalidate the results of a query causing the query to be run again.  We will take advantage of this to refresh the page after making a change.  

You can see how React Query fits in by looking at this code snip from ```src/main.tsx```



```typescript

// The queryclient from tanstack
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Wrapper around our Application
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>,
);
```


## Define Your Type Definitions

As we are using TypeScript, we will need to define types that match our data structure. 

In ```src/types/movie.ts``` we see two types, one for Person and another for Movie. 


```typescript
export interface Person {
  name: string;
  born?: number;
}

export interface Movie {
  title: string;
  released?: number;
  tagline?: string;
  peopleActedIn?: Person[];
  peopleDirected?: Person[];
}
```
Compare to the two types in the GraphQL schema from Chapter 1

```graphql
type Movie @node {
    peopleActedIn: [Person!]! @relationship(type: "ACTED_IN", direction: IN, properties: "ActedInProperties")
    peopleDirected: [Person!]! @relationship(type: "DIRECTED", direction: IN)
    peopleProduced: [Person!]! @relationship(type: "PRODUCED", direction: IN)
    peopleReviewed: [Person!]! @relationship(type: "REVIEWED", direction: IN, properties: "ReviewedProperties")
    peopleWrote: [Person!]! @relationship(type: "WROTE", direction: IN)
    released: Int!
    tagline: String
    title: String!
}

type Person @node {
    actedInMovies: [Movie!]! @relationship(type: "ACTED_IN", direction: OUT, properties: "ActedInProperties")
    born: Int
    directedMovies: [Movie!]! @relationship(type: "DIRECTED", direction: OUT)
    followsPeople: [Person!]! @relationship(type: "FOLLOWS", direction: OUT)
    name: String!
    peopleFollows: [Person!]! @relationship(type: "FOLLOWS", direction: IN)
    producedMovies: [Movie!]! @relationship(type: "PRODUCED", direction: OUT)
    reviewedMovies: [Movie!]! @relationship(type: "REVIEWED", direction: OUT, properties: "ReviewedProperties")
    wroteMovies: [Movie!]! @relationship(type: "WROTE", direction: OUT)
}
```
You can see that they are similar - the properties are almost identical.  Because of this, there are tools that will generate types for use with TypeScript , from a GraphQL schema. 


## Getting a list of movies

```src/graphql/operations.ts``` holds our first GraphQL query. 

```typescript
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
```

Let's break down what this query does:

- **`query GetMovies`**: Names the query for debugging
- **Fields like `title`, `released`, `tagline`**: Specifies exactly which data to fetch
- **peopleActedIn and peopleDirected**: Specifies the relationship between a Movie and its actors and directors and what fields to obtain. 

Executing this query results in a JSON document that will hold each movie, who acted in it and the directors. 

Now we need to show this in the Web Application.

## Movie List Component

Like a lot of React applications, a component is used to show the movie list. 

In ```src/components/MovieList.tsx``` the query will be run 


```typescript
export function MovieList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => 
      graphqlClient.request<GetMoviesResponse>(GET_MOVIES)
  });
```

The results are held in ```data.movie``` and are shown by taking advantage of  ```.map```

```typescript
        {data.movies.map((movie) => (
          <div key={movie.title} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{movie.title}</h3>
            <p className="text-gray-600 mb-1">{movie.released}</p>
            {movie.tagline && ( <p className="text-gray-700 mb-4 italic">{movie.tagline}</p> )}
            
            {movie.peopleActedIn && movie.peopleActedIn?.length > 0 && (
              <div className="text-gray-700">
                <strong>Cast:</strong>
                <span className="text-gray-600" >  {movie.peopleActedIn?.map(a => a.name).join(', ')}</span>
              </div>
            )}
            
            {movie.peopleDirected && movie.peopleDirected?.length > 0  && (
              <div className="text-gray-700">
                <strong>Directed by:</strong>
                <span className="text-gray-600">  {movie.peopleDirected.map(d => d.name).join(', ')}</span>
              </div>
            )}
```
You will notice that there are checks, ```.length > 0 ```, to show  actors or directors if they exist rather than having a blank space. 



### More on useQuery()

The `useQuery` hook does several things:

- **`queryKey`**: A unique identifier for this query (enables caching)
- **`queryFn`**: The function that fetches the data
- **Automatic states**: Provides `isLoading`, `error`, and `data` states
- **Automatic caching**: Results are cached for efficient re-fetching ( this is what we invalidate to refresh the page after the data has been changed )
- **Background updates**: Can refresh data automatically



## Showing the Movies - App component

Making use of this new component is achieved by wiring it up into ```/src/App.tsx```.  

```typescript
import { MovieList } from './components/MovieList';
import './App.css';

function App() {
  return (
    <div className="app">
      <header>
        <h1>🎬 Movie Manager</h1>
      </header>
      <main>
        <MovieList />
      </main>
    </div>
  );
}

export default App;
```

## Try it

Your application should now display movies from your Neo4j database! 

Enter `npm run dev` and then open `http://localhost:5173` in your browser.

You should see:
- A list of movies sorted by release date
- Each movie showing its title, year, tagline
- Cast and director information
- A clean, card-based layout

## What You've Learned

✅ How to write basic GraphQL queries  
✅ Fetching data with React Query  
✅ Traversing relationships in a graph database  
✅ Handling loading and error states  
✅ Displaying nested data from related entities


## Extras

Before moving on, try modifying the query to filter the result

1. Return only the Matrix series
2. Show only the Movies directed by Rob Reiner



You will find the [Neo4j GraphQL library reference on Filtering ](https://neo4j.com/docs/graphql/current/filtering/) useful for this

**Next**: [Chapter 3: Create New Data](../chapter3/TUTORIAL_CHAPTER3.md)

---
