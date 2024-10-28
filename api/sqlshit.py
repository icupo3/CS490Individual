from flask import Flask,render_template, request
from flask_mysqldb import MySQL
from datetime import datetime
import math

app = Flask(__name__)

# Required
app.config["MYSQL_USER"] = "root"
app.config["MYSQL_PASSWORD"] = "tanner25"
app.config["MYSQL_DB"] = "sakila"
# Extra configs, optional:
# app.config["MYSQL_CURSORCLASS"] = "DictCursor"
# app.config["MYSQL_CUSTOM_OPTIONS"] = {"ssl": {"ca": "/path/to/ca-file"}}  # https://mysqlclient.readthedocs.io/user_guide.html#functions-and-attributes

mysql = MySQL(app)

@app.route("/")
def homeFunc():
    return {"data": "use /sql"}

@app.route("/sql")
def sqlFunc():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""SELECT * FROM film""")
        rv = cur.fetchone()
        return {"movie": str(rv)}
    except Exception as err:
        return {"error":  f"{err}"}


# LANDING MOVIE STUFF

@app.route("/top5movies")
def top5RentsAllTime():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""SELECT film.title
FROM rental, inventory, film, film_category, category
WHERE rental.inventory_id = inventory.inventory_id AND inventory.film_id = film.film_id AND film.film_id = film_category.film_id AND film_category.category_id = category.category_id
GROUP BY film.film_id
ORDER BY COUNT(*) DESC, film.film_id
LIMIT 5;""")
        rv = cur.fetchall()
        returnStr = ""
        for thing in rv:
            returnStr = returnStr + '<tr><td class="movieDetailsGettable">' + str(thing[0]) + '</td></tr>\n'
        return {"top5movies": returnStr}
    except Exception as err:
        return {"top5movies":  f"<tr><td>Error loading movies: {err}</td></tr>\n"}

@app.route('/movieDetails', methods=['GET'])
def movieDetailGetter():
    try:
        movie = request.args.get('movie')

        if movie:
            cur = mysql.connection.cursor()

            cur.execute(f"SELECT release_year FROM film WHERE title = '{movie}'")
            rvYear = cur.fetchall()
            cur.execute(f"SELECT length FROM film WHERE title = '{movie}'")
            rvLen = cur.fetchall()
            cur.execute(f"SELECT rating FROM film WHERE title = '{movie}'")
            rvR8 = cur.fetchall()
            cur.execute(f"SELECT description FROM film WHERE title = '{movie}'")
            rvDesc = cur.fetchall()

            return {
                'releaseYear': str(rvYear[0][0]),
                'runtime': str(rvLen[0][0]),
                'rating': str(rvR8[0][0]),
                'description': str(rvDesc[0][0]),
            }
        else:
            return {
                'releaseYear': '???',
                'runtime': '???',
                'rating': '???',
                'desc': '???',
            }
    except Exception as err:
        return {
                'releaseYear': 'Error',
                'runtime': 'Loading',
                'rating': 'Data',
                'desc': f'{err}',
            }

# LANDING MOVIE STUFF

# LANDING ACTOR STUFF

@app.route("/top5actors")
def top5ActorsAllTime():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""SELECT actor.first_name, actor.last_name
FROM actor, film, film_actor
WHERE actor.actor_id = film_actor.actor_id AND film_actor.film_id = film.film_id
GROUP BY actor.actor_id
ORDER BY COUNT(film.film_id) DESC
LIMIT 5;""")
        rv = cur.fetchall()
        returnStr = ""
        for thing in rv:
            returnStr = returnStr + '<tr><td class="actorDetailsGettable">' + str(thing[0]) + " " + str(thing[1]) + '</td></tr>\n'
        return {"top5actors": returnStr}
    except Exception as err:
        return {"top5actors":  f"<tr><td>Error loading actors: {err}</td></tr>\n"}

@app.route('/actorDetails', methods=['GET'])
def actorDetailGetter():
    try:
        actor = request.args.get('actor')

        if actor:
            cur = mysql.connection.cursor()

            cur.execute(f"""SELECT film.title, COUNT(*) as rentals
