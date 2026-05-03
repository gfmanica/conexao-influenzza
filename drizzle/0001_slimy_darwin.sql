CREATE TABLE "points" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"point_type" varchar(100) NOT NULL,
	"amount" integer NOT NULL,
	"entry_date" timestamp with time zone NOT NULL,
	"created_by" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "point_entries" CASCADE;--> statement-breakpoint
ALTER TABLE "points" ADD CONSTRAINT "points_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;