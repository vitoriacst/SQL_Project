SELECT A.usuario AS usuario, IF(MAX(year(R.data_reproducao ))=2021 ,'Usuário ativo','Usuário inativo' ) AS condicao_usuario
 From SpotifyClone.usuarios AS A 
 INNER JOIN SpotifyClone.reproducoes AS R
 ON A.usuario_id = R.usuario_id
 group by usuario
 order by usuario ASC;