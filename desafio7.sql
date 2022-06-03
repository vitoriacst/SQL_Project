SELECT 
    A.nome AS artista,
    AB.album AS album,
    COUNT(S.usuario_id) AS seguidores
FROM
    SpotifyClone.artistas AS A
        INNER JOIN
    SpotifyClone.albums AS AB ON A.artista_id = AB.artista_id
        INNER JOIN
    SpotifyClone.seguindo AS S ON A.artista_id = S.artista_id
GROUP BY artista , album
order by seguidores DESC , artista , album
