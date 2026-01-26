# Chapter 6: Manage Relationships

The real power of a graph database lies in relationships. In this chapter, we will look at how to connect movies with actors and directors, and manage these relationships dynamically.

> It is assumed that you have a local copy of this repository.  If you have not, then clone it now
> - ```git clone https://github.com/LackOfMorals/movie-manager.git```
> 
> And then move into this chapter
> - ```cd movie-manager/chapter6```

## Understanding Graph Relationships

In Neo4j, relationships connect nodes and have:
- A **type** (e.g., ACTED_IN, DIRECTED)
- A **direction** (from one node to another)
- Optional **properties** (e.g., roles: ["Neo"])

In GraphQL, we manage relationships using `connect` and `disconnect` operations:

```graphql
# Connect an actor to a movie
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
```

- **Filter** for a particular movie `where: { title: { eq: $movieTitle } }`
- We link a movie with an actor by updating **peopleActedIn**  using `where: { node: { name: { eq: $actorName } } }`
- Like any other **mutation**, we always return fields; the movie and the name of the actor


## Disconnect an actor from a movie
The GraphQL statement to remove an actor from a movie is very similar to that used to assign them.  This time we use **disconnect**

```graphql
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
```


- We **find** the actor by using `where: { node: { name: { eq: $actorName } } }`

## Understanding Connect vs Disconnect

The `connect` operation creates a relationship:
- Finds the specified nodes (movie and person)
- Creates a relationship between them
- Doesn't fail if the relationship already exists

The `disconnect` operation removes a relationship:
- Finds the specified nodes
- Removes the relationship between them
- Leaves both nodes in the database


## Relationship Mutations

In `src/graphql/operations.ts` there are four mutations to allow for the addition and removal of actors and directors 

- ASSIGN_ACTOR
- ASSIGN_DIRECTOR
- REMOVE_ACTOR
- REMOVE_DIRECTOR

We already looked at the GraphQL for managing actors relationships and you may expect directors are dealt with in an identical fashion.  And they _almost_ are. 

You may have expected connecting a director would contain `edge: { roles: "director" }` as we connect an actor with `edge: { roles: "actor" }`.  In our Neo4j Graph, the relationship `ACTED_IN` has a property `roles` .  In our application, to keep things simple,  we're setting this to be `actor` rather than capture the actual role they played in the movie and use that.

## Relationship Manager Component

`src/components/RelationshipManager.tsx` is our component for managing relationships with use of a common pattern for managing GraphQL mutations alongside queries in a React application.

### Four mutations for relationship operations
```javascript
import { 
  ASSIGN_ACTOR, 
  REMOVE_ACTOR, 
  ASSIGN_DIRECTOR, 
  REMOVE_DIRECTOR,
  GET_PEOPLE 
} from '../graphql/operations';
```


Each relationship type (actor, director) needs separate add/remove mutations. This is typical for graph databases where relationships are first-class citizens.

### Fetching available people
```javascript
const { data: peopleData, isLoading: peopleLoading } = useQuery({
  queryKey: ['people'],
  queryFn: async () =>
    graphqlClient.request<GetPeopleResponse>(GET_PEOPLE, { limit: 200 })
});
A query populates the dropdown with people who can be assigned. This runs independently of the mutations.
Parallel mutation setup
javascriptconst assignActorMutation = useMutation({
  mutationFn: async (variables: { movieTitle: string; actorName: string }) =>
    graphqlClient.request(ASSIGN_ACTOR, variables),
  // ...
});

const assignDirectorMutation = useMutation({
  mutationFn: async (variables: { movieTitle: string; directorName: string }) =>
    graphqlClient.request(ASSIGN_DIRECTOR, variables),
  // ...
});
```

Each mutation has slightly different variable shapes — actors use actorName, directors use directorName. This matches how the underlying GraphQL mutations are defined (connecting to different relationship types in the schema).

### Conditional mutation dispatch

```javascript
const handleAssign = () => {
  if (relationType === 'actor') {
    assignActorMutation.mutate({
      movieTitle: movie.title,
      actorName: selectedPerson
    });
  } else {
    assignDirectorMutation.mutate({
      movieTitle: movie.title,
      directorName: selectedPerson
    });
  }
};
```

The UI uses a single "Add" button, but dispatches to different GraphQL mutations based on the selected relationship type.
Same pattern for removals

```javascript
const handleRemove = (personName: string, type: 'actor' | 'director') => {
  if (type === 'actor') {
    removeActorMutation.mutate({
      movieTitle: movie.title,
      actorName: personName
    });
  } else {
    removeDirectorMutation.mutate({
      movieTitle: movie.title,
      directorName: personName
    });
  }
};
```

### Cache invalidation triggers list refresh
```javascripton
Success: () => {
  queryClient.invalidateQueries({ queryKey: ['movies'] });
  onComplete();
}
```

All four mutations invalidate the ['movies'] query on success. This ensures the movie list (which includes peopleActedIn and peopleDirected data) refetches with the updated relationships.

### Client-side duplicate prevention
```javascript
if (relationType === 'actor' && movie.peopleActedIn?.some(a => a.name === selectedPerson)) {
  alert('This person is already an actor in this movie');
  return;
}
```
This checks existing relationship data (from the original GraphQL query) before firing the mutation — avoiding unnecessary API calls for relationships that already exist.


## Test Relationship Management

Try managing relationships:

1. Click "Manage Cast" on any movie
2. View current actors and directors
3. Select a role type (actor or director)
4. Choose a person from the dropdown
5. Click "Add actor" or "Add director"
6. Try removing people from the movie
7. Click "Done" and see the updated movie card


## What You've Learned

✅ Managing relationships in a graph database  
✅ Using GraphQL `connect` and `disconnect` operations  
✅ Building complex UI for relationship management  
✅ Preventing duplicate relationships  
✅ Working with nested mutations  
✅ Filtering available options based on existing data

## Extra

Enhance relationship management:

1. Add relationship properties (e.g., roles for actors)
2. Create a dedicated "People" view to manage all people

**Next**: [Chapter 7: Search and Filter](/chapter7/TUTORIAL_CHAPTER7.md)


---

