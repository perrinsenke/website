/**
 * Book registry — imports and exposes all books.
 */

import { bookConfig as book1Config, poems as book1Poems } from './books/book1.js';
import { bookConfig as book2Config, poems as book2Poems } from './books/book2.js';
import { bookConfig as book3Config, poems as book3Poems } from './books/book3.js';

export const books = [
  { config: book1Config, poems: book1Poems },
  { config: book2Config, poems: book2Poems },
  { config: book3Config, poems: book3Poems },
];

/** Look up a book by its config id */
export function getBook(bookId) {
  return books.find(b => b.config.id === bookId) || null;
}
