const connection = require('../data/movies_db');


function index(req, res) {

    const { search } = req.query;

    let sql = `
        SELECT
    movies.*, AVG(reviews.vote) as avg_vote
    FROM
    movies
    LEFT JOIN 
    reviews on movies.id = reviews.movie_id
    `;

    if (search) {
        sql += `WHERE title like "%${search}%" OR director LIKE "%${search}%" OR abstract LIKE "%${search}%" `
    }

    sql += `GROUP BY movies.ID`

    connection.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: "Database diconnected!" })
        res.json(results.map(result => ({
            ...result,
            imagepath: process.env.DB_IMG + result.image
        })));
    });

};

function show(req, res) {
    const { id } = req.params;

    const sqlMovie = `
    SELECT
    movies.*,
        AVG(reviews.vote) AS avg_vote
    FROM
    movies
        LEFT JOIN 
            reviews ON movies.id = reviews.movie_id
    WHERE
    movies.id = ?
        GROUP BY
    movies.id
    `;

    connection.query(sqlMovie, [id], (err, results) => {
        if (err) {
            return res.status(500).json({
                errorMessage: "Database diconnected!"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                errorMessage: 'Record Not Found!',
                id
            });
        }

        const movie = results[0];
        movie.imagepath = process.env.DB_IMG + movie.image;

        const sqlReviews = 'SELECT * FROM reviews WHERE movie_id = ?';

        connection.query(sqlReviews, [id], (err, reviewResults) => {
            if (err) {
                return res.status(500).json({
                    errorMessage: "Database disconnected!"
                });
            }

            movie.reviews = reviewResults;
            res.json(movie);
        });
    });
};

function starReview(req, res) {
    const { id } = req.params;
    const { text, name, vote } = req.body;

    if (!text || !name || vote === null || vote === "") {
        return res.status(400).json({
            errorMessage: 'Please fill in all fields!'
        });
    };

    const sqlAdd = ` INSERT INTO reviews (movie_id, text, name, vote) 
    VALUES (?, ?, ?, ?)`

    connection.query(sqlAdd, [id, text, name, vote], (err, addResult) => {
        if (err) {
            return res.status(500).json({ errorMessage: "Error saving review!" });

        };

        res.json({
            id,
            text,
            name,
            vote
        });
    });

};

function reviewStore(req, res) {
    const { title, director, genre, abstract, release_year } = req.body;

    if (!req.file) {
        return res.status(400).json({ errorMessage: "Missing image!" });
    }

    const image = req.file.filename;

    const addNewMoviesql = `INSERT INTO movies (title, director, genre, release_year, abstract, image) VALUES (?, ?, ?, ?, ?)`;

    connection.query(addNewMoviesql, [title, director, genre, release_year, abstract, image], (err, result) => {
        if (err) {
            return res.status(500).json({ errorMessage: "Error saving movie!" });

        }

        res.status(201).json({
            message: "Movie saved successfully",
            movieId: result.insertId
        });
    });
}







module.exports = { index, show, starReview, reviewStore };