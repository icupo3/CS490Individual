import React, { useState, useEffect } from 'react';

export default function LandingPage() {
  const [top5RentedFilms, setTop5RentedFilms] = useState('<tr><td>Loading top 5 rented movies</td></tr>');
  const [description, setDescription] = useState('Loading Description');
  const [rating, setRating] = useState('Loading');
  const [releaseYear, setReleaseYear] = useState('Loading');
  const [runtime, setRuntime] = useState('Loading');
  const [movieDetailsVisible, setMovieDetailsVisible] = useState(false);
  const [actorTop5, setActorTop5] = useState('<tr><td>Loading top 5 actors</td></tr>');
  const [film1, setFilm1] = useState('Loading Movie');
  const [film2, setFilm2] = useState('Loading Movie');
  const [film3, setFilm3] = useState('Loading Movie');
  const [film4, setFilm4] = useState('Loading Movie');
  const [film5, setFilm5] = useState('Loading Movie');
  const [rentals1, setRentals1] = useState('Loading Rentals');
  const [rentals2, setRentals2] = useState('Loading Rentals');
  const [rentals3, setRentals3] = useState('Loading Rentals');
  const [rentals4, setRentals4] = useState('Loading Rentals');
  const [rentals5, setRentals5] = useState('Loading Rentals');
  const [actorDetailsVisible, setActorDetailsVisible] = useState(false);

  // Gets top 5 movies
  useEffect(() => {
    fetch('/top5movies').then(res => res.json()).then(data => {
      setTop5RentedFilms(data.top5movies);
    });
  }, []);

  // Gets top 5 actors
  useEffect(() => {
    fetch('/top5actors').then(res => res.json()).then(data => {
      setActorTop5(data.top5actors);
    });
  }, []);

  // Populates and shows movie details table
  const MovieDetailPopulator = (movie) => {
    setDescription('Loading Description');
    setRating('Loading');
    setReleaseYear('Loading');
    setRuntime('Loading');
    fetch(`/movieDetails?movie=${movie}`).then(res => res.json()).then(data => {
      setDescription(data.description);
      setRating(data.rating);
      setReleaseYear(data.releaseYear);
      setRuntime(data.runtime);
    });
    setMovieDetailsVisible(true);
  }
  
  // Passes movie name to movie details table 
  useEffect(() => {
    const handleClick = (event) => {
      if (event.target.matches('.movieDetailsGettable')) {
        MovieDetailPopulator(event.target.innerText);
      }
    };
    document.addEventListener('click', handleClick);
    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // Populates and shows actor details table
  const ActorDetailPopulator = (actor) => {
    setFilm1('Loading Movie');
    setFilm2('Loading Movie');
    setFilm3('Loading Movie');
    setFilm4('Loading Movie');
    setFilm5('Loading Movie');
    setRentals1('Loading Rentals');
    setRentals2('Loading Rentals');
    setRentals3('Loading Rentals');
    setRentals4('Loading Rentals');
    setRentals5('Loading Rentals');
    fetch(`/actorDetails?actor=${actor}`).then(res => res.json()).then(data => {
      setFilm1(data.film1);
      setFilm2(data.film2);
      setFilm3(data.film3);
      setFilm4(data.film4);
      setFilm5(data.film5);
      setRentals1(data.rentals1);
      setRentals2(data.rentals2);
      setRentals3(data.rentals3);
      setRentals4(data.rentals4);
      setRentals5(data.rentals5);
    });
    setActorDetailsVisible(true);
  }
    
  // Passes movie name to actor details table 
  useEffect(() => {
    const handleClick = (event) => {
      if (event.target.matches('.actorDetailsGettable')) {
        ActorDetailPopulator(event.target.innerText);
      }
    };
    document.addEventListener('click', handleClick);
    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, []);

  // The "HTML"
  return (
    <div>
      <table>
        <thead>
          <tr><td>Top 5 rented movies of all time</td></tr>
        </thead>
        <tbody dangerouslySetInnerHTML={{ __html: top5RentedFilms}}></tbody>
      </table>
      <p>&nbsp;</p>
      <table id='movieDetailsTable' style={{ visibility: movieDetailsVisible ? 'visible' : 'hidden' }}>
        <thead>
          <tr>
            <td className='quarter-width'>Release year: {releaseYear}</td>
            <td className='quarter-width'>Runtime: {runtime} min</td>
            <td className='quarter-width'>Rating: {rating}</td>
            <td className='quarter-width' onClick={() => setMovieDetailsVisible(false)}>Close Details</td>
          </tr>
        </thead>
        <tbody>
          <tr><td colSpan='4'>{description}</td></tr>
        </tbody>
      </table>
      <p>&nbsp;</p>
      <table>
        <thead>
          <tr><td>Top 5 actors</td></tr>
        </thead>
        <tbody dangerouslySetInnerHTML={{ __html: actorTop5}}></tbody>
      </table>
      <p>&nbsp;</p>
      <table id='actorDetailsTable' style={{ visibility: actorDetailsVisible ? 'visible' : 'hidden' }}>
        <thead>
        <tr>
          <td className='three-quarters-width' colSpan='2'>Top 5 rented movies of clicked actor(ress)</td>
          <td className='quarter-width' onClick={() => setActorDetailsVisible(false)}>Close Details</td>
        </tr>
          <tr>
            <td className='two-thirds-width'>Title</td>
            <td colSpan='2'>Rentals</td>
          </tr>
        </thead>
        <tbody>
        <tr>
            <td>{film1}</td>
            <td colSpan='2'>{rentals1}</td>
          </tr>
          <tr>
            <td>{film2}</td>
            <td colSpan='2'>{rentals2}</td>
          </tr>
          <tr>
            <td>{film3}</td>
            <td colSpan='2'>{rentals3}</td>
          </tr>
          <tr>
            <td>{film4}</td>
            <td colSpan='2'>{rentals4}</td>
          </tr>
          <tr>
            <td>{film5}</td>
            <td colSpan='2'>{rentals5}</td>
          </tr>
        </tbody>
      </table>
      <p>&nbsp;</p>
    </div>
  );
}