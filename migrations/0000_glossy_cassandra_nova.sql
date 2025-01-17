CREATE TABLE `todo` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`timestamp` integer NOT NULL
);
