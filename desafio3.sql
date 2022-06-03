select u.usuario AS usuario, COUNT(c.cancoes_id) AS qtde_musicas_ouvidas, ROUND(SUM(t.duracao_segundos/60),2)AS total_minutos
FROM SpotifyClone.usuarios AS u
INNER JOIN SpotifyClone.reproducoes AS c
ON u.usuario_id = c.usuario_id
JOIN SpotifyClone.cancoes AS t
ON c.cancoes_id = t.cancoes_id
GROUP BY u.usuario
order by usuario;
