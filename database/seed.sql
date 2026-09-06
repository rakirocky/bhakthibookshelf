INSERT INTO books
(
slug,
title,
subtitle,
author,
publisher,
language,
pages,
description,
price,
discount_price,
cover_image,
sample_pdf,
full_pdf,
featured,
published
)

VALUES

(
'bhagavad-gita',
'Bhagavad Gita',
'The Song of the Divine',
'Ved Vyasa',
'Bhakthi Bookshelf',
'English',
700,
'The timeless dialogue between Lord Krishna and Arjuna.',
199,
149,
'/images/books/gita.jpg',
NULL,
NULL,
true,
true
),

(
'ramayana',
'Ramayana',
'The Story of Lord Rama',
'Valmiki',
'Bhakthi Bookshelf',
'English',
900,
'The divine journey of Lord Rama.',
249,
199,
'/images/books/ramayana.jpg',
NULL,
NULL,
true,
true
),

(
'mahabharata',
'Mahabharata',
'The Great Epic',
'Ved Vyasa',
'Bhakthi Bookshelf',
'English',
1500,
'The greatest epic in Indian history.',
399,
349,
'/images/books/mahabharata.jpg',
NULL,
NULL,
true,
true
),

(
'hanuman-chalisa',
'Hanuman Chalisa',
'Forty Sacred Verses',
'Tulsidas',
'Bhakthi Bookshelf',
'English',
80,
'The sacred verses praising Lord Hanuman.',
99,
79,
'/images/books/hanuman-chalisa.jpg',
NULL,
NULL,
true,
true
);
