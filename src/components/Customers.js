import React, { useState, useEffect, useRef } from 'react';

export default function CustomersPage() {

    const [pageNo, setPageNo] = useState(1);
    const [query, setQuery] = useState('');
    const [filter, setFilter] = useState('firstName');
    const [customersTable, setCustomersTable] = useState([{ 'custID': 'Loading Data', 'custName': 'Loading Data' }]);
    const [historyTable, setHistoryTable] = useState([{ 'title': 'Loading Data', 'rentDate': 'Loading Data', 'returnDate': 'Loading Data' }]);
    const [maxPage, setmaxPage] = useState(1);
    const [bottomTableVisible, setBottomTableVisible] = useState(false);
    const [addBodyVisible, setAddBodyVisible] = useState(false);
    const [editBodyVisible, setEditBodyVisible] = useState(false);
    const [viewRentalsVisible, setViewRentalsVisible] = useState(false);
    const [secondBoxLabel, setSecondBoxLabel] = useState('');
    const [editCustID, setEditCustID] = useState(-1);
    const addFormRef = useRef();
    const editFormRef = useRef();

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
        setPageNo(1);
        CustomerPopulator(event.target.value, 1, filter);
    };

    const handleAddCustomer = () => {
        setSecondBoxLabel('Add Customer');
        setBottomTableVisible(true);
        setAddBodyVisible(true);
        setEditBodyVisible(false);
        setViewRentalsVisible(false);
    };

    const handleAddSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(addFormRef.current);
        if(!(formData.get('firstName') && formData.get('lastName') && formData.get('address') && formData.get('city') && formData.get('stateDistrict') && formData.get('country') && formData.get('phoneNumber'))){
            alert("Please fill in all required textboxes for the form.");
        }
        else{   
            fetch(
                `/addEditCustomer?mode=add&fName=${formData.get('firstName')}&lName=${formData.get('lastName')}&email=${formData.get('email')}&addy=${formData.get('address')}&addy2=${formData.get('address2')}&city=${formData.get('city')}&state=${formData.get('stateDistrict')}&country=${formData.get('country')}&zip=${formData.get('postalCode')}&phoneNum=${formData.get('phoneNumber')}`
            ).then(res => res.json()).then(data => {
                alert(data.response);
            });
        }
    };

    const handleEdit = (custID) => {
        if(custID != 'Customer ID'){
            setEditCustID(custID);
            setSecondBoxLabel('Edit Customer: ' + custID);
            setBottomTableVisible(true);
            setEditBodyVisible(true);
            setAddBodyVisible(false);
            setViewRentalsVisible(false);
        }
    };

    const handleEditSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData(editFormRef.current);
        if(!(formData.get('firstName') && formData.get('lastName') && formData.get('address') && formData.get('city') && formData.get('stateDistrict') && formData.get('country') && formData.get('phoneNumber').length === 10)){
            alert("Please fill in all required textboxes for the form.");
        }
        else{   
            fetch(
                `/addEditCustomer?mode=edit&custID=${editCustID}&fName=${formData.get('firstName')}&lName=${formData.get('lastName')}&email=${formData.get('email')}&addy=${formData.get('address')}&addy2=${formData.get('address2')}&city=${formData.get('city')}&state=${formData.get('stateDistrict')}&country=${formData.get('country')}&zip=${formData.get('postalCode')}&phoneNum=${formData.get('phoneNumber')}`
            ).then(res => res.json()).then(data => {
                alert(data.response);
            });
        }
    };

    const handleHistory = (custID) => {
        if(custID != 'Customer ID'){
            setSecondBoxLabel(`Customer ${custID}s History (Click Nones to mark as returned)`);
            setBottomTableVisible(true);
            setViewRentalsVisible(true);
            setAddBodyVisible(false);
            setEditBodyVisible(false);
            setHistoryTable([{ 'title': 'Loading Data', 'rentDate': 'Loading Data', 'returnDate': 'Loading Data' }]);
            fetch(`/customerRentalHistory?custID=${custID}`)
              .then((response) => {
                if (!response.ok) {
                  throw new Error('Network response was not ok');
                }
                return response.json();
              })
              .then((jsonData) => {
                setHistoryTable(jsonData.rentalList);
              })
              .catch((error) => {
                console.error('Error fetching data:', error);
                setHistoryTable([{ 'title': 'Error Loading Data', 'rentDate': error, 'returnDate': 'Error Loading Data' }]);
              });
        }
    };

    // Populates and shows movie details table
    const CustomerPopulator = (search, page, filter) => {
        setCustomersTable([{ 'custID': 'Loading Data', 'custName': 'Loading Data' }]);
        fetch(`/customersList?search=${search}&page=${page}&filter=${filter}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then((jsonData) => {
            setCustomersTable(jsonData.customersList);
            setmaxPage(jsonData.pageCount);
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
            setCustomersTable([{ 'title': 'Error Loading Data', 'genre': `${error}` }]);
          });
    }

    // delete customer
    const handleDelete = (custID) => {
        if(custID != 'Customer ID'){
            alert(`Attempting to remove customer ${custID}...`);
            fetch(`/deleteCustomer?custID=${custID}`).then(res => res.json()).then(data => {
                    alert(data.response);
                  });
        }
    }

    // populate table and shit yk
    useEffect(() => {
        CustomerPopulator(query, pageNo, filter);
    }, [query, pageNo, filter]);

    // The "HTML"
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <td colSpan='4'> <Dropdown />
                        <input
                            type="text"
                            id="customerSearch"
                            value={query}
                            onChange={handleInputChange}
                            placeholder="Search..."
                            />
                        </td>
                        <td onClick={handleAddCustomer}>
                            Add Customer
                        </td>
                    </tr>
                </thead>
                <tbody>
                    {customersTable.map((item, index) => (
                        <tr key={index}>
                            <td className='thirtyfive-width'>{item.custID}</td>
                            <td className='thirtyfive-width'>{item.custName}</td>
                            <td className='tenth-width' onClick={() => handleHistory(item.custID)}>View History</td>
                            <td className='tenth-width' onClick={() => handleEdit(item.custID)}>Edit Customer</td>
                            <td className='tenth-width' onClick={() => handleDelete(item.custID)}>Delete Customer</td>
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
            <table style={{ visibility: bottomTableVisible ? 'visible' : 'hidden' }}>
                <thead>
                    <tr>
                        <td className='two-thirds-width'>
                            {secondBoxLabel}
                        </td>
                        <td onClick={() => setBottomTableVisible(false)}>
                            Close Menu
                        </td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colSpan='2'>
                            <div style={{ display: addBodyVisible ? 'inline-block' : 'none' }}>
                                <form ref={addFormRef} onSubmit={handleAddSubmit}>
                                <label for="firstName">First Name:&nbsp;</label>
                                <input type="text" id="firstName" name="firstName" placeholder="Alex" required />&nbsp;<br/>
                                <label for="lastName">Last Name:&nbsp;</label>
                                <input type="text" id="lastName" name="lastName" placeholder="Doe" required />&nbsp;<br/>
                                <label for="email">Email:&nbsp;</label>
                                <input type="text" id="email" name="email" placeholder="email@email.com" required />&nbsp;<br/>
                                <label for="address">Address:&nbsp;</label>
                                <input type="text" id="address" name="address" placeholder="Street Address" required />&nbsp;<br/>
                                <label for="address2">Address 2:&nbsp;</label>
                                <input type="text" id="address2" name="address2" placeholder="Optional"/>&nbsp;<br/>
                                <label for="city">City:&nbsp;</label>
                                <input type="text" id="city" name="city" placeholder="City Name" required />&nbsp;<br/>
                                <label for="stateDistrict">State/District:&nbsp;</label>
                                <input type="text" id="stateDistrict" name="stateDistrict" placeholder="Enter State or Region" required />&nbsp;<br/>
                                <label for="country">Country:&nbsp;</label>
                                <input type="text" id="country" name="country" placeholder="Enter Country" required />&nbsp;<br/>
                                <label for="postalCode">Postal Code:&nbsp;</label>
                                <input type="number" id="postalCode" name="postalCode" placeholder="Optional" />&nbsp;<br/>
                                <label for="phoneNumber">Phone Number:&nbsp;</label>
                                <input type="number" id="phoneNumber" name="phoneNumber" placeholder="1231231234" required />&nbsp;<br/>
                                <input type="submit" value="Submit" />
                                </form>
                            </div>
                            <div style={{ display: editBodyVisible ? 'inline-block' : 'none' }}>
                            <form ref={editFormRef} onSubmit={handleEditSubmit}>
                                <label for="firstName">First Name:&nbsp;</label>
                                <input type="text" id="firstName" name="firstName" placeholder="Alex" required />&nbsp;<br/>
                                <label for="lastName">Last Name:&nbsp;</label>
                                <input type="text" id="lastName" name="lastName" placeholder="Doe" required />&nbsp;<br/>
                                <label for="email">Email:&nbsp;</label>
                                <input type="text" id="email" name="email" placeholder="email@email.com" required />&nbsp;<br/>
                                <label for="address">Address:&nbsp;</label>
                                <input type="text" id="address" name="address" placeholder="Street Address" required />&nbsp;<br/>
                                <label for="address2">Address 2:&nbsp;</label>
                                <input type="text" id="address2" name="address2" placeholder="Optional"/>&nbsp;<br/>
                                <label for="city">City:&nbsp;</label>
                                <input type="text" id="city" name="city" placeholder="City Name" required />&nbsp;<br/>
                                <label for="stateDistrict">State/District:&nbsp;</label>
                                <input type="text" id="stateDistrict" name="stateDistrict" placeholder="Enter State or Region" required />&nbsp;<br/>
                                <label for="country">Country:&nbsp;</label>
                                <input type="text" id="country" name="country" placeholder="Enter Country" required />&nbsp;<br/>
                                <label for="postalCode">Postal Code:&nbsp;</label>
                                <input type="number" id="postalCode" name="postalCode" placeholder="Optional" />&nbsp;<br/>
                                <label for="phoneNumber">Phone Number:&nbsp;</label>
                                <input type="number" id="phoneNumber" name="phoneNumber" placeholder="1231231234" required />&nbsp;<br/>
                                <input type="submit" value="Submit" />
                                </form>
                            </div>
                            <div style={{ display: viewRentalsVisible ? 'inline-block' : 'none' }}>
                            {historyTable.map((item, index) => (
                                <tr key={index}>
                                    <td className='third-width'> {item.title}</td>
                                    <td className='third-width'> {item.rentDate}</td>
                                    <td className='third-width'> {item.returnDate}</td>
                                </tr>
                            ))}
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}