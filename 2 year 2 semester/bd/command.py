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
    MIN((sale_date - announcement_date) / 7) AS min_sale_duration_weeks,
    MAX((sale_date - announcement_date) / 7) AS max_sale_duration_weeks
FROM 
    sale, real_estate_object
WHERE 
    sale.real_estate_id = real_estate_object.id;


10.
SELECT COUNT(*) 
FROM sale 
WHERE (SELECT price FROM real_estate_object WHERE id = sale.real_estate_id) * 0.8 > price;

11.
SELECT 
    (SUM(price * commission / 100)) AS bonus
FROM sale
WHERE realtor_id = (SELECT id FROM realtor WHERE last_name = 'Иванов')
AND sale_date >= CURRENT_DATE - INTERVAL '1 month';

12.
SELECT real_estate_id, SUM(area) 
FROM real_estate_structure 
GROUP BY real_estate_id;

13.
SELECT MAX(price / area) 
FROM real_estate_object
WHERE type_id = (SELECT id FROM type WHERE name = 'Квартира')
AND area > 30
AND district_id = (SELECT id FROM districts WHERE name = 'Южный');

14.
SELECT COUNT(*) 
FROM districts
WHERE name LIKE '%ый' 
AND name NOT LIKE '%чный';

15.
SELECT (SELECT MAX(area) FROM real_estate_object) / (SELECT MIN(area) FROM real_estate_object) AS raznitsa;

16.
SELECT address 
FROM real_estate_object 
WHERE price / area < (SELECT AVG(price / area) FROM real_estate_object WHERE district_id = real_estate_object.district_id);

17.
SELECT last_name, first_name, middle_name
FROM realtor
WHERE id NOT IN (
    SELECT realtor_id
    FROM sale
    WHERE sale_date >= '2025-03-15'
);


18.
SELECT real_estate_id 
FROM real_estate_structure 
GROUP BY real_estate_id 
HAVING SUM(area) <> (SELECT area FROM real_estate_object WHERE id = real_estate_structure.real_estate_id);

19.
SELECT id, address 
FROM real_estate_object 
WHERE area > ANY (SELECT area FROM real_estate_object WHERE type_id = (SELECT id FROM type WHERE name = 'Квартира'));

20.
SELECT id, address
FROM real_estate_object
WHERE price > ALL (
    SELECT price
    FROM real_estate_object
    WHERE type_id = (SELECT id FROM type WHERE name = 'Квартира')
    AND rooms = 2
    AND building_material_id = (SELECT id FROM building_materials WHERE name = 'Панель')
);



21.
SELECT address 
FROM real_estate_object 
WHERE district_id IN (
    SELECT district_id 
    FROM real_estate_object 
    WHERE area > 100
);