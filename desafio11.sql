
SELECT 
    c.nome AS nome_musica,
    CASE
        WHEN
            c.nome LIKE '%Streets'
        THEN
            REPLACE('Without My Streets',
                'Streets',
                'Code Review')
        WHEN
            c.nome LIKE '%Own'
        THEN
            REPLACE('Dance With Her Own',
                'Her Own',
                'Trybe')
        WHEN
            c.nome LIKE '%Fire'
        THEN
            REPLACE('Troubles Of My Inner Fire',
                'Inner Fire',
                'Project')
        WHEN c.nome LIKE '%Silly%' THEN REPLACE(nome, 'Silly', 'Nice')
        WHEN
            c.nome LIKE '%Circus'
        THEN
            REPLACE('Magic Circus',
                'Circus',
                'Pull Request')
    END AS novo_nome
FROM
    SpotifyClone.cancoes AS c
ORDER BY novo_nome
LIMIT 6 OFFSET 35
