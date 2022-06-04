
SELECT 
    c.nome AS nome, COUNT(u.cancoes_id) AS reproducoes
FROM
    SpotifyClone.reproducoes AS u
        INNER JOIN
    SpotifyClone.cancoes AS c ON c.cancoes_id = u.cancoes_id
        INNER JOIN
    SpotifyClone.usuarios AS US
    ON u.usuario_id = US.usuario_id
        INNER JOIN
    SpotifyClone.planos AS p ON US.plano_id = p.plano_id
WHERE
    p.plano = 'gratuito'
        OR p.plano = 'pessoal'
GROUP BY c.nome
ORDER BY nome