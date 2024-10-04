from flask import Flask,render_template, request
from flask_mysqldb import MySQL

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


# MOVIE STUFF

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

# MOVIE STUFF

# ACTOR STUFF

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

# ACTOR STUFF

# CUSTOMERS STUFF

@app.route('/customersList', methods=['GET'])
def allCustomersPaginated():
    try:
    
        search = request.args.get('search')
        page = request.args.get('page')

        page = (page - 1) * 10

        if search:

            cur = mysql.connection.cursor()
            cur.execute(f"""SELECT customer_id, first_name, last_name
FROM customer
WHERE CONCAT(first_name, ' ', last_name) LIKE '%{search}%'
LIMIT 10 OFFSET {page};""")
            rv = cur.fetchall()
            returnStr = ""
            for thing in rv:
                returnStr = returnStr + '<tr><td class="actorDetailsGettable">' + str(thing[0]) + " " + str(thing[1]) + '</td></tr>\n'
            return {"top5actors": returnStr}
    except Exception as err:
        return {"top5actors":  f"<tr><td>Error loading actors: {err}</td></tr>\n"}

# CUSTOMERS STUFF


if __name__ == "__main__":
    app.run(debug=True)