FROM rental, inventory, film, film_actor, actor
WHERE rental.inventory_id = inventory.inventory_id AND inventory.film_id = film.film_id AND film.film_id = film_actor.film_id AND film_actor.actor_id = actor.actor_id AND CONCAT(actor.first_name, ' ', actor.last_name) = '{actor}'
GROUP BY film.film_id
ORDER BY COUNT(film.film_id) DESC
LIMIT 5;""")
            rv = cur.fetchall()

            return {
                'film1': str(rv[0][0]),
                'film2': str(rv[1][0]),
                'film3': str(rv[2][0]),
                'film4': str(rv[3][0]),
                'film5': str(rv[4][0]),
                'rentals1' : str(rv[0][1]),
                'rentals2' : str(rv[1][1]),
                'rentals3' : str(rv[2][1]),
                'rentals4' : str(rv[3][1]),
                'rentals5' : str(rv[4][1]),
            }
        else:
            return {
                'film1': '???',
                'film2': '???',
                'film3': '???',
                'film4': '???',
                'film5': '???',
                'rentals1' : '???',
                'rentals2' : '???',
                'rentals3' : '???',
                'rentals4' : '???',
                'rentals5' : '???',
            }
    except Exception as err:
        return {
            'film1': str(err),
            'film2': str(err),
            'film3': str(err),
            'film4': str(err),
            'film5': str(err),
            'rentals1' : str(err),
            'rentals2' : str(err),
            'rentals3' : str(err),
            'rentals4' : str(err),
            'rentals5' : str(err),
        }

# LANDING ACTOR STUFF

# FILMS STUFF

@app.route('/filmsList', methods=['GET'])
def allFilmsPaginated():
    try:
        filter = request.args.get('filter')
        page = int(request.args.get('page')) if request.args.get('page') else 1
        search = request.args.get('search') if request.args.get('search') else ""

        cur = mysql.connection.cursor()

        page = (page - 1) * 10
        actorsVisibility = False

        # filmName
        if(filter == "filmName"):
            cur.execute(f"""SELECT COUNT(film.film_id)
FROM category, film_category, film
WHERE category.category_id = film_category.category_id AND film_category.film_id = film.film_id
AND UPPER(film.title) LIKE UPPER('{search}%')""")
            hits = cur.fetchall()[0][0]
            if(hits == 0):
                return {"filmsList": [{ 'title': 'No data!', 'genre': 'Try another search!' }], "pageCount": 1, "actorsVisibility": False}
            cur.execute(f"""SELECT film.title, category.name
FROM category, film_category, film
WHERE category.category_id = film_category.category_id AND film_category.film_id = film.film_id
AND UPPER(film.title) LIKE UPPER('{search}%')
ORDER BY film.title ASC
LIMIT 10 OFFSET {page};""")
            
        # actor
        elif(filter == "actor"):
            actorsVisibility = True
            cur.execute(f"""SELECT COUNT(film.film_id)
FROM category, film_category, film, film_actor, actor
WHERE category.category_id = film_category.category_id AND film_category.film_id = film.film_id AND film.film_id = film_actor.film_id AND film_actor.actor_id = actor.actor_id
AND UPPER(CONCAT(actor.first_name, ' ', actor.last_name)) LIKE UPPER('%{search}%')""")
            hits = cur.fetchall()[0][0]
            if(hits == 0):
                return {"filmsList": [{ 'title': 'No data!', 'genre': 'Try another search!' }], "pageCount": 1, "actorsVisibility": False}
            cur.execute(f"""SELECT film.title, category.name, actor.first_name, actor.last_name
