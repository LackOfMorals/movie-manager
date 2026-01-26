# Chapter 4: Updating Existing Data

With create functionality in place, let's add the ability to edit existing movies. You'll learn about mutation variables, conditional rendering, and updating the UI optimistically.

> It is assumed that you have a local copy of this repository.  If you have not, then clone it now
> - ```git clone https://github.com/LackOfMorals/movie-manager.git```
> 
> And then move into this chapter
> - ```cd movie-manager/chapter4```



## Add the Update Mutation

This time we need the GraphQL mutation to change an existing Movie rather than create a new one.  In `src/graphql/operations.ts` we find this:-

```typescript
// Add this after CREATE_MOVIE
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
```

This mutation updates an existing movie record. Here's what each part does:

### The variables

- ***$title:*** String! — Required, used to find the movie to update (the ! means it can't be null)
- ***$released:*** Int — Optional new release year
- ***$tagline:*** String — Optional new tagline

### The mutation itself
```graphql
updateMovies(
  where: {title: {eq: $title}}
  update: {tagline: {set: $tagline}, released: {set: $released}}
)
```
Two key parts here:

- ***where:*** A filter clause that finds which movie(s) to update. `{title: {eq: $title}}` means "where title equals this value". This targets movies by exact title match.
- ***update:*** Specifies what to change using set operations. This syntax `({set: $value})` is Neo4j GraphQL's way of handling updates — it's explicit about the operation type, which allows for other operations like increment on numbers or push on arrays.

### The return block
```graphql
movies {
  title
  released
  tagline
}
```
Returns the updated movie's fields so we can update the UI if needed e.g showing the user what has changed.  As with creating a new movie, we will need a TypeScript type  to store this response.  This is found in `/src/types/movie.ts` - `UpdateMovieResponse` 

### Something to watch for

We have used title as the unique identifier for a movie.  Beyond our sample data set, these are not necessarily unique.  Since `where` matches by title this could update multiple movies if duplicates exist. In production, you'd typically filter by a unique identifier (like an ID field) rather than title:

```graphql
where: {id: {eq: $id}}
```

Example usage:

```javascript
updateMovie({ 
  variables: { 
    title: "The Matrix",
    tagline: "Free your mind",
    released: 1999
  } 
});
```

This is also why our Movie Manager application does not allow an existing Movie Title to be changed.  To do so risks a collision with an existing one so we would need a mechanism to deal with it or use something different as a unique id. 

## The Movie Form

Our Movie form, `src/components/MovieForm.tsx` has been changed to allow for modification of an existing movie.   Let's examine those changes. 


### Two mutations, one form
```javascript
import { CREATE_MOVIE, UPDATE_MOVIE } from '../graphql/operations';
```

The component now imports both operations and sets up separate mutation hooks for each:
```javascript
const createMovieMutation = useMutation({
  mutationFn: async (data: MovieFormData) =>
    graphqlClient.request<CreateMovieResponse>(CREATE_MOVIE, data),
  // ...
});

const updateMovieMutation = useMutation({
  mutationFn: async (data: MovieFormData) =>
    graphqlClient.request<UpdateMovieResponse>(UPDATE_MOVIE, data),
  // ...
});
```

Each mutation has its own typed response (CreateMovieResponse vs UpdateMovieResponse) since the GraphQL responses have different shapes.

### Deciding which mutation to call
```javascript
const isEditing = !!movie;

// In handleSubmit:
if (isEditing) {
  updateMovieMutation.mutate(formData);
} else {
  createMovieMutation.mutate(formData);
}
```

The presence of an existing movie prop determines which GraphQL operation fires. Same form data structure, different mutations.

### Pre-filling for edits
```javascript
useEffect(() => {
  if (movie) {
    setFormData({
      title: movie.title,
      released: movie.released,
      tagline: movie.tagline
    });
  }
}, [movie]);
```

When editing, the existing movie data populates the form. This data originally came from a GraphQL query elsewhere in the app.

> Caution: `useEffect()` will fire when the object `movie` changes.  If `movie` gets updated elsewhere e.g a re-render happens and a new `movie` object is created, then `useEffect()` will run and wipe out any edits the user made.  It would be better to tie `useEffect()` to a field e.g `[movie?.id]`.  Just be careful. 


### Tracking combined pending state
```javascript
const isPending = createMovieMutation.isPending || updateMovieMutation.isPending;
```

Since only one mutation runs at a time, this combines both states for simpler UI logic.

### Title locked during edits
```javascript
disabled={isEditing}
```
Because UPDATE_MOVIE uses title in its where clause to find the record, changing it would break the update. The form prevents this by disabling the title field when editing — a UI constraint driven by how the GraphQL mutation is designed. 



## Test the Edit Functionality

Try editing a movie:

1. Find a movie in your list
2. Click the "Edit" button
3. Modify the release year or tagline
4. Click "Update Movie"
5. The movie list should refresh with your changes

> You can't edit the title - recall that  we're using the title as the unique identifier in our `where` clause.

## What You've Learned

✅ Writing update mutations with `where` clauses  
✅ Conditional component behavior (create vs edit)  
✅ Pre-filling forms with existing data  
✅ Disabling fields during editing  
✅ Managing UI state for different views  
✅ Combining multiple mutations in one component
✅ Consider how `useEffect()` is triggered

## Extras

Enhance the update functionality:

1. Add a confirmation message after successful updates
2. Implement "Cancel" that asks for confirmation if the form has changes
3. Fix the layout issue with the "Edit" button so that it's at the bottom of the card rather than immediately under the text.
4. What's the potential risk with the implementation of setFormData() within setEffect()  ?


**Next**: [Chapter 5: Delete Data](../chapter5/TUTORIAL_CHAPTER5.md)

---
