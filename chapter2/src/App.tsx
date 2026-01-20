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

