# Chapter 5: Delete Data

Let's add the ability to remove movies from the database. You'll learn about delete mutations and implementing user confirmations to prevent accidental deletions.

> It is assumed that you have a local copy of this repository.  If you have not, then clone it now
> - ```git clone https://github.com/LackOfMorals/movie-manager.git```
> 
> And then move into this chapter
> - ```cd movie-manager/chapter5```

## Understanding Graph Deletions

When you delete a movie node in Neo4j:

1. The movie node itself is removed
2. All relationships connected to that movie are also removed
3. But the Person nodes (actors/directors) remain in the database

This is a key feature of graph databases - you can remove a node and its connections without affecting other nodes in the graph.

For example, if you delete "The Matrix", you remove:
- The Matrix movie node
- Relationships: Keanu Reeves ACTED_IN The Matrix
- Relationships: The Wachowskis DIRECTED The Matrix

But Keanu Reeves and The Wachowskis still exist in the database.


## The Delete Mutation

This time we need the GraphQL mutation to delete an existing Movie.   In `src/graphql/operations.ts` we find this:- 

```typescript
export const DELETE_MOVIE = gql`
  mutation DeleteMovie($title: String!) {
  deleteMovies(where: { title: { eq: $title } }) {
    nodesDeleted
  }
}
`;
```

This mutation deletes a movie record. Let's look at what each part does:

### The variable

- ***$title:*** String! — Required, used to find the movie to delete

### The mutation itself
```graphql
deleteMovies(where: { title: { eq: $title } })
```
Uses the same where filter pattern as the update mutation — it finds movies where the title exactly matches the provided value, then deletes them.

Since where matches by title, this would delete all movies with that title if duplicates exist. In Chapter 4 we discussed the use of title as a unique ID and how it would be better to use something else for production applications. 

### The return block
`nodesDeleted`

Instead of returning the deleted movie's fields (which no longer exist), this returns a count of how many records were removed.  Useful for confirming the deletion worked and for UI feedback like "1 movie deleted."

With create and update mutations, you return the affected record's fields to update the UI cache. With delete, the record is gone — so `nodesDeleted` gives just enough information to confirm success and trigger a refetch of the movie list. 

This mutation:
- Uses a `where` clause to find the movie by title
- Returns `nodesDeleted` (number of nodes removed).  Recall that you always have to return _something_ after a mutation. 


### A Delete Button
`src/components/MovieList.tsx` contains our delete functionality

```javascript
const deleteMovieMutation = useMutation({
  mutationFn: async (title: string) =>
    graphqlClient.request<DeleteMovieResponse>(DELETE_MOVIE, { title }),
  // ...
});
```

Unlike the create/update mutations that pass a full formData object, delete just needs the title string. It gets wrapped into `{ title }` to match the mutation's expected variables.

### Using the response data
```javascript
onSuccess: (data) => {
  const { nodesDeleted, relationshipsDeleted } = data.deleteMovies;
  console.log(
    `Deleted ${nodesDeleted} movie(s) and ${relationshipsDeleted} relationship(s)`
  );
  
  queryClient.invalidateQueries({ queryKey: ['movies'] });
}
```
The GraphQL response includes both nodesDeleted and relationshipsDeleted — Neo4j GraphQL automatically reports how many relationships (like actor and director connections) were cleaned up when the movie node was removed. This is useful for logging, debugging, or showing the user what happened.

### Triggering the delete

```javascript
const handleDelete = (movie: Movie) => {
  const confirmed = window.confirm(/* ... */);
  
  if (confirmed) {
    deleteMovieMutation.mutate(movie.title);
  }
};
```

The mutation takes just the title string directly — simpler than create/update since there's no other data to pass.

### Tracking which item is being deleted

```javascript
disabled={deleteMovieMutation.isPending}
// ...
{deleteMovieMutation.isPending && deleteMovieMutation.variables === movie.title 
  ? 'Deleting...' 
  : 'Delete'}
```
Since we're rendering multiple delete buttons (one per movie), we need to prevent all of the movies' "Delete" buttons changing to "Deleting..." as this may cause a small degree of alarm.  To only show "Deleting..." for the movies being deleted, we use the values from deleteMovieMutation.variables. We can do this as TanStack Query stores the variables from the most recent mutate() call, letting you identify which record is being processed. 


## Test the Delete Functionality

Try deleting a movie:

1. Find a movie you created earlier (don't delete the classic movies!)
2. Click "Delete"
3. Confirm the deletion in the dialog
4. The movie should disappear from the list


## What You've Learned

✅ Writing delete mutations in GraphQL  
✅ Understanding node and relationship deletion in graphs  
✅ Implementing user confirmations  
✅ Handling delete mutation states  
✅ Providing user feedback during operations  
✅ Managing optimistic UI updates

## Extra

Enhance the delete functionality:

1. Implement the custom ConfirmDialog component from above
2. Show a success message after deletion
3. Add the ability to delete multiple movies at once (batch deletion)


**Next**: [Chapter 6: Manage Relationships](../chapter6/TUTORIAL_CHAPTER6.md)

---