FROM category, film_category, film, film_actor, actor
WHERE category.category_id = film_category.category_id AND film_category.film_id = film.film_id AND film.film_id = film_actor.film_id AND film_actor.actor_id = actor.actor_id
AND UPPER(CONCAT(actor.first_name, ' ', actor.last_name)) LIKE UPPER('%{search}%')
ORDER BY actor.first_name ASC
LIMIT 10 OFFSET {page};""")
            
        # genre
        elif(filter == "genre"):
            cur.execute(f"""SELECT COUNT(film.film_id)
FROM category, film_category, film
WHERE category.category_id = film_category.category_id AND film_category.film_id = film.film_id
AND UPPER(category.name) LIKE UPPER('{search}%')""")
            hits = cur.fetchall()[0][0]
            if(hits == 0):
                return {"filmsList": [{ 'title': 'No data!', 'genre': 'Try another search!' }], "pageCount": 1, "actorsVisibility": False}
            cur.execute(f"""SELECT film.title, category.name
FROM category, film_category, film
WHERE category.category_id = film_category.category_id AND film_category.film_id = film.film_id
AND UPPER(category.name) LIKE UPPER('{search}%')
ORDER BY film.title ASC
LIMIT 10 OFFSET {page};""")
            
        # garbage
        else:
            return {"filmsList": [{ 'title': 'Bad Query', 'genre': 'Bad Query' }], "pageCount": 1, "actorsVisibility": False}

        # the goods
        if(filter == "actor"):
            sqlRv = cur.fetchall()
            returnJsonArr = [{ 'title': 'Title', 'genre': 'Genre', 'actorName': 'Actor Name' }]
            for thing in sqlRv:
                returnJsonArr.append({ 'title': str(thing[0]), 'genre': str(thing[1]), 'actorName': f"{thing[2]} {thing[3]}" })
        else:
            sqlRv = cur.fetchall()
            returnJsonArr = [{ 'title': 'Title', 'genre': 'Genre' }]
            for thing in sqlRv:
                returnJsonArr.append({ 'title': str(thing[0]), 'genre': str(thing[1]) })          

        return {"filmsList": returnJsonArr, "pageCount": math.ceil(int(hits)/10), "actorsVisibility": actorsVisibility}
    except Exception as err:
        return {"filmsList": [{ 'title': f'Error loading data', 'genre': err }], "pageCount": 1, "actorsVisibility": False}


@app.route('/moreMovieDetails', methods=['GET'])
def moreMovieDetailGetter():
    try:
        movie = request.args.get('movie')

        if movie:
            cur = mysql.connection.cursor()

            cur.execute(f"SELECT description, rating, release_year, special_features FROM film WHERE title LIKE '{movie}'")
            movieDetails = cur.fetchall()
            cur.execute(f"SELECT COUNT(film.film_id), film.film_id, inventory.store_id FROM inventory, film WHERE inventory.film_id = film.film_id and film.title LIKE '{movie}%' GROUP BY film.film_id, inventory.store_id;")
            metaData = cur.fetchall()
            if metaData:
                invIds = []
                for thing in metaData:
                    invIds.append(thing[2])
            else:
                metaData = [["Not in inventory"]]
                invIds = ['Not in inventory']
            return {
                'description': str(movieDetails[0][0]),
                'rating': str(movieDetails[0][1]),
                'releaseYear': str(movieDetails[0][2]),
                'specFeat': str(movieDetails[0][3]),
                'copies': metaData[0][0],
                'invIds': invIds
            }
        else:
            return {
                'description': '???',
                'rating': '???',
                'releaseYear': '???',
                'specFeat': '???',
                'copies': 0,
                'invIds': []
            }
    except Exception as err:
        return {
                'description': 'Error',
                'rating': 'Loading',
                'releaseYear': 'Data',
                'specFeat': f'{err}',
                'copies': -1,
                'invIds': []
            }

# SHOULD NOT BE GET BUT WHO CARES
@app.route('/rentToCustomer', methods=['GET'])
def rentFilmToCustomer():
    try:
        custID = request.args.get('custID')
        movie = request.args.get('movie')

        if custID and movie:
            cur = mysql.connection.cursor()
            cur.execute(f"""SELECT inventory.inventory_id
