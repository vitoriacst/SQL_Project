SELECT 
    A.nome AS artista, AB.album
FROM
    SpotifyClone.artistas AS A
        INNER JOIN
    SpotifyClone.albums AS AB ON A.artista_id = AB.artista_id
    LIMIT 2;
    
