ALTER TABLE "refresh_tokens" RENAME TO "tokens";--> statement-breakpoint
ALTER TABLE "tokens" DROP CONSTRAINT "refresh_tokens_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "tokens" ADD COLUMN "type" text DEFAULT 'refresh' NOT NULL;--> statement-breakpoint
ALTER TABLE "tokens" ADD CONSTRAINT "tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;