FROM inventory, film, rental
WHERE inventory.film_id = film.film_id AND inventory.inventory_id = rental.inventory_id
AND rental.return_date IS NOT NULL
AND film.title LIKE '{movie}'
LIMIT 1;""")
            invID = cur.fetchall()[0][0]
            print(invID)
            current_time = datetime.now()
            print(f"INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id) VALUES ('{current_time}', {invID}, {custID}, 1);")
            cur.execute(f"INSERT INTO rental (rental_date, inventory_id, customer_id, staff_id) VALUES ('{current_time}', {invID}, {custID}, 1);")
            mysql.connection.commit()
            if cur.rowcount > 0:
                return { 'status': "Successfully rented film to customer."}
            else:

                return { 'status': "Unable to rent out film." }
        else:
            return {
                'status': '???',
            }
    except Exception as err:
        return {
                'status': f'{err}'
            }

# FILMS STUFF

# CUSTOMERS STUFF

@app.route('/customersList', methods=['GET'])
def allCustomersPaginated():
    try:
        filter = request.args.get('filter')
        page = int(request.args.get('page')) if request.args.get('page') else 1
        search = request.args.get('search') if request.args.get('search') else ""

        cur = mysql.connection.cursor()

        page = (page - 1) * 10

        if(filter == "ID"):
            insertionString = "customer_id"
        elif(filter == "firstName"):
            insertionString = "LOWER(first_name)"
        elif(filter == "lastName"):
            insertionString = "LOWER(last_name)"
        else:
            return {"customersList": [{ 'custID': 'Bad Query', 'custName': 'Bad Query' }], "pageCount": 1}

        cur.execute(f"""SELECT COUNT(customer_id) FROM customer WHERE {insertionString} LIKE '{search}%'""")
        
        hits = cur.fetchall()[0][0]
        if(hits == 0):
            return {"customersList": [{ 'custID': 'No data!', 'custName': 'Try another search!' }], "pageCount": 1}
        
        cur.execute(f"""SELECT customer_id, UPPER(first_name), UPPER(last_name)
FROM customer
WHERE {insertionString} LIKE '{search}%'
ORDER BY {insertionString} ASC
LIMIT 10 OFFSET {page};""")
        
        sqlRV = cur.fetchall()
        returnJsonArr = [{ 'custID': 'Customer ID', 'custName': 'Customer Name' }]
        for thing in sqlRV:
            returnJsonArr.append({ 'custID': str(thing[0]), 'custName': f"{str(thing[1])} {str(thing[2])}" })

        return {"customersList": returnJsonArr, "pageCount": math.ceil(int(hits)/10)}
    except Exception as err:
        return {"customersList": [{ 'custID': 'Error', 'custName': f'{err}' }], "pageCount": 1}


@app.route('/customerRentalHistory', methods=['GET'])
def customerRentals():
    try:
        custID = request.args.get('custID')

        cur = mysql.connection.cursor()
        cur.execute(f"""SELECT film.title, rental.rental_date, rental.return_date
