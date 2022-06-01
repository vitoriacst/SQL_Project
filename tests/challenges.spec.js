const { readFileSync } = require('fs');
const { Sequelize } = require('sequelize');
const Importer = require('mysql-import');

describe('Queries de seleção', () => {
  let sequelize;

  beforeAll(async () => {
    const importer = new Importer(
      { user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, host: process.env.HOSTNAME, port: process.env.PORT },
    );

    try {
      await importer.import('./desafio1.sql');
    }
    catch(error) {
      console.log('Erro ao restaurar o dump!');
      console.log(error);
    }

    importer.disconnect();

    sequelize = new Sequelize('SpotifyClone', process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {host:process.env.HOSTNAME, port: process.env.PORT, dialect: 'mysql'})
  });

  afterAll(async () => {
    await sequelize.query('DROP DATABASE SpotifyClone;', { type: 'RAW' });
    sequelize.close();

    const importer = new Importer(
      { user: process.env.MYSQL_USER, password: process.env.MYSQL_PASSWORD, host: process.env.HOSTNAME, port: process.env.PORT }
    );
    await importer.import('./desafio1.sql');
    await importer.disconnect();
  });
  

  describe('1 - Normalize as tabelas para a 3ª Forma Normal', () => {
    const hasForeignKey = async (table, referencedTable) => {
      const [{ REFERENCE_COUNT: referenceCount }] = await sequelize.query(
        `SELECT COUNT(COLUMN_NAME) AS REFERENCE_COUNT
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE
          TABLE_SCHEMA = 'SpotifyClone'
            AND TABLE_NAME = '${table}'
            AND REFERENCED_TABLE_NAME = '${referencedTable}'
            AND REFERENCED_COLUMN_NAME = (
            SELECT COLUMN_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = 'SpotifyClone' AND TABLE_NAME = '${referencedTable}' AND CONSTRAINT_NAME = 'PRIMARY'
            );`,
        { type: 'SELECT' },
      );

      return (referenceCount === 1);
    };

    const composedPrimaryKey = async (table) => {
      const [{ PK_COUNT: pkCount }] = await sequelize.query(
        `SELECT COUNT(COLUMN_NAME) AS PK_COUNT
        FROM information_schema.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = 'SpotifyClone' AND TABLE_NAME = '${table}' AND CONSTRAINT_NAME = 'PRIMARY';`,
        { type: 'SELECT' },
      );

      return (pkCount > 1);
    };

    it('Verifica os planos', async () => {
      const {
        coluna_plano: planColumn,
        tabela_que_contem_plano: planTable,
        tabela_que_contem_usuario: userTable,
      } = JSON.parse(readFileSync('desafio1.json', 'utf8'));

      expect(planTable).not.toBe(userTable);

      const plansCount = await sequelize.query(
        `SELECT COUNT(${planColumn}) AS quantidade_planos FROM ${planTable};`,
        { type: 'SELECT' },
      );

      expect(plansCount).toEqual([{ quantidade_planos: 4 }]);

      expect(await hasForeignKey(userTable, planTable)).toBeTruthy();
    });

    it('Verifica o histórico de reprodução', async () => {
      const {
        coluna_historico_de_reproducoes: reproductionHistoryColumn,
        tabela_que_contem_historico_de_reproducoes: reproductionHistoryTable,
        tabela_que_contem_usuario: userTable,
        tabela_que_contem_cancoes: songTable,
      } = JSON.parse(readFileSync('desafio1.json', 'utf8'));

      expect(reproductionHistoryTable).not.toBe(userTable);
      expect(reproductionHistoryTable).not.toBe(songTable);

      const reproductionHistoryCount = await sequelize.query(
        `SELECT COUNT(${reproductionHistoryColumn}) AS musicas_escutadas FROM ${reproductionHistoryTable};`,
        { type: 'SELECT' },
      );

      expect(reproductionHistoryCount).toEqual([{ musicas_escutadas: 38 }]);

      expect(await hasForeignKey(reproductionHistoryTable, songTable)).toBeTruthy();
      expect(await hasForeignKey(reproductionHistoryTable, userTable)).toBeTruthy();
      expect(await composedPrimaryKey(reproductionHistoryTable)).toBeTruthy();
    });

    it('Verifica pessoas seguindo artistas', async () => {
      const {
        coluna_seguindo_artistas: followedArtistColumn,
        tabela_que_contem_seguindo_artistas: followingTable,
        tabela_que_contem_usuario: userTable,
        tabela_que_contem_artista: artistTable,
      } = JSON.parse(readFileSync('desafio1.json', 'utf8'));

      expect(followingTable).not.toBe(userTable);
      expect(followingTable).not.toBe(artistTable);

      const followedArtistsCount = await sequelize.query(
        `SELECT COUNT(${followedArtistColumn}) AS artistas_seguidos FROM ${followingTable};`,
        { type: 'SELECT' },
      );

      expect(followedArtistsCount).toEqual([{ artistas_seguidos: 22 }]);

      expect(await hasForeignKey(followingTable, artistTable)).toBeTruthy();
      expect(await hasForeignKey(followingTable, userTable)).toBeTruthy();
      expect(await composedPrimaryKey(followingTable)).toBeTruthy();
    });

    it('Verifica os álbuns', async () => {
      const {
        coluna_album: albumColumn,
        tabela_que_contem_album: albumTable,
        tabela_que_contem_artista: artistTable,
      } = JSON.parse(readFileSync('desafio1.json', 'utf8'));

      expect(albumTable).not.toBe(artistTable);

      const albumsCount = await sequelize.query(
        `SELECT COUNT(${albumColumn}) AS quantidade_albuns FROM ${albumTable};`,
        { type: 'SELECT' },
      );

      expect(albumsCount).toEqual([{ quantidade_albuns: 10 }]);

      expect(await hasForeignKey(albumTable, artistTable)).toBeTruthy();
    });

    it('Verifica as canções', async () => {
      const {
        coluna_cancoes: songColumn,
        tabela_que_contem_cancoes: songTable,
        tabela_que_contem_album: albumTable,
      } = JSON.parse(readFileSync('desafio1.json', 'utf8'));

      expect(songTable).not.toBe(albumTable);

      const songsCount = await sequelize.query(
        `SELECT COUNT(${songColumn}) AS quantidade_cancoes FROM ${songTable};`,
        { type: 'SELECT' },
      );

      expect(songsCount).toEqual([{ quantidade_cancoes: 40 }]);

      expect(await hasForeignKey(songTable, albumTable)).toBeTruthy();
    });

    it('Verifica as pessoas usuárias', async () => {
      const {
        coluna_usuario: userColumn,
        tabela_que_contem_usuario: userTable,
      } = JSON.parse(readFileSync('desafio1.json', 'utf8'));

      const usersCount = await sequelize.query(
        `SELECT COUNT(${userColumn}) AS quantidade_usuarios FROM ${userTable};`,
        { type: 'SELECT' },
      );

      expect(usersCount).toEqual([{ quantidade_usuarios: 10 }]);
    });

    it('Verifica as pessoas artistas', async () => {
      const {
        coluna_artista: artistColumn,
        tabela_que_contem_artista: artistTable,
      } = JSON.parse(readFileSync('desafio1.json', 'utf8'));

      const artistsCount = await sequelize.query(
        `SELECT COUNT(${artistColumn}) AS quantidade_artistas FROM ${artistTable};`,
        { type: 'SELECT' },
      );

      expect(artistsCount).toEqual([{ quantidade_artistas: 6 }]);
    });
  });

  describe('2 - Exibe as estatísticas musicais', () => {
    it('Verifica o desafio 2', async () => {
      const challengeQuery = readFileSync('desafio2.sql', 'utf8');

      const result = await sequelize.query(challengeQuery, { type: 'SELECT' });

      expect(result).toEqual([{ cancoes: 40, artistas: 6, albuns: 10 }]);
    });
  });

  describe('3 - Exibe o histórico de reprodução para cada pessoa usuária', () => {
    it('Verifica o desafio 3', async () => {
      const challengeQuery = readFileSync('desafio3.sql', 'utf8');

      const result = await sequelize.query(challengeQuery, { type: 'SELECT' });

      const expectedResult = [
        { usuario: 'Angelina', qtde_musicas_ouvidas: 4, total_minutos: "13.47" },
        { usuario: 'Bill', qtde_musicas_ouvidas: 3, total_minutos: "5.93" },
        { usuario: 'Carol', qtde_musicas_ouvidas: 4, total_minutos: "8.60" },
        { usuario: 'Cintia', qtde_musicas_ouvidas: 4, total_minutos: "9.10" },
        { usuario: 'Norman', qtde_musicas_ouvidas: 4, total_minutos: "14.52" },
        { usuario: 'Patrick', qtde_musicas_ouvidas: 4, total_minutos: "11.67" },
        { usuario: 'Paul', qtde_musicas_ouvidas: 4, total_minutos: "13.12" },
        { usuario: 'Roger', qtde_musicas_ouvidas: 3, total_minutos: "7.73" },
        { usuario: 'Thati', qtde_musicas_ouvidas: 5, total_minutos: "14.63" },
        { usuario: 'Vivian', qtde_musicas_ouvidas: 3, total_minutos: "8.35" },
      ];

      expect(result).toEqual(expectedResult);
    });
  });

  describe('4 - Exibe a condicao do usuario se esta ativo ou inativo', () => {
    it('Verifica o desafio 4', async () => {
      const challengeQuery = readFileSync('desafio4.sql', 'utf8');

      const result = await sequelize.query(challengeQuery, { type: 'SELECT' });

      const expectedResult = [
        { usuario: 'Angelina', condicao_usuario: 'Usuário ativo' },
        { usuario: 'Bill', condicao_usuario: 'Usuário inativo' },
        { usuario: 'Carol', condicao_usuario: 'Usuário ativo' },
        { usuario: 'Cintia', condicao_usuario: 'Usuário inativo' },
        { usuario: 'Norman', condicao_usuario: 'Usuário inativo' },
        { usuario: 'Patrick', condicao_usuario: 'Usuário inativo' },
        { usuario: 'Paul', condicao_usuario: 'Usuário inativo' },
        { usuario: 'Roger', condicao_usuario: 'Usuário ativo' },
        { usuario: 'Thati', condicao_usuario: 'Usuário inativo' },
        { usuario: 'Vivian', condicao_usuario: 'Usuário inativo' },
      ];

      expect(result).toEqual(expectedResult);
    });
  });

  describe('5 - Exibe top 2 hits mais tocados no momento', () => {
    it('Verifica o desafio 5', async () => {
      const challengeQuery = readFileSync('desafio5.sql', 'utf8');

      const result = await sequelize.query(challengeQuery, { type: 'SELECT' });

      const expectedResult = [
        { cancao: 'Baby', reproducoes: 2 },
        { cancao: 'Diamond Power', reproducoes: 2 },
      ];

      expect(result).toEqual(expectedResult);
    });
  });

  describe('6 - Exibe o relatório de faturamento da empresa', () => {
    it('Verifica o desafio 6', async () => {
      const challengeQuery = readFileSync('desafio6.sql', 'utf8');

      const result = await sequelize.query(challengeQuery, { type: 'SELECT' });

      const expectedResult = [
        {
          faturamento_maximo: '7.99',
          faturamento_medio: '6.39',
          faturamento_minimo: '0.00',
          faturamento_total: '63.91',
        },
      ];

      expect(result).toEqual(expectedResult);
    });
  });

  describe('7 - Exibe uma relação de todos os álbuns produzidos por cada artista', () => {
    it('Verifica o desafio 7', async () => {
      const challengeQuery = readFileSync('desafio7.sql', 'utf8');

      const result = await sequelize.query(challengeQuery, { type: 'SELECT' });

      const expectedResult = [
        { album: 'Envious', artista: 'Walter Phoenix', seguidores: 5 },
        { album: 'Exuberant', artista: 'Walter Phoenix', seguidores: 5 },
        { album: 'Apparatus', artista: 'Fog', seguidores: 4 },
        { album: 'Incandescent', artista: 'Lance Day', seguidores: 4 },
        { album: 'Library of liberty', artista: 'Freedie Shannon', seguidores: 3 },
        { album: 'Temporary Culture', artista: 'Freedie Shannon', seguidores: 3 },
        { album: 'Hallowed Steam', artista: 'Peter Strong', seguidores: 3 },
        { album: 'Cabinet of fools', artista: 'Tyler Isle', seguidores: 3 },
        { album: 'Chained Down', artista: 'Tyler Isle', seguidores: 3 },
        { album: 'No guarantees', artista: 'Tyler Isle', seguidores: 3 },
      ];

      expect(result).toEqual(expectedResult);
    });
  });

  describe('8 - Exibe uma relação de álbuns produzidos pelo artista Walter Phoenix', () => {
    it('Verifica o desafio 8', async () => {
      const challengeQuery = readFileSync('desafio8.sql', 'utf8');

      const result = await sequelize.query(challengeQuery, { type: 'SELECT' });

      const expectedResult = [
        { album: 'Envious', artista: 'Walter Phoenix' },
        { album: 'Exuberant', artista: 'Walter Phoenix' },
      ];

      expect(result).toEqual(expectedResult);
    });
  });

  describe('9 - Exibe a quantidade de músicas que estão presentes atualmente no histórico de reprodução da pessoa usuária Bill', () => {
    it('Verifica o desafio 9', async () => {
      const challengeQuery = readFileSync('desafio9.sql', 'utf8');

      const result = await sequelize.query(challengeQuery, { type: 'SELECT' });

      expect(result).toEqual([{ quantidade_musicas_no_historico: 3 }]);
    });
  });

  describe('10 - Exibe o nome e a quantidade de vezes que cada canção foi tocada por pessoas usuárias do plano gratuito ou pessoal', () => {
    it('Verifica o desafio 10', async () => {
      const challengeQuery = readFileSync('desafio10.sql', 'utf8');

      const result = await sequelize.query(challengeQuery, { type: 'SELECT' });

      const expectedResult = [
        { nome: 'Diamond Power', reproducoes: 2 },
        { nome: 'Honey', reproducoes: 1 },
        { nome: 'Honey, I\'m A Lone Wolf', reproducoes: 1 },
        { nome: 'Honey, So Do I', reproducoes: 1 },
        { nome: 'I Ride Alone', reproducoes: 1 },
        { nome: 'Let\'s Be Silly', reproducoes: 1 },
        { nome: 'Reflections Of Magic', reproducoes: 1 },
        { nome: 'Rock His Everything', reproducoes: 1 },
        { nome: 'Soul For Us', reproducoes: 1 },
        { nome: 'Walking And Man', reproducoes: 1 },
        { nome: 'Young And Father', reproducoes: 1 },
      ];

      expect(result).toEqual(expectedResult);
    });
  });

  describe('11 - Exibe nomes de musicas em sua forma normal e com string trocada', () => {
    it('Verifica o desafio 11', async () => {
      const challengeQuery = readFileSync('desafio11.sql', 'utf8');

      const result = await sequelize.query(challengeQuery, { type: 'SELECT' });

      const expectedResult = [
        { nome_musica: 'Dance With Her Own', novo_nome: 'Dance With Trybe' },
        { nome_musica: 'Let\'s Be Silly', novo_nome: 'Let\'s Be Nice' },
        { nome_musica: 'Magic Circus', novo_nome: 'Magic Pull Request' },
        { nome_musica: 'Troubles Of My Inner Fire', novo_nome: 'Troubles Of My Project' },
        { nome_musica: 'Without My Streets', novo_nome: 'Without My Code Review' },
      ];

      expect(result).toEqual(expectedResult);
    });
  });
});
