SELECT
    d.name AS район
FROM
    districts d
JOIN
    real_estate_object reo ON d.id = reo.district_id
JOIN
    sale s ON reo.id = s.real_estate_id
WHERE d.name ILIKE '%с%'
GROUP BY
    d.name
HAVING
    COUNT(s.id) BETWEEN 2 AND 5;