FROM rental, inventory, film
WHERE customer_id = {custID} AND rental.inventory_id = inventory.inventory_id AND inventory.film_id = film.film_id;""")
        
        sqlRV = cur.fetchall()
        returnJsonArr = [{ 'title': 'Title', 'rentDate': 'Date Rented', 'returnDate': 'Date Returned' }]
        for thing in sqlRV:
            returnJsonArr.append({ 'title': str(thing[0]), 'rentDate': str(thing[1]), 'returnDate': str(thing[2])})

        return {"rentalList": returnJsonArr}
    except Exception as err:
        return {"rentalList": [{ 'title': 'Error', 'rentDate': f'{err}', 'returnDate': 'Error' }]}


@app.route('/deleteCustomer', methods=['GET'])
def deleteCustomer():
    try:
        custID = request.args.get('custID')

        cur = mysql.connection.cursor()
        cur.execute(f"SELECT * FROM rental WHERE customer_id = {custID} AND rental.return_date IS NULL;")
        hits = cur.fetchall()
        if(len(hits) != 0):
            return {"response": 'Unable to delete, customer has unreturned films.'}
    
        cur.execute(f"DELETE FROM rental WHERE customer_id = {custID};")
        cur.execute(f"DELETE FROM payment WHERE customer_id = {custID};")
        cur.execute(f"DELETE FROM customer WHERE customer_id = {custID};")
        mysql.connection.commit()
        affected_rows = cur.rowcount
        if(affected_rows == 1):
            return {"response": 'Able to delete, customer had no unreturned films.'}
        elif(affected_rows > 1):
            return {"response": 'Deleted too many customers.'}
        return {"response": 'Unable to delete for unknown reason.'}
    except Exception as err:
        return {"response": f'Error: {err}'}

@app.route('/addEditCustomer', methods=['GET'])
def addCustomer():
    try:
        mode = request.args.get('mode')
        fName = request.args.get('fName')
        lName = request.args.get('lName')
        email = request.args.get('email')
        addy = request.args.get('addy')
        addy2 = request.args.get('addy2')
        city = request.args.get('city')
        state = request.args.get('state')
        country = request.args.get('country')
        postalCode = request.args.get('postalCode')
        phoneNum = request.args.get('phoneNum')
        custID = request.args.get('custID')

        if((mode == 'add' or mode == 'edit') and fName != '' and lName != '' and addy != '' and city != '' and state != '' and country != '' and phoneNum != ''):
            cur = mysql.connection.cursor()
            cur.execute(f"SELECT * FROM country WHERE country LIKE '{country}';")
            hits = cur.fetchall()
            if(len(hits) == 0):
                cur.execute(f"INSERT INTO country(country) VALUES ('{country}');")
                affected_rows = cur.rowcount
                if(affected_rows == 0):
                    return {"response": 'Unable to add new country.'}
                elif(affected_rows > 1):
                    return {"response": f'Little Bobby Tables. 1 {affected_rows}'}
            cur.execute(f"SELECT country_id FROM country WHERE country LIKE '{country}';")
            countryID = cur.fetchall()[0][0]

            cur.execute(f"SELECT * FROM city WHERE city LIKE '{city}';")
            hits = cur.fetchall()
            if(len(hits) == 0):
                cur.execute(f"INSERT INTO city(city, country_id) VALUES ('{city}', {countryID});")
                affected_rows = cur.rowcount
                if(affected_rows == 0):
                    return {"response": 'Unable to add new city.'}
                elif(affected_rows > 1):
                    return {"response": f'Little Bobby Tables. 2 {affected_rows}'}
            cur.execute(f"SELECT city_id FROM city WHERE city LIKE '{city}';")
            cityID = cur.fetchall()[0][0]

            cur.execute(f"SELECT * FROM address WHERE address LIKE '{addy}' AND district LIKE '{state}' AND city_id = {cityID} AND phone LIKE '{phoneNum}';")
            hits = cur.fetchall()
            if(len(hits) == 0):
                if(postalCode != '' and addy2 != ''):
                    cur.execute(f"INSERT INTO address(address, address2, district, city_id, postal_code, phone, location) VALUES ('{addy}', '{addy2}', '{state}', {cityID}, '{postalCode}', '{phoneNum}', ST_GeomFromText('POINT(0.0 0.0)'));")
                    affected_rows = cur.rowcount
                    if(affected_rows == 0):
                        return {"response": 'Unable to add new address.'}
                    elif(affected_rows > 1):
                        return {"response": f'Little Bobby Tables. 3 {affected_rows}'}
                elif(postalCode != ''):
                    cur.execute(f"INSERT INTO address(address, district, city_id, postal_code, phone, location) VALUES ('{addy}', '{state}', {cityID}, '{postalCode}', '{phoneNum}', ST_GeomFromText('POINT(0.0 0.0)'));")
                    affected_rows = cur.rowcount
                    if(affected_rows == 0):
                        return {"response": 'Unable to add new address.'}
                    elif(affected_rows > 1):
                        return {"response": f'Little Bobby Tables. 3 {affected_rows}'}
                elif(addy2 != ''):
                    cur.execute(f"INSERT INTO address(address, address2, district, city_id, phone, location) VALUES ('{addy}', '{addy2}', '{state}', {cityID}, '{phoneNum}', ST_GeomFromText('POINT(0.0 0.0)'));")
                    affected_rows = cur.rowcount
                    if(affected_rows == 0):
                        return {"response": 'Unable to add new address.'}
                    elif(affected_rows > 1):
                        return {"response": f'Little Bobby Tables. 3 {affected_rows}'}
                else:
                    cur.execute(f"INSERT INTO address(address, district, city_id, phone, location) VALUES ('{addy}', '{state}', {cityID}, '{phoneNum}', ST_GeomFromText('POINT(0.0 0.0)'));")
                    affected_rows = cur.rowcount
                    if(affected_rows == 0):
                        return {"response": 'Unable to add new address.'}
                    elif(affected_rows > 1):
                        return {"response": f'Little Bobby Tables. 3 {affected_rows}'}
            cur.execute(f"SELECT address_id FROM address WHERE address LIKE '{addy}' AND district LIKE '{state}' AND city_id = {cityID} AND phone LIKE '{phoneNum}';")
            addressID = cur.fetchall()[0][0]

            if(mode == "add"):
                if(email != ''):
                    current_time = datetime.now()
                    cur.execute(f"INSERT INTO customer(store_id, first_name, last_name, email, address_id, create_date) VALUES (1, '{fName}', '{lName}', '{email}', {addressID}, '{current_time}');")
                    mysql.connection.commit()
                    affected_rows = cur.rowcount
                    if(affected_rows == 0):
                        return {"response": 'Unable to add new customer.'}
                    return {"response": 'Able to add new customer.'}
                else:
                    current_time = datetime.now()
                    cur.execute(f"INSERT INTO customer(store_id, first_name, last_name, address_id, create_date) VALUES (1, '{fName}', '{lName}', {addressID}, '{current_time}');")
                    mysql.connection.commit()
                    affected_rows = cur.rowcount
                    if(affected_rows == 0):
                        return {"response": 'Unable to add new customer.'}
                    return {"response": 'Able to add new customer.'}
            elif(mode == "edit" and custID != ''):
                if(email != ''):
                    current_time = datetime.now()
                    cur.execute(f"UPDATE customer set first_name = '{fName}', last_name = '{lName}', email = '{email}', address_id = {addressID} WHERE customer_id = {custID};")
                    mysql.connection.commit()
                    affected_rows = cur.rowcount
                    if(affected_rows == 0):
                        return {"response": 'Unable to edit customer.'}
                    return {"response": 'Able to edit customer.'}
                else:
                    current_time = datetime.now()
                    cur.execute(f"UPDATE customer set first_name = '{fName}', last_name = '{lName}', address_id = {addressID} WHERE customer_id = {custID};")
                    mysql.connection.commit()
                    affected_rows = cur.rowcount
                    if(affected_rows == 0):
                        return {"response": 'Unable to edit customer.'}
                    return {"response": 'Able to edit customer.'}
        else:
            return {"response": 'Missing argument or mode is incorrect'}
        return {"response": 'Unable to add for unknown reason.'}
    except Exception as err:
        return {"response": f'Error: {err}'}
    return {'status': ''}

# CUSTOMERS STUFF




if __name__ == "__main__":
    app.run(debug=True)