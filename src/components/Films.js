import React, { useState, useEffect, useRef } from 'react';


export default function FilmsPage() {
    
    const [pageNo, setPageNo] = useState(1);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('filmName');
    const [filmsTable, setFilmsTable] = useState([{ 'title': 'Loading Data', 'genre': 'Loading Data' }]);
    const [maxPage, setmaxPage] = useState(1);
    const [actorsCol, setActorsCol] = useState(false);
    const [movieDesc, setMovieDesc] = useState("");
    const [rating, setRating] = useState("");
    const [releaseYear, setReleaseYear] = useState("");
    const [specFeats, setSpecFeats] = useState("");
    const [copies, setCopies] = useState("");
    const [invIDs, setInvIDs] = useState("");
    const [movieDetailsVisible, setMovieDetailsVisible] = useState(false);
    const [currentFilm, setCurrentFilm] = useState('');
    const formRef = useRef();
    
    const Dropdown = () => {
  
        const handleChange = (event) => {
          setFilter(event.target.value);
          FilmsPopulator(query, pageNo, event.target.value);
        };
      
        return (
          <div>
            <label htmlFor="dropdown">Search By: </label>
            <select id="dropdown" value={filter} onChange={handleChange}>
              <option value="filmName">Film Name</option>
              <option value="actor">Actor Name</option>
              <option value="genre">Genre</option>
            </select>
            {/* {filter && <p>You selected: {filter}</p>} */}
          </div>
        );
    };

    const handleMaxIncrement = () => {
        if(pageNo != maxPage){
            setPageNo(maxPage);
            FilmsPopulator(query, maxPage, filter);
        }
    };

    const handleIncrement = () => {
        if(pageNo < maxPage){
            FilmsPopulator(query, pageNo + 1, filter);
            setPageNo(prevCount => prevCount + 1);
        }
    };

    const handleDecrement = () => {
        if(pageNo > 1){
            FilmsPopulator(query, pageNo - 1, filter);
            setPageNo(prevCount => prevCount - 1);
        }
    };

    const handleMinDecrement = () => {
        if(pageNo != 1){
            setPageNo(1);
            FilmsPopulator(query, 1, filter);
        }
    };

    const handleInputChange = (event) => {
        const hotfix = event.target.value;
        setQuery(hotfix);
        setPageNo(1);
        FilmsPopulator(event.target.value, 1, filter);
    };

    const handleTitle = (event) => {
        if(event.target.innerText != "Title"){
            setCurrentFilm(event.target.innerText);
            setMovieDesc("Loading");
            setRating("Loading");
            setReleaseYear("Loading");
            setSpecFeats("Loading");
            setCopies("Loading");
            setInvIDs("Loading");
            fetch(`/moreMovieDetails?movie=${event.target.innerText}`).then(res => res.json()).then(data => {
                setMovieDesc(data.description);
                setRating(data.rating);
                setReleaseYear(data.releaseYear);
                setSpecFeats(data.specFeat);
                setCopies(data.copies);
                setInvIDs(data.invIds.join(', '));
            });
            setMovieDetailsVisible(true);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(formRef.current);
        fetch(`/rentToCustomer?custID=${formData.get('custIDBox')}&movie=${currentFilm}`).then(res => res.json()).then(data => {
            alert(data.status);
        });
    };


    // Populates and shows movie details table
    const FilmsPopulator = (search, page, filter) => {
        setFilmsTable([{ 'title': 'Loading Data', 'genre': 'Loading Data' }]);
        fetch(`/filmsList?search=${search}&page=${page}&filter=${filter}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then((jsonData) => {
            setFilmsTable(jsonData.filmsList);
            setmaxPage(jsonData.pageCount);
            setActorsCol(jsonData.actorsVisibility);
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
            setFilmsTable([{ 'title': 'Error Loading Data', 'genre': `${error}` }]);
            setActorsCol(false);
          });
    }

    // populate table and shit yk
    useEffect(() => {
        FilmsPopulator(query, pageNo, filter);
    }, []);

    // The "HTML"
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <td colSpan='5'> <Dropdown />
                        <input
                            type="text"
                            id="filmSearch"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search..."
                            />
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {filmsTable.map((item, index) => (
                        <tr key={index}>
                        <td onClick={handleTitle} className='third-width'>{item.title}</td>
                        <td className='third-width'>{item.genre}</td>
                        <td style={{ display: actorsCol ? 'block' : 'none' }}>{item.actorName}</td>
                    </tr>
                    ))}
                </tbody>
            </table>
            <table>
                <tbody>
                    <tr>
                        <td className='fifth-width' onClick={handleMinDecrement}>
                            <p>|&lt;</p>
                        </td>
                        <td className='fifth-width' onClick={handleDecrement}>
                            <p>&lt;</p>
                        </td>
                        <td className='fifth-width'>
                            {pageNo}
                        </td>
                        <td className='fifth-width' onClick={handleIncrement}>
                            <p>&gt;</p>
                        </td>
                        <td className='fifth-width' onClick={handleMaxIncrement}>
                            <p>&gt;|</p>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p>&nbsp;</p>
            <table style={{ visibility: movieDetailsVisible ? 'visible' : 'hidden' }}>
                <tbody>
                    <tr>
                        <td className='half-width'>
                            <form ref={formRef} onSubmit={handleSubmit}>
                            <label for="custIDBox">Rent to:&nbsp;</label>
                            <input type="number" id="custIDBox" name="custIDBox" placeholder="Customer ID" required />&nbsp;
                            <input type="submit" value="Submit"></input>
                            </form>
                        </td>
                        <td className='half-width' onClick={() => setMovieDetailsVisible(false)}>Close Details</td>
                    </tr>
                    <tr>
                        <td colSpan='2'>
                            Description: {movieDesc}<br/>
                            Rating: {rating}<br/>
                            Release Year: {releaseYear}<br/>
                            Special Features: {specFeats}<br/>
                            Copies available: {copies}<br/>
                            Store IDs: {invIDs}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}