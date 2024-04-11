const url = "http://localhost:3000/films/";
const ulFilms = document.getElementById("films");
const idBuyTicket = document.getElementById("buy-ticket");
const movieImg = document.getElementById("poster");
const idTitle = document.getElementById("title");
const idRuntime = document.getElementById("runtime");
const idFilmInfo = document.getElementById("film-info");
const idShowtime = document.getElementById("showtime");
const idTicketNum = document.getElementById("ticket-num");

function grabMovies() {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            ulFilms.innerHTML = "";
            data.forEach(movie => addMovie(movie));
        })
        .catch(error => console.error(error.message));
}

grabMovies();

function addMovie(movie) {
    const remaining = movie.capacity - movie.tickets_sold;
    const liFilm = document.createElement("li");
    liFilm.className = remaining > 0 ? "" : "sold-out";

    ulFilms.appendChild(liFilm);

    const movieSpan = document.createElement("span");
    movieSpan.innerText = movie.title;
    liFilm.appendChild(movieSpan);

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete";
    liFilm.appendChild(deleteButton);

    deleteButton.addEventListener('click', () => deleteMovie(movie));
    movieSpan.addEventListener('click', () => updateDOM(movie));

    if (movie.id === "1") {
        updateDOM(movie);
    }
}

function updateDOM(movie) {
    const remaining = movie.capacity - movie.tickets_sold;
    const availability = remaining > 0 ? "Buy Ticket" : "Sold out";

    movieImg.src = movie.poster;
    movieImg.alt = movie.title;
    idTitle.innerText = movie.title;
    idRuntime.innerText = `${movie.runtime} minutes`;
    idFilmInfo.innerText = movie.description;
    idShowtime.innerText = movie.showtime;
    idTicketNum.innerText = remaining;

    idBuyTicket.onclick = () => {
        if (remaining > 0) {
            buyTicket(movie);
        } else {
            console.log("You cannot buy tickets");
        }
    };
    idBuyTicket.dataset.movieId = movie.id;
}

function buyTicket(movie) {
    movie.tickets_sold++;
    const requestHeaders = { "Content-Type": "application/json" };
    const requestBody = { "tickets_sold": movie.tickets_sold };

    fetch(url + movie.id, {
        method: "PATCH",
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => {
            updateDOM(data);

            const numberOfTickets = data.capacity - data.tickets_sold;

            if (numberOfTickets <= 0) {
                grabMovies();
            }

            const requestBodyTickets = {
                "film_id": data.id,
                "number_of_tickets": numberOfTickets
            };

            fetch("http://localhost:3000/tickets", {
                method: "POST",
                headers: requestHeaders,
                body: JSON.stringify(requestBodyTickets)
            })
                .then(response => response.json())
                .then(data => console.log(data))
                .catch(error => console.error(error.message));
        })
        .catch(error => console.error(error.message));
}

function deleteMovie(movie) {
    const requestHeaders = { "Content-Type": "application/json" };
    const requestBody = { "id": movie.id };

    fetch(url + movie.id, {
        method: "DELETE",
        headers: requestHeaders,
        body: JSON.stringify(requestBody)
    })
        .then(response => response.json())
        .then(data => grabMovies())
        .catch(error => console.error(error.message));
}
