select c.nome AS cancao, COUNT(u.cancoes_id) AS reproducoes
FROM SpotifyClone.cancoes AS c
INNER JOIN SpotifyClone.reproducoes AS u
ON c.cancoes_id = u.cancoes_id
group by cancao
order by reproducoes DESC , cancao ASC
LIMIT 2;