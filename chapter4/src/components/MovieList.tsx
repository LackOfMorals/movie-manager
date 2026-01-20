import { useQuery } from '@tanstack/react-query';
import { graphqlClient } from '../lib/graphql-client';
import { GET_MOVIES } from '../graphql/operations';
import type { Movie } from '../types/movie';


interface GetMoviesResponse {
  movies: Movie[];
}

interface MovieListProps {
  onEdit: (movie: Movie) => void;  // Callback to handle editing
}

export function MovieList({ onEdit }: MovieListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['movies'],
    queryFn: async () => 
      graphqlClient.request<GetMoviesResponse>(GET_MOVIES)
  });

  if (isLoading) return <div className="text-center py-8">Loading movies...</div>;
  if (error) return <div className="text-center py-8 text-red-600">Error: {error.message}</div>;

  if (!data?.movies.length) {
    return <div className="text-center py-8 text-red-600">No movies found</div>;
  }

return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Movies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div>
              <button 
                onClick={() => onEdit(movie)}
                className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-6 font-medium text-neutral-50 transition active:scale-110 ">
              edit
              </button>
            </div>
          </div>
        ))
        }
      </div>
    </div>
  );
}