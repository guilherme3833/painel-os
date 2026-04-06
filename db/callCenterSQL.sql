/*
SQLyog Ultimate v12.09 (64 bit)
MySQL - 10.6.20-MariaDB : Database - octekmys_callcenter
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`octekmys_callcenter` /*!40100 DEFAULT CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci */;

/*Table structure for table `Ordem_Servico` */

CREATE TABLE `Ordem_Servico` (
  `codigo` int(11) NOT NULL AUTO_INCREMENT,
  `numero` int(11) NOT NULL,
  `data_abertura` date DEFAULT NULL,
  `data_encerramento` date DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `descricao` longtext DEFAULT NULL,
  `observacao` longtext DEFAULT NULL,
  `arquivo_pdf` varchar(200) DEFAULT NULL,
  `encerrado` varchar(1) DEFAULT 'n',
  `id_clientes` int(11) DEFAULT NULL,
  `foto_01` varchar(255) DEFAULT NULL,
  `foto_02` varchar(255) DEFAULT NULL,
  `foto_03` varchar(255) DEFAULT NULL,
  `foto_04` varchar(255) DEFAULT NULL,
  `foto_05` varchar(255) DEFAULT NULL,
  `atualizado_em` timestamp NULL DEFAULT NULL COMMENT 'Última sincronização automática',
  `cogesan_os` varchar(20) DEFAULT NULL COMMENT 'Número da OS no Cogesam',
  `uc` varchar(50) DEFAULT NULL COMMENT 'Unidade Consumidora',
  `hidrometro` varchar(50) DEFAULT NULL COMMENT 'Hidrômetro',
  `servico` varchar(255) DEFAULT NULL COMMENT 'Serviço solicitado',
  `endereco_final` varchar(500) DEFAULT NULL COMMENT 'Endereço final',
  `solicitante` varchar(255) DEFAULT NULL COMMENT 'Solicitante',
  `contato_solicitante` varchar(100) DEFAULT NULL COMMENT 'Contato do solicitante',
  `executor` varchar(255) DEFAULT NULL COMMENT 'Executor da OS',
  `situacao_descricao` varchar(100) DEFAULT NULL COMMENT 'Situação retornada pelo Cogesam',
  `data_criacao_cogesan` datetime DEFAULT NULL COMMENT 'Data/hora de criação no Cogesam (DataCriacao)',
  `data_limite_execucao` date DEFAULT NULL COMMENT 'Data limite para execução (DataLimiteExecucao)',
  `data_situacao` date DEFAULT NULL COMMENT 'Data da situação atual (DataSituacao)',
  `data_inicio_execucao` datetime DEFAULT NULL COMMENT 'Data/hora de início da execução (DataInicioExecucao)',
  `data_fim_execucao` datetime DEFAULT NULL COMMENT 'Data/hora de fim da execução (DataFimExecucao)',
  `latitude` varchar(30) DEFAULT NULL,
  `longitude` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`codigo`)
) ENGINE=InnoDB AUTO_INCREMENT=76144 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `Seguranca_apps` */

