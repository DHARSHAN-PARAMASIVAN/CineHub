import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */

/**
 * Parse "DD/MM/YY" or "D/M/YY" date strings from the dataset.
 * Expands 2-digit years: 95 → 1995, 96 → 1996, etc.
 */
function parseMovieDate(rawDate) {
  if (!rawDate) return null;
  const parts = rawDate.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  const fullYear = year < 100 ? 1900 + year : year;
  return new Date(fullYear, month - 1, day);
}

/**
 * Format a raw date string using the browser's locale.
 */
function formatDate(rawDate) {
  const date = parseMovieDate(rawDate);
  if (!date || isNaN(date.getTime())) return rawDate || '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Render star rating (5 stars max = vote_average / 2).
 */
function RatingStars({ score }) {
  const filled = Math.round(score / 2);
  return (
    <div className="detail-rating-stars" aria-label={`${score} out of 10`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ opacity: s <= filled ? 1 : 0.25 }} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   MovieCard component
───────────────────────────────────────────── */
function MovieCard({ movie, onClick }) {
  return (
    <article
      className="movie-card"
      onClick={() => onClick(movie.id)}
      id={`movie-card-${movie.id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(movie.id)}
      aria-label={`View details for ${movie.title}`}
    >
      <h2 className="movie-card-title">{movie.title}</h2>

      <p className="movie-card-tagline">
        {movie.tagline ? `"${movie.tagline}"` : <span style={{ opacity: 0 }}>—</span>}
      </p>

      <div className="movie-card-footer">
        <div className="rating-badge">
          <span className="rating-star" role="img" aria-label="star">★</span>
          <span>
            {movie.vote_average.toFixed(1)}
            <span style={{ fontWeight: 500, opacity: 0.65 }}> / 10</span>
          </span>
        </div>
        <span className="card-arrow" aria-hidden="true">→</span>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────
   Movies List Page
───────────────────────────────────────────── */
function MoviesListPage({ onSelectMovie }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const res = await fetch('/api/movies');
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const payload = await res.json();
        setMovies(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, []);

  const filteredMovies = search.trim()
    ? movies.filter(
        (m) =>
          m.title.toLowerCase().includes(search.toLowerCase()) ||
          (m.tagline && m.tagline.toLowerCase().includes(search.toLowerCase()))
      )
    : movies;

  const totalItems = filteredMovies.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Keep currentPage in valid range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedMovies = filteredMovies.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" role="status" aria-label="Loading"></div>
        <p className="loading-text">Loading movie records…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-icon">
          <span role="img" aria-label="warning">⚠️</span>
        </div>
        <h2>Could not load records</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Page header */}
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Movie Library</h1>
            <p>Browse and discover movies — click any title to view full details</p>
          </div>
          <div className="page-header-meta">
            <span className="meta-chip">
              <span role="img" aria-label="movies" aria-hidden="true">🎬</span>
              {movies.length.toLocaleString()} Titles
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-bar">
          <span className="search-icon" role="img" aria-label="search">🔍</span>
          <input
            id="movie-search"
            type="search"
            placeholder="Search by title or tagline…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Search movie records"
          />
        </div>
        <div className="toolbar-controls">
          <div className="entries-control">
            <label htmlFor="items-per-page">Show</label>
            <select
              id="items-per-page"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              aria-label="Number of entries to show per page"
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
            <span>entries</span>
          </div>
          <span className="results-count">
            Showing <strong>{totalItems > 0 ? startIndex + 1 : 0}</strong> to <strong>{endIndex}</strong> of <strong>{totalItems}</strong> records
            {search && <> matching <em>"{search}"</em></>}
          </span>
        </div>
      </div>

      {/* Grid */}
      {paginatedMovies.length === 0 ? (
        <div className="error-state">
          <div className="error-icon">
            <span role="img" aria-label="no results">📂</span>
          </div>
          <h2>No records found</h2>
          <p>Try adjusting your search term</p>
        </div>
      ) : (
        <>
          <div className="movies-grid" role="list" aria-label="Movie records">
            {paginatedMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} onClick={onSelectMovie} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="pagination-wrapper" aria-label="Pagination Navigation">
              <button
                className="pagination-btn arrow-btn"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                ← Prev
              </button>
              
              <div className="pagination-pages">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(page)}
                    aria-label={`Go to page ${page}`}
                    aria-current={currentPage === page ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn arrow-btn"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                Next →
              </button>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Movie Detail Page
───────────────────────────────────────────── */
function MovieDetailPage({ movieId, onBack }) {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovie() {
      try {
        const res = await fetch(`/api/movies/${movieId}`);
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const payload = await res.json();
        setMovie(payload.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [movieId]);

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner" role="status" aria-label="Loading"></div>
        <p className="loading-text">Retrieving record…</p>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="error-state">
        <div className="error-icon">
          <span role="img" aria-label="warning">⚠️</span>
        </div>
        <h2>Record not found</h2>
        <p>{error || 'The requested movie could not be loaded.'}</p>
        <button className="back-btn" onClick={onBack} style={{ margin: '1.5rem auto 0' }}>
          ← Back to Movies
        </button>
      </div>
    );
  }

  const formattedDate = formatDate(movie.release_date);
  const runtimeHours = Math.floor(movie.runtime / 60);
  const runtimeMins = movie.runtime % 60;
  const runtimeDisplay = runtimeHours > 0
    ? `${runtimeHours}h ${runtimeMins}m (${movie.runtime} min)`
    : `${movie.runtime} min`;

  const dateObj = parseMovieDate(movie.release_date);
  const releaseYear = dateObj && !isNaN(dateObj.getTime()) ? dateObj.getFullYear() : '';

  return (
    <div className="detail-page fade-in">

      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <span
          className="breadcrumb-link"
          onClick={onBack}
          role="link"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onBack()}
        >
          Movie Library
        </span>
        <span className="breadcrumb-sep" aria-hidden="true">›</span>
        <span className="breadcrumb-current">{movie.title}</span>
      </nav>

      {/* Back button */}
      <button
        className="back-btn"
        onClick={onBack}
        id="btn-back-to-list"
        aria-label="Back to movie list"
      >
        ← Back to Movies
      </button>

      {/* Hero Card */}
      <div className="detail-hero">
        <div className="detail-hero-accent-bar" aria-hidden="true"></div>
        <div className="detail-hero-body">

          {/* Badges */}
          <div className="detail-badge-row">
            <span className="status-badge">
              <span className="status-dot" aria-hidden="true"></span>
              {movie.status || 'Released'}
            </span>
            {releaseYear && <span className="year-badge">{releaseYear}</span>}
            <span className="id-badge">Record ID: {movie.id}</span>
          </div>

          {/* Title */}
          <h1 className="detail-title">{movie.title}</h1>

          {movie.original_title && movie.original_title !== movie.title && (
            <p className="detail-original-title">
              Original Title: <em>{movie.original_title}</em>
            </p>
          )}

          {/* Tagline */}
          {movie.tagline && (
            <blockquote className="detail-tagline">"{movie.tagline}"</blockquote>
          )}

          {/* Rating */}
          <div className="detail-rating-row">
            <span className="detail-rating-score">{movie.vote_average.toFixed(1)}</span>
            <span className="detail-rating-max">/10</span>
            <RatingStars score={movie.vote_average} />
            <span className="detail-rating-count">
              ({movie.vote_count?.toLocaleString()} votes)
            </span>
          </div>

        </div>
      </div>

      {/* Info Grid */}
      <div className="detail-info-grid">
        <div className="info-card">
          <span className="info-card-icon" role="img" aria-label="calendar">📅</span>
          <span className="info-card-label">Release Date</span>
          <span className="info-card-value">{formattedDate}</span>
        </div>
        <div className="info-card">
          <span className="info-card-icon" role="img" aria-label="clock">⏱️</span>
          <span className="info-card-label">Runtime</span>
          <span className="info-card-value">{runtimeDisplay}</span>
        </div>
        <div className="info-card">
          <span className="info-card-icon" role="img" aria-label="star">⭐</span>
          <span className="info-card-label">Vote Average</span>
          <span className="info-card-value">{movie.vote_average.toFixed(1)} / 10</span>
        </div>
        <div className="info-card">
          <span className="info-card-icon" role="img" aria-label="poll">📊</span>
          <span className="info-card-label">Total Votes</span>
          <span className="info-card-value">{movie.vote_count?.toLocaleString()}</span>
        </div>
        <div className="info-card">
          <span className="info-card-icon" role="img" aria-label="status">📋</span>
          <span className="info-card-label">Status</span>
          <span className="info-card-value">{movie.status || '—'}</span>
        </div>
        <div className="info-card">
          <span className="info-card-icon" role="img" aria-label="id">🔖</span>
          <span className="info-card-label">Record ID</span>
          <span className="info-card-value">#{movie.id}</span>
        </div>
      </div>

      {/* Overview */}
      {movie.overview && (
        <div className="overview-section">
          <h2 className="section-heading">Synopsis / Overview</h2>
          <p className="overview-text">{movie.overview}</p>
        </div>
      )}

    </div>
  );
}

/* ─────────────────────────────────────────────
   App Root
───────────────────────────────────────────── */
function App() {
  const [selectedMovieId, setSelectedMovieId] = useState(null);

  const handleSelectMovie = useCallback((id) => setSelectedMovieId(id), []);
  const handleBack = useCallback(() => setSelectedMovieId(null), []);

  return (
    <div className="app">

      {/* Navigation */}
      <nav className="navbar" aria-label="Main navigation">
        <div className="navbar-inner">
          <div
            className="navbar-brand"
            onClick={handleBack}
            id="navbar-brand"
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleBack()}
            aria-label="Go to movie list"
          >
            <div className="navbar-text-group">
              <span className="navbar-title">CineHub</span>
              <span className="navbar-subtitle">Movie Explorer</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="main" id="main-content">
        {selectedMovieId === null ? (
          <MoviesListPage onSelectMovie={handleSelectMovie} />
        ) : (
          <MovieDetailPage movieId={selectedMovieId} onBack={handleBack} />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span className="footer-text">
            CineHub &copy; {new Date().getFullYear()}
          </span>
          <span className="footer-text">
            Data sourced from movies metadata catalogue
          </span>
        </div>
      </footer>

    </div>
  );
}

export default App;
