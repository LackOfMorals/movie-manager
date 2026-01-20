import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { GET_MOVIES, DELETE_MOVIE } from '../graphql/operations';
import type { Movie } from '../types/movie';


interface GetMoviesResponse {
  movies: Movie[];
}

interface DeleteMovieResponse {
  deleteMovies: {
    nodesDeleted: number;
    relationshipsDeleted: number;
  };
}

interface MovieListProps {
  onEdit: (movie: Movie) => void;
  onManage: (movie: Movie) => void;
}


export function MovieList({ onEdit, onManage }: MovieListProps) {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => 
      graphqlClient.request<GetMoviesResponse>(GET_MOVIES)
  });


  const deleteMovieMutation = useMutation({
    mutationFn: async (title: string) =>
      graphqlClient.request<DeleteMovieResponse>(DELETE_MOVIE, { title }),
    onSuccess: (data) => {
      // Show confirmation of what was deleted
      const { nodesDeleted, relationshipsDeleted } = data.deleteMovies;
      console.log(
        `Deleted ${nodesDeleted} movie(s) and ${relationshipsDeleted} relationship(s)`
      );
      
      // Refresh the movie list
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (error) => {
      alert(`Failed to delete movie: ${error.message}`);
    }
  });


  const handleDelete = (movie: Movie) => {
    // Get confirmation before deleting
    const confirmed = window.confirm(
      `Are you sure you want to delete "${movie.title}"?\n\n` +
      `This will also remove all relationships to actors and directors.`
    );


    if (confirmed) {
      deleteMovieMutation.mutate(movie.title);
    }
  };

if (isLoading) return <div className="text-center py-8">Loading movies...</div>;
if (error) return <div className="text-center py-8 text-red-600">Error: {error.message}</div>;


return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Movies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.movies.map((movie) => (
          <div key={movie.title} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
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
            <div className="mt-auto flex gap-3 justify-center">
              <button 
                onClick={() => onEdit(movie)}
                className="px-6 inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 font-medium text-neutral-50 transition active:scale-110"
                >
              edit
              </button>
              <button 
                onClick={() => onManage(movie)}
                className=" px-6 inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 font-medium text-neutral-50 transition active:scale-110"
                >
              manage
              </button>
              <button 
                onClick={() => handleDelete(movie)}
                className=" px-6 inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 font-medium text-neutral-50 transition active:scale-110"
                disabled={deleteMovieMutation.isPending}
              >
              {deleteMovieMutation.isPending && deleteMovieMutation.variables === movie.title ?'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ))
        }
      </div>
    </div>
  );
}