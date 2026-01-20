import { useState } from 'react';
import { MovieList } from './components/MovieList';
import { MovieForm } from './components/MovieForm';
import './App.css';

function App() {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');

  const [selectedMovie, setSelectedMovie] = useState<Movie | undefined>();

  const handleEdit = (movie: Movie) => {
    setSelectedMovie(movie);
    setView('edit');
  };

  const handleComplete = () => {
    setView('list');
    setSelectedMovie(undefined);
  };

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-8 pb-6 border-b-2 border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900">🎬 Movie Manager</h1>
        <nav className="flex gap-3">
          <button 
            onClick={() => setView('list')}
            className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-6 font-medium text-neutral-50 transition active:scale-110 "
          >
            Movies
          </button>
          <button 
            onClick={() => setView('create')}
            className="inline-flex h-12 items-center justify-center rounded-md bg-neutral-950 px-6 font-medium text-neutral-50 transition active:scale-110 "
          >
            Add Movie
          </button>
        </nav>
      </header>
      
      <main>
        {view === 'list' && <MovieList onEdit={handleEdit} />}
        {view === 'create' && (
          <MovieForm onComplete={handleComplete} />
        )}
        {view === 'edit' && selectedMovie && (
          <MovieForm movie={selectedMovie} onComplete={handleComplete} />
        )}
      </main>
    </div>
  </div>
  );
}

export default App;


