CREATE TABLE IF NOT EXISTS `state_of_music`.`ticketmaster_events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `ticketmaster_id` VARCHAR(100) NOT NULL,
  `local_date` DATE NULL,
  `event_genre` VARCHAR(50) NULL,
  `event_subgenre` VARCHAR(50) NULL,
  `venue` VARCHAR(100) NULL,
  `venue_lat` DECIMAL(10,8) NULL,
  `venue_long` DECIMAL(11,8) NULL,
  `artist_id` VARCHAR(50) NULL,
  `artist_name` VARCHAR(100) NULL,
  `artist_genre` VARCHAR(50) NULL,
  PRIMARY KEY (`id`));

CREATE TABLE IF NOT EXISTS `state_of_music`.`eventbrite_events` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `eventbrite_id` VARCHAR(100) NOT NULL,
  `local_date` DATE NULL,
  `event_name` VARCHAR(100) NULL,
  `venue_name` VARCHAR(50) NULL,
  `venue_lat` DECIMAL(10,8) NULL,
  `venue_long` DECIMAL(11,8) NULL,
  `genre` VARCHAR(50) NULL,
  PRIMARY KEY (`id`));
