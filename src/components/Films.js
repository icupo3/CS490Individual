import React, { useState, useEffect } from 'react';


export default function FilmsPage() {
    
    const [pageNo, setPageNo] = useState(1);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('filmName');
    const [filmsTable, setFilmsTable] = useState('Loading');
    const [maxPage, setmaxPage] = useState(1);
    
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
        // console.log(event.target.value);
        setQuery(hotfix);
        FilmsPopulator(event.target.value, pageNo, filter);
    };

    // Populates and shows movie details table
    const FilmsPopulator = (search, page, filter) => {
        setFilmsTable('<tr><td colSpan="5">Loading Films</td></tr>');
        fetch(`/filmsList?search=${search}&page=${page}&filter=${filter}`).then(res => res.json()).then(data => {
            setFilmsTable(data.filmsList);
            setmaxPage(data.pageCount);
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
                        <td className='half-width' colSpan='5'> <Dropdown />
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
                <tbody dangerouslySetInnerHTML={{ __html: filmsTable}}></tbody>
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

        </div>
    );
}