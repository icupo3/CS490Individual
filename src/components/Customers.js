import React, { useState, useEffect } from 'react';

export default function CustomersPage() {

    const [pageNo, setPageNo] = useState(1);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('firstName');
    const [customersTable, setCustomersTable] = useState('Loading');
    const [maxPage, setmaxPage] = useState(1);

    const Dropdown = () => {
  
        const handleChange = (event) => {
          setFilter(event.target.value);
          CustomerPopulator(query, pageNo, event.target.value);
        };
      
        return (
          <div>
            <label htmlFor="dropdown">Search By: </label>
            <select id="dropdown" value={filter} onChange={handleChange}>
              <option value="firstName">First Name</option>
              <option value="lastName">Last Name</option>
              <option value="ID">ID</option>
            </select>
            {/* {filter && <p>You selected: {filter}</p>} */}
          </div>
        );
    };

    const handleMaxIncrement = () => {
        if(pageNo != maxPage){
            setPageNo(maxPage);
            CustomerPopulator(query, maxPage, filter);
        }
    };

    const handleIncrement = () => {
        if(pageNo < maxPage){
            CustomerPopulator(query, pageNo + 1, filter);
            setPageNo(prevCount => prevCount + 1);
        }
    };

    const handleDecrement = () => {
        if(pageNo > 1){
            CustomerPopulator(query, pageNo - 1, filter);
            setPageNo(prevCount => prevCount - 1);
        }
    };

    const handleMinDecrement = () => {
        if(pageNo != 1){
            setPageNo(1);
            CustomerPopulator(query, 1, filter);
        }
    };

    const handleInputChange = (event) => {
        const hotfix = event.target.value;
        setQuery(hotfix);
        CustomerPopulator(event.target.value, pageNo, filter);
    };

    // Populates and shows movie details table
    const CustomerPopulator = (search, page, filter) => {
        setCustomersTable('<tr><td colSpan="5">Loading Customers</td></tr>');
        fetch(`/customersList?search=${search}&page=${page}&filter=${filter}`).then(res => res.json()).then(data => {
            setCustomersTable(data.customersList);
            setmaxPage(data.pageCount);
        });
    }

    // populate table and shit yk
    useEffect(() => {
        CustomerPopulator(query, pageNo, filter);
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
                            id="customerSearch"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search..."
                            />
                        </td>
                    </tr>
                </thead>
                <tbody dangerouslySetInnerHTML={{ __html: customersTable}}></tbody>
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