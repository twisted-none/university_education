1.
SELECT COUNT(*) 
FROM real_estate_object 
WHERE floor = 2;

2.
SELECT AVG(price) 
FROM real_estate_object
WHERE type_id = (SELECT id FROM type WHERE name = 'Дом')
AND id IN (
    SELECT real_estate_id
    FROM real_estate_structure
    GROUP BY real_estate_id
    HAVING COUNT(*) > 2 AND SUM(area) > 30
);

3.
SELECT MAX(price), MIN(price) 
FROM sale
WHERE realtor_id IN (
    SELECT id
    FROM realtor
    WHERE last_name = 'Петрова'
);

4.
SELECT AVG(price / (SELECT area FROM real_estate_object WHERE id = sale.real_estate_id)) 
FROM sale
WHERE real_estate_id IN (
    SELECT id
    FROM real_estate_object
    WHERE type_id = (SELECT id FROM type WHERE name = 'Квартира')
)
AND sale_date BETWEEN '2025-03-10' AND '2025-03-15';

5.
SELECT COUNT(*) 
FROM sale 
WHERE realtor_id IN (
    SELECT id 
    FROM realtor 
    WHERE last_name = 'Петрова'
);

6.
SELECT MAX(area) 
FROM real_estate_object
WHERE price > 10000000;

7.
SELECT
    MAX((SELECT price FROM real_estate_object WHERE id = sale.real_estate_id) - price) AS max_difference,
    MIN((SELECT price FROM real_estate_object WHERE id = sale.real_estate_id) - price) AS min_difference 
FROM sale
WHERE real_estate_id IN (
    SELECT id FROM real_estate_object
)
AND sale_date >= '2024-01-01'
AND sale_date < '2025-04-01';

8.
SELECT AVG(score) 
FROM evaluations
WHERE criteria_id = (SELECT id FROM evaluation_criteria WHERE name = 'Экология')
AND real_estate_id IN (
    SELECT id
    FROM real_estate_object
    WHERE type_id = (SELECT id FROM type WHERE name = 'Дом')
)
AND real_estate_id IN (
    SELECT real_estate_id
    FROM sale
    WHERE realtor_id = (SELECT id FROM realtor WHERE last_name = 'Петрова')
);

9.
SELECT 
    MAX(DATE_PART('day', sale_date - (SELECT announcement_date FROM real_estate_object WHERE id = sale.real_estate_id)) / 30) AS max_months,
    MIN(DATE_PART('day', sale_date - (SELECT announcement_date FROM real_estate_object WHERE id = sale.real_estate_id)) / 30) AS min_months
FROM sale
WHERE real_estate_id IN (SELECT id FROM real_estate_object);

10.
