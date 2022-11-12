process.env.NODE_ENV = "test"
const request = require("supertest");
const app = require("../app");
const db = require("../db");


let test_book;

beforeEach(async () => {
    let result = await db.query(`
        INSERT INTO
            books (isbn, amazon_url, author, language, pages, publisher, title, year)
            VALUES(
            '000030000',
            'https://scooby.com',
            'Jenkins',
            'English',
            5,
            'Goldie Publishes, inc.',
            'How to get some bones', 2022)
            RETURNING isbn`);
    test_book = result.rows[0].isbn
});


describe('GET /books', function () {
    test('Gets a list of books', async function () {
        const res = await request(app).get('/books');
        const books = res.body.books;
        expect(books).toHaveLength(1);
        expect(books[0]).toHaveProperty('isbn');
        expect(books[0]).toHaveProperty('amazon_url');
        expect(books[0]).toHaveProperty('author');
    });
});


describe('GET /books/:isbn', function () {
    test('Gets a book isbn', async function () {
        const res = await request(app).get(`/books/${test_book}`)
        const book = res.body.book;
        expect(book).toHaveProperty("isbn");
        expect(book.isbn).toBe(test_book);
    });
    test('Responds with 404 if no book with that isbn', async function () {
      const res = await request(app).get('/books/234')
      expect(res.statusCode).toBe(404);
    });
});


describe('POST /books', function () {
    test('Creates a new book', async function () {
        const res = await request(app).post('/books').send({
            isbn: '77777777',
            amazon_url: "https://puppies.com",
            author: "rebel",
            language: "english",
            pages: 13,
            publisher: "jacob",
            title: "coolest dog",
            year: 2021
        });
        const book = res.body.book;
        expect(res.statusCode).toBe(201);
        expect(book).toHaveProperty('isbn');
        expect(book).toHaveProperty('amazon_url');
        expect(book).toHaveProperty('author');
    });
});


describe('PUT /books/:isbn', function () {
    test('Updates a book', async function () {
        const res = await request(app).put(`/books/${test_book}`).send({
            amazon_url: 'https://scooby.com',
            author: 'Jenkins',
            language: "English",
            pages: 100,
            publisher: 'Goldie Publishes, inc.',
            title: 'How to get some bones',
            year: 2022
        });
        const book = res.body.book;

        expect(book).toHaveProperty('isbn');
        expect(book.pages).toBe(100);
    });
});


describe('DELETE /books/:isbn', function () {
    test('Delete book', async function () {
        const res = await request(app).delete(`/books/${test_book}`)
        expect(res.body).toEqual({message: 'Book deleted'});
    });
});


afterEach(async function () {
    await db.query('DELETE FROM BOOKS');
});
  
  
afterAll(async function () {
    await db.end()
});