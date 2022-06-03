select c.nome AS usuario, u.data_reproducao AS condicao_usuario
FROM SpotifyClone.usuarios AS c
INNER JOIN SpotifyClone.reproducoes AS u
ON c.cancoes_id = u.cancoes_id
group by cancao
order by reproducoes DESC , cancao ASC
LIMIT 2;