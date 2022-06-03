select COUNT(DISTINCT(c.cancoes_id)) AS cancoes,COUNT(DISTINCT(a.artista_id))  AS artistas, COUNT(DISTINCT(ab.album_id)) AS albuns  
FROM SpotifyClone.cancoes AS c
INNER JOIN SpotifyClone.artistas AS a
INNER JOIN SpotifyClone.albums AS ab