CREATE TABLE `Seguranca_apps` (
  `app_name` varchar(128) NOT NULL,
  `app_type` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`app_name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `Seguranca_groups` */

CREATE TABLE `Seguranca_groups` (
  `group_id` int(11) NOT NULL AUTO_INCREMENT,
  `description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`group_id`),
  UNIQUE KEY `description` (`description`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `Seguranca_groups_apps` */

CREATE TABLE `Seguranca_groups_apps` (
  `group_id` int(11) NOT NULL,
  `app_name` varchar(128) NOT NULL,
  `priv_access` varchar(2) DEFAULT NULL,
  `priv_insert` varchar(2) DEFAULT NULL,
  `priv_delete` varchar(2) DEFAULT NULL,
  `priv_update` varchar(2) DEFAULT NULL,
  `priv_export` varchar(2) DEFAULT NULL,
  `priv_print` varchar(2) DEFAULT NULL,
  PRIMARY KEY (`group_id`,`app_name`),
  KEY `Seguranca_groups_apps_ibfk_2` (`app_name`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `Seguranca_logged` */

CREATE TABLE `Seguranca_logged` (
  `login` varchar(255) NOT NULL,
  `date_login` varchar(128) DEFAULT NULL,
  `sc_session` varchar(32) DEFAULT NULL,
  `ip` varchar(32) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `Seguranca_users` */

CREATE TABLE `Seguranca_users` (
  `login` varchar(255) NOT NULL,
  `pswd` varchar(255) NOT NULL,
  `name` varchar(64) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `active` varchar(1) DEFAULT NULL,
  `activation_code` varchar(32) DEFAULT NULL,
  `priv_admin` varchar(1) DEFAULT NULL,
  `cliente` varchar(1) DEFAULT NULL,
  `id_clientes` int(11) DEFAULT NULL,
  PRIMARY KEY (`login`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `Seguranca_users_groups` */

CREATE TABLE `Seguranca_users_groups` (
  `login` varchar(255) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`login`,`group_id`),
  KEY `Seguranca_users_groups_ibfk_2` (`group_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `Status_OS` */

CREATE TABLE `Status_OS` (
  `id_status` int(11) NOT NULL AUTO_INCREMENT,
  `nome_status` varchar(30) DEFAULT NULL,
  `texto` text DEFAULT NULL,
  `encerra` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id_status`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `attendants` */

CREATE TABLE `attendants` (
  `id` char(36) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `photo` text DEFAULT NULL,
  `status` tinyint(1) DEFAULT 0,
  `principal` tinyint(1) DEFAULT 0,
  `pinned` tinyint(1) DEFAULT 0,
  `pinned_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `avisos` */

CREATE TABLE `avisos` (
  `id_aviso` int(11) NOT NULL AUTO_INCREMENT,
  `texto_aviso` longtext DEFAULT NULL,
  `ativo` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id_aviso`)
) ENGINE=InnoDB AUTO_INCREMENT=88 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `backup_arquivos` */

CREATE TABLE `backup_arquivos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `caminho` varchar(500) NOT NULL,
  `status` enum('pendente','concluido','erro') DEFAULT 'pendente',
  `drive_id` varchar(100) DEFAULT NULL,
  `erro_msg` varchar(255) DEFAULT NULL,
  `tentativas` int(11) DEFAULT 0,
  `criado_em` datetime DEFAULT current_timestamp(),
  `concluido_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unico_nome` (`nome`)
) ENGINE=InnoDB AUTO_INCREMENT=155080 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `backup_controle` */

CREATE TABLE `backup_controle` (
  `chave` varchar(50) NOT NULL,
  `valor` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`chave`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `chamados` */

CREATE TABLE `chamados` (
  `protocolo` varchar(17) NOT NULL,
  `id_tipo` int(11) NOT NULL,
  `id_clientes` int(11) NOT NULL,
  `descricao` text DEFAULT NULL,
  `telefone` varchar(45) DEFAULT NULL,
  `celular` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `usuario` varchar(90) DEFAULT NULL,
  `codigo_usuario` int(11) DEFAULT NULL,
  `os` varchar(20) DEFAULT NULL,
  `data` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `id_status` int(11) DEFAULT NULL,
  `atendente` varchar(90) DEFAULT NULL,
  `numero_identificado` varchar(45) DEFAULT NULL,
  `CEP` varchar(8) DEFAULT NULL,
  `logradouro` varchar(90) DEFAULT NULL,
  `numero_endereco` varchar(45) DEFAULT NULL,
  `bairro` varchar(45) DEFAULT NULL,
  `cidade` varchar(45) DEFAULT NULL,
  `UF` varchar(2) DEFAULT NULL,
  `audio` varchar(90) DEFAULT NULL,
  `sms` varchar(1) DEFAULT NULL,
  `codigo_OS` int(11) DEFAULT NULL,
  `status_sms` varchar(2) DEFAULT NULL,
  `id_sms` int(11) DEFAULT NULL,
  `sms_enviado` varchar(10) DEFAULT NULL,
  `sms_retorno` varchar(1) DEFAULT NULL,
  `id_sms_retorno` varchar(8) DEFAULT NULL,
  `latitude` varchar(20) DEFAULT NULL,
  `longitude` varchar(20) DEFAULT NULL,
  `encerrado` varchar(1) DEFAULT NULL,
  `atribuido` varchar(90) DEFAULT NULL,
  `ultimo_id_fluxo` int(11) DEFAULT NULL,
  `encerrado_usuario` varchar(90) DEFAULT NULL,
  `IA_transcricao` text DEFAULT NULL,
  `IA_sentimento` varchar(20) DEFAULT NULL,
  `IA_aval_geral` int(1) DEFAULT NULL,
  `IA_escuta_tiva` int(1) DEFAULT NULL,
  `IA_clareza_comunicacao` int(1) DEFAULT NULL,
  `IA_empatia_cordialidade` int(1) DEFAULT NULL,
  `IA_controle_do_atendimento` int(1) DEFAULT NULL,
  `IA_objetividade` int(1) DEFAULT NULL,
  `IA_avaliacao` text DEFAULT NULL,
  `canal_comunicacao` varchar(10) DEFAULT NULL,
  `protocolo_canal` varchar(15) DEFAULT NULL,
  `ouvidoria` varchar(1) NOT NULL DEFAULT 'n',
  `log_encerramento` text DEFAULT NULL,
  PRIMARY KEY (`protocolo`),
  KEY `id_tipo` (`id_tipo`),
  KEY `id_clientes` (`id_clientes`),
  KEY `id_status` (`id_status`),
  KEY `encerrado` (`encerrado`),
  KEY `idx_chamados_data` (`data`),
  KEY `idx_chamados_status` (`id_status`),
  CONSTRAINT `chamados_ibfk_1` FOREIGN KEY (`id_tipo`) REFERENCES `tipos` (`id_tipo`),
  CONSTRAINT `chamados_ibfk_2` FOREIGN KEY (`id_clientes`) REFERENCES `clientes` (`id_clientes`),
  CONSTRAINT `chamados_ibfk_3` FOREIGN KEY (`id_status`) REFERENCES `status` (`id_status`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `chat_attendants` */

CREATE TABLE `chat_attendants` (
  `id` char(36) NOT NULL,
  `chat_id` char(36) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `name` varchar(100) DEFAULT NULL,
  `photo` text DEFAULT NULL,
  `status` tinyint(1) DEFAULT NULL,
  `principal` tinyint(1) DEFAULT NULL,
  `pinned` tinyint(1) DEFAULT NULL,
  `pinned_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `chat_id` (`chat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `chat_attendants_map` */

CREATE TABLE `chat_attendants_map` (
  `chat_id` varchar(100) NOT NULL,
  `attendant_id` varchar(100) NOT NULL,
  PRIMARY KEY (`chat_id`,`attendant_id`),
  KEY `fk_map_attendant` (`attendant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `chat_contacts` */

CREATE TABLE `chat_contacts` (
  `id` char(36) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `telephone` varchar(30) DEFAULT NULL,
  `photo` text DEFAULT NULL,
  `country` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `chat_departments` */

CREATE TABLE `chat_departments` (
  `id` char(36) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `entry` tinyint(1) DEFAULT NULL,
  `view_permission` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `chat_instances` */

CREATE TABLE `chat_instances` (
  `id` char(36) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `telephone` varchar(30) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `webhooks` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `chat_log_msg_enviadas` */

CREATE TABLE `chat_log_msg_enviadas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `data_hora` datetime DEFAULT current_timestamp(),
  `telefone` varchar(30) DEFAULT NULL,
  `retorno_http` int(11) DEFAULT NULL,
  `retorno_json` longtext DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4806 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `chat_webhook` */

CREATE TABLE `chat_webhook` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `chat_id` varchar(50) DEFAULT NULL,
  `chat_flow` varchar(50) DEFAULT NULL,
  `chat_type` varchar(50) DEFAULT NULL,
  `chat_client` varchar(50) DEFAULT NULL,
  `chat_status` varchar(50) DEFAULT NULL,
  `chat_protocol` int(11) DEFAULT NULL,
  `chat_created_at` datetime DEFAULT NULL,
  `chat_updated_at` datetime DEFAULT NULL,
  `chat_whatsapp_chat_id` varchar(100) DEFAULT NULL,
  `contact_id` varchar(50) DEFAULT NULL,
  `contact_name` varchar(100) DEFAULT NULL,
  `contact_telephone` varchar(20) DEFAULT NULL,
  `contact_country` varchar(10) DEFAULT NULL,
  `contact_photo` text DEFAULT NULL,
  `instance_id` varchar(50) DEFAULT NULL,
  `instance_name` varchar(100) DEFAULT NULL,
  `instance_type` varchar(50) DEFAULT NULL,
  `instance_telephone` varchar(20) DEFAULT NULL,
  `attendant_id` varchar(50) DEFAULT NULL,
  `attendant_name` varchar(100) DEFAULT NULL,
  `attendant_email` varchar(100) DEFAULT NULL,
  `attendant_principal` tinyint(1) DEFAULT NULL,
  `department_id` varchar(50) DEFAULT NULL,
  `department_name` varchar(100) DEFAULT NULL,
  `department_entry` tinyint(1) DEFAULT NULL,
  `department_permission` varchar(50) DEFAULT NULL,
  `message_id` varchar(50) DEFAULT NULL,
  `message_type` varchar(50) DEFAULT NULL,
  `message_stage` varchar(50) DEFAULT NULL,
  `message_text` text DEFAULT NULL,
  `message_original_text` text DEFAULT NULL,
  `message_from_me` tinyint(1) DEFAULT NULL,
  `message_sent_at` datetime DEFAULT NULL,
  `message_sender_id` varchar(50) DEFAULT NULL,
  `message_sender_name` varchar(100) DEFAULT NULL,
  `message_sender_email` varchar(100) DEFAULT NULL,
  `message_sender_status` tinyint(1) DEFAULT NULL,
  `message_sender_login_status` varchar(50) DEFAULT NULL,
  `message_created_at` datetime DEFAULT NULL,
  `message_updated_at` datetime DEFAULT NULL,
  `message_fail_reason` text DEFAULT NULL,
  `message_whatsapp_id` varchar(100) DEFAULT NULL,
  `event_type` varchar(50) DEFAULT NULL,
  `event_time` datetime DEFAULT NULL,
  `json_raw` longtext DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_chat_webhook` (`chat_protocol`)
) ENGINE=InnoDB AUTO_INCREMENT=1218195 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `chats` */

CREATE TABLE `chats` (
  `id` char(36) NOT NULL,
  `protocol` int(11) DEFAULT NULL,
  `instance_id` char(36) DEFAULT NULL,
  `department_id` char(36) DEFAULT NULL,
  `contact_id` char(36) DEFAULT NULL,
  `type` varchar(30) DEFAULT NULL,
  `origin` varchar(30) DEFAULT NULL,
  `flow` varchar(30) DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `crm_column` varchar(100) DEFAULT NULL,
  `finish_reason` varchar(100) DEFAULT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `expirate_at` datetime DEFAULT NULL,
  `unread_messages` int(11) DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `fk_chats_instance` (`instance_id`),
  KEY `fk_chats_department` (`department_id`),
  KEY `fk_chats_contact` (`contact_id`),
  CONSTRAINT `fk_chats_contact` FOREIGN KEY (`contact_id`) REFERENCES `chat_contacts` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_chats_department` FOREIGN KEY (`department_id`) REFERENCES `chat_departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_chats_instance` FOREIGN KEY (`instance_id`) REFERENCES `chat_instances` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `clientes` */

CREATE TABLE `clientes` (
  `id_clientes` int(11) NOT NULL AUTO_INCREMENT,
  `razao_social_cliente` varchar(90) NOT NULL,
  `nome_cliente` varchar(90) DEFAULT NULL,
  `cnpj_cpf` varchar(45) DEFAULT NULL,
  `telefone_cliente` varchar(45) DEFAULT NULL,
  `email_cliente` varchar(80) DEFAULT NULL,
  `site_cliente` varchar(45) DEFAULT NULL,
  `CEP` varchar(8) DEFAULT NULL,
  `logradouro` varchar(90) DEFAULT NULL,
  `numero_endereco` varchar(45) DEFAULT NULL,
  `bairro` varchar(45) DEFAULT NULL,
  `cidade` varchar(45) DEFAULT NULL,
  `UF` varchar(2) DEFAULT NULL,
  `obs_cliente` tinytext DEFAULT NULL,
  `SMS_abre` varchar(140) DEFAULT NULL,
  `SMS_fecha` varchar(140) DEFAULT NULL,
  `status_envio_sms` int(11) DEFAULT NULL,
  `status_sem_envio_sms` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_clientes`)
) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

/*Table structure for table `clientes_saae` */

CREATE TABLE `clientes_saae` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uc` varchar(50) NOT NULL,
  `responsavel` varchar(255) DEFAULT NULL,
  `endereco` varchar(500) DEFAULT NULL,
  `localizacao` varchar(255) DEFAULT NULL,
  `situacao` varchar(100) DEFAULT NULL,
  `grupo` varchar(100) DEFAULT NULL,
  `criado_em` timestamp NOT NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_uc` (`uc`)
) ENGINE=InnoDB AUTO_INCREMENT=149103 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `csv_os_config` */

CREATE TABLE `csv_os_config` (
  `id` tinyint(1) NOT NULL DEFAULT 1,
  `separador` varchar(1) NOT NULL DEFAULT ';',
  `status_executado` varchar(30) NOT NULL DEFAULT 'EXECUTADO',
  `idx_os` tinyint(2) NOT NULL DEFAULT 0,
  `idx_status` tinyint(2) NOT NULL DEFAULT 8,
  `idx_data` tinyint(2) NOT NULL DEFAULT 9,
  `idx_solucao` tinyint(2) NOT NULL DEFAULT 23,
  `id_status_os_enc` int(11) NOT NULL DEFAULT 2,
  `id_status_cham_enc` int(11) NOT NULL DEFAULT 5,
  `lote_insert` int(11) NOT NULL DEFAULT 100,
  `wpp_lote` int(11) NOT NULL DEFAULT 50,
  `wpp_hora_ini` tinyint(2) NOT NULL DEFAULT 8,
  `wpp_hora_fim` tinyint(2) NOT NULL DEFAULT 20,
  `wpp_max_dias` int(11) NOT NULL DEFAULT 30,
  `wpp_ativo` varchar(1) NOT NULL DEFAULT 's',
  PRIMARY KEY (`id`),
  CONSTRAINT `csv_os_config_unico` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `documentos_chamado` */

CREATE TABLE `documentos_chamado` (
  `id_documento` int(11) NOT NULL AUTO_INCREMENT,
  `nome_documento` varchar(100) DEFAULT NULL,
  `id_chamado` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`id_documento`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `fluxo_chamado` */

CREATE TABLE `fluxo_chamado` (
  `id_fluxo` float NOT NULL AUTO_INCREMENT,
  `protocolo` varchar(12) DEFAULT NULL,
  `login_passador` varchar(90) DEFAULT NULL,
  `login_recebido` varchar(90) DEFAULT NULL,
  `dia_recebido` date DEFAULT NULL,
  `hora_recebido` time DEFAULT NULL,
  `descricao` varchar(250) DEFAULT NULL,
  `dia_finalizado` date DEFAULT NULL,
  `hora_finalizado` time DEFAULT NULL,
  `solucao` varchar(250) DEFAULT NULL,
  `finalizado` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id_fluxo`)
) ENGINE=InnoDB AUTO_INCREMENT=259004 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `horarios_funcionamento` */

CREATE TABLE `horarios_funcionamento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dia_semana` enum('segunda','terça','quarta','quinta','sexta','sábado','domingo') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fim` time NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dia_semana` (`dia_semana`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `info_sistema` */

CREATE TABLE `info_sistema` (
  `id_info_sistema` int(11) NOT NULL,
  `pasta_arquivos` varchar(200) DEFAULT NULL,
  `mensagem_inicial` text DEFAULT NULL,
  `saldo_sms` int(11) DEFAULT NULL,
  `sms_market_password` varchar(20) DEFAULT NULL,
  `sms_market_user` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_info_sistema`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `ocorrencia` */

CREATE TABLE `ocorrencia` (
  `id_ocorrencia` int(11) NOT NULL AUTO_INCREMENT,
  `data` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `solucao` text DEFAULT NULL,
  `data_solucao` date DEFAULT NULL,
  `hora_solucao` time DEFAULT NULL,
  `protocolo` varchar(17) NOT NULL,
  `atendente` varchar(90) DEFAULT NULL,
  `audio` varchar(90) DEFAULT NULL,
  PRIMARY KEY (`id_ocorrencia`),
  KEY `protocolo` (`protocolo`),
  CONSTRAINT `ocorrencia_ibfk_1` FOREIGN KEY (`protocolo`) REFERENCES `chamados` (`protocolo`)
) ENGINE=InnoDB AUTO_INCREMENT=271591 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `openai` */

CREATE TABLE `openai` (
  `id_openai` int(11) NOT NULL DEFAULT 1,
  `token` varchar(500) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
  PRIMARY KEY (`id_openai`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;

/*Table structure for table `pesquisa` */

CREATE TABLE `pesquisa` (
  `id_pesquisa` int(11) NOT NULL AUTO_INCREMENT,
  `Call_id` varchar(40) DEFAULT NULL,
  `DID` varchar(20) DEFAULT NULL,
  `DNIS` varbinary(60) DEFAULT NULL,
  `ramal_transfere` varchar(8) DEFAULT NULL,
  `audio_folder` varchar(200) DEFAULT NULL,
  `discador` varchar(20) DEFAULT NULL,
  `dia` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `nota_tempo_espera` int(11) DEFAULT NULL,
  `nota_cordialidade` int(11) DEFAULT NULL,
  `nota_clareza` int(11) DEFAULT NULL,
  `nota_geral` int(11) DEFAULT NULL,
  `nota_resolvido` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_pesquisa`)
) ENGINE=InnoDB AUTO_INCREMENT=622 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `protocolo` */

CREATE TABLE `protocolo` (
  `protocolo` varchar(12) NOT NULL,
  PRIMARY KEY (`protocolo`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `responsavel_chamado` */

CREATE TABLE `responsavel_chamado` (
  `id_resp` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(255) NOT NULL,
  `protocolo` varchar(12) DEFAULT NULL,
  PRIMARY KEY (`id_resp`),
  KEY `protocolo` (`protocolo`),
  CONSTRAINT `responsavel_chamado_ibfk_1` FOREIGN KEY (`protocolo`) REFERENCES `chamados` (`protocolo`)
) ENGINE=InnoDB AUTO_INCREMENT=20026 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `ruascadastradas` */

CREATE TABLE `ruascadastradas` (
  `id_ruascadastrada` float NOT NULL AUTO_INCREMENT,
  `UF_ruacadastrada` varchar(2) DEFAULT NULL,
  `cidade_ruacadastrada` varchar(30) DEFAULT NULL,
  `bairro_ruacadastrada` varchar(30) DEFAULT NULL,
  `rua_ruacadastrada` varchar(50) DEFAULT NULL,
  `cep_ruacadastrada` varchar(8) DEFAULT NULL,
  PRIMARY KEY (`id_ruascadastrada`)
) ENGINE=InnoDB AUTO_INCREMENT=263 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `sc_log` */

CREATE TABLE `sc_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inserted_date` datetime DEFAULT NULL,
  `username` varchar(90) NOT NULL,
  `application` varchar(200) NOT NULL,
  `creator` varchar(30) NOT NULL,
  `ip_user` varchar(32) NOT NULL,
  `action` varchar(30) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=7719566 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `sc_log1` */

CREATE TABLE `sc_log1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `inserted_date` datetime DEFAULT NULL,
  `username` varchar(90) NOT NULL,
  `application` varchar(200) NOT NULL,
  `creator` varchar(30) NOT NULL,
  `ip_user` varchar(32) NOT NULL,
  `action` varchar(30) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=900219 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `sm_integracoes` */

CREATE TABLE `sm_integracoes` (
  `id_integracoes` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(50) DEFAULT NULL,
  `id_clientes` int(11) DEFAULT NULL,
  `id_tipo` int(11) DEFAULT NULL,
  `id_status` int(11) DEFAULT NULL,
  `canal_comunicacao` varchar(20) DEFAULT NULL,
  `direciona_true` varchar(50) DEFAULT NULL,
  `direciona_false` varchar(50) DEFAULT NULL,
  `texto_envio` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_integracoes`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `smclick_config` */

CREATE TABLE `smclick_config` (
  `id` tinyint(1) NOT NULL DEFAULT 1,
  `api_key` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `smclick_config_unico` CHECK (`id` = 1)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `smclick_instancias` */

CREATE TABLE `smclick_instancias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(100) NOT NULL,
  `instance_id` varchar(100) NOT NULL,
  `ativo` varchar(1) NOT NULL DEFAULT 's',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `smclick_templates` */

CREATE TABLE `smclick_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(100) NOT NULL,
  `template_id` varchar(100) NOT NULL,
  `ativo` varchar(1) NOT NULL DEFAULT 's',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*Table structure for table `status` */

CREATE TABLE `status` (
  `id_status` int(11) NOT NULL AUTO_INCREMENT,
  `nome_status` varchar(45) DEFAULT NULL,
  `encerra` varchar(1) DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `ativo` varchar(1) DEFAULT 's',
  PRIMARY KEY (`id_status`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `teste` */

CREATE TABLE `teste` (
  `ramal` varchar(4) NOT NULL,
  `teste` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ramal`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `tipos` */

CREATE TABLE `tipos` (
  `id_tipo` int(11) NOT NULL AUTO_INCREMENT,
  `nome_tipo` varchar(50) NOT NULL,
  `texto` text DEFAULT NULL,
  `prazo` int(11) NOT NULL,
  `prioridade` int(11) DEFAULT NULL,
  `id_clientes` int(11) DEFAULT NULL,
  `cor` varchar(10) DEFAULT NULL,
  `usado` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id_tipo`),
  KEY `id_clientes` (`id_clientes`),
  CONSTRAINT `tipos_ibfk_1` FOREIGN KEY (`id_clientes`) REFERENCES `clientes` (`id_clientes`)
) ENGINE=InnoDB AUTO_INCREMENT=222 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `tmp_os_csv` */

CREATE TABLE `tmp_os_csv` (
  `numero` int(11) NOT NULL,
  `data_enc` date NOT NULL,
  `solucao` text DEFAULT NULL,
  PRIMARY KEY (`numero`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `tmp_wpp_send` */

CREATE TABLE `tmp_wpp_send` (
  `protocolo` varchar(17) NOT NULL,
  `telefone` varchar(45) DEFAULT NULL,
  `data_abertura` date DEFAULT NULL,
  `tipo_servico` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`protocolo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `usuario_tipos` */

CREATE TABLE `usuario_tipos` (
  `id_usu_tipos` int(11) NOT NULL AUTO_INCREMENT,
  `login` varchar(255) DEFAULT NULL,
  `id_tipo` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_usu_tipos`),
  KEY `login` (`login`),
  KEY `id_tipo` (`id_tipo`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `whats_App_contatos` */

CREATE TABLE `whats_App_contatos` (
  `id_wapp_contato` int(11) NOT NULL AUTO_INCREMENT,
  `chatId` varchar(100) DEFAULT NULL,
  `wapp_nome` varchar(100) DEFAULT NULL,
  `wapp_tipo` varchar(10) DEFAULT NULL,
  `tipo_contato` text DEFAULT NULL,
  `status_chat` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_wapp_contato`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `whats_App_me_ligue` */

CREATE TABLE `whats_App_me_ligue` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `chatId` varchar(100) DEFAULT NULL,
  `wapp_nome` tinytext DEFAULT NULL,
  `ligar` int(11) DEFAULT NULL,
  `Resolvido` tinytext DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `whats_App_msg` */

CREATE TABLE `whats_App_msg` (
  `id_msg` int(11) NOT NULL AUTO_INCREMENT,
  `msgNumber` varchar(225) DEFAULT NULL,
  `whoSent` varchar(225) DEFAULT NULL,
  `cellPhone` varchar(225) DEFAULT NULL,
  `chatId` varchar(100) DEFAULT NULL,
  `name` varchar(225) DEFAULT NULL,
  `destinationname` varchar(225) DEFAULT NULL,
  `schedule` varchar(225) DEFAULT NULL,
  `message` longtext DEFAULT NULL,
  `type` varchar(225) DEFAULT NULL,
  `caption` varchar(225) DEFAULT NULL,
  `status` varchar(225) DEFAULT NULL,
  `msg_fonte` mediumtext DEFAULT NULL,
  PRIMARY KEY (`id_msg`)
) ENGINE=InnoDB AUTO_INCREMENT=52 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

/*Table structure for table `ws_log` */

CREATE TABLE `ws_log` (
  `id_log` int(11) NOT NULL AUTO_INCREMENT,
  `data_hora` datetime DEFAULT current_timestamp(),
  `ip_origem` varchar(50) DEFAULT NULL,
  `metodo` varchar(10) DEFAULT NULL,
  `acao` varchar(50) DEFAULT NULL,
  `token` varchar(100) DEFAULT NULL,
  `id_cliente` int(11) DEFAULT NULL,
  `status_api` varchar(10) DEFAULT NULL,
  `mensagem_api` text DEFAULT NULL,
  `tempo_execucao` float DEFAULT NULL,
  `parametros` longtext DEFAULT NULL,
  `resposta` longtext DEFAULT NULL,
  PRIMARY KEY (`id_log`)
) ENGINE=InnoDB AUTO_INCREMENT=115 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `ws_tokens` */

CREATE TABLE `ws_tokens` (
  `id_token` int(11) NOT NULL AUTO_INCREMENT,
  `token` varchar(255) NOT NULL,
  `descricao` varchar(255) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `criado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id_token`),
  UNIQUE KEY `token` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `ws_tokens_clientes` */

CREATE TABLE `ws_tokens_clientes` (
  `id_relacao` int(11) NOT NULL AUTO_INCREMENT,
  `id_token` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `criado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id_relacao`),
  KEY `id_token` (`id_token`),
  KEY `id_cliente` (`id_cliente`),
  CONSTRAINT `ws_tokens_clientes_ibfk_1` FOREIGN KEY (`id_token`) REFERENCES `ws_tokens` (`id_token`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `ws_tokens_tipos` */

CREATE TABLE `ws_tokens_tipos` (
  `id_permissao` int(11) NOT NULL AUTO_INCREMENT,
  `id_token` int(11) NOT NULL,
  `id_cliente` int(11) NOT NULL,
  `id_tipo` int(11) NOT NULL,
  `criado_em` datetime DEFAULT NULL,
  PRIMARY KEY (`id_permissao`),
  KEY `id_token` (`id_token`),
  KEY `id_cliente` (`id_cliente`),
  KEY `id_tipo` (`id_tipo`),
  CONSTRAINT `ws_tokens_tipos_ibfk_1` FOREIGN KEY (`id_token`) REFERENCES `ws_tokens` (`id_token`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_general_ci;

/*Table structure for table `chats_atuais` */

DROP TABLE IF EXISTS `chats_atuais`;

/*!50001 CREATE TABLE  `chats_atuais`(
 `id` char(36) ,
 `protocol` int(11) ,
 `status` varchar(30) ,
 `created_at` datetime ,
 `updated_at` datetime ,
 `contact_name` varchar(100) ,
 `telephone` varchar(30) ,
 `department_name` varchar(100) 
)*/;

/*View structure for view chats_atuais */

/*!50001 DROP TABLE IF EXISTS `chats_atuais` */;
/*!50001 CREATE ALGORITHM=UNDEFINED DEFINER=`octekmys_callcenter_prod`@`172.16.0.21` SQL SECURITY DEFINER VIEW `chats_atuais` AS select `chats`.`id` AS `id`,`chats`.`protocol` AS `protocol`,`chats`.`status` AS `status`,`chats`.`created_at` AS `created_at`,`chats`.`updated_at` AS `updated_at`,`chat_contacts`.`name` AS `contact_name`,`chat_contacts`.`telephone` AS `telephone`,`chat_departments`.`name` AS `department_name` from ((`chats` join `chat_contacts` on(`chats`.`contact_id` = `chat_contacts`.`id`)) join `chat_departments` on(`chats`.`department_id` = `chat_departments`.`id`)) */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
