ALTER TABLE "chat_messages" DROP CONSTRAINT "chat_messages_recipent_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chat_messages" ADD COLUMN "recipient_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_messages" DROP COLUMN "recipent_id";