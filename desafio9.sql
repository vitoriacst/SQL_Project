select COUNT(u.cancoes_id) AS quantidade_musicas_no_historico
FROM SpotifyClone.reproducoes AS u
INNER JOIN SpotifyClone.usuarios AS c
ON c.usuario_id = u.usuario_id
WHERE usuario = "Bill"