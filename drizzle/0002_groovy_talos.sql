ALTER TABLE "chat_messages" RENAME COLUMN "recipent_id" TO "recipient_id";--> statement-breakpoint
ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_recipent_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "is_dead" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "score_updated_at" timestamp;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;