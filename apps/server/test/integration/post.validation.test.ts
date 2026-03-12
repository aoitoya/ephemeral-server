import { faker } from "@faker-js/faker";
import { describe, expect, test } from "vitest";

import {
	createCommentSchema,
	createPostSchema,
	createVoteSchema,
} from "../../src/modules/posts/post.validation.js";

describe("Post Validation Schemas", () => {
	describe("createPostSchema", () => {
		test("should validate a correct post payload", () => {
			const input = {
				content: faker.lorem.sentence(),
				topics: [faker.lorem.word(), faker.lorem.word()],
			};
			const result = createPostSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		test("should fail if content is empty", () => {
			const input = {
				content: "",
				topics: [faker.lorem.word()],
			};
			const result = createPostSchema.safeParse(input);
			expect(result.success).toBe(false);
		});
	});

	describe("createCommentSchema", () => {
		test("should validate a correct comment payload on a post", () => {
			const input = {
				content: faker.lorem.sentence(),
				postId: faker.string.uuid(),
			};
			const result = createCommentSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		test("should fail if both postId and commentId are provided", () => {
			const input = {
				commentId: faker.string.uuid(),
				content: faker.lorem.sentence(),
				postId: faker.string.uuid(),
			};
			const result = createCommentSchema.safeParse(input);
			expect(result.success).toBe(false);
		});
	});

	describe("createVoteSchema", () => {
		test("should validate a correct vote payload on a post", () => {
			const input = {
				postId: faker.string.uuid(),
				type: "upvote",
			};
			const result = createVoteSchema.safeParse(input);
			expect(result.success).toBe(true);
		});

		test("should fail if type is invalid", () => {
			const input = {
				postId: faker.string.uuid(),
				type: "invalid_vote_type",
			};
			const result = createVoteSchema.safeParse(input);
			expect(result.success).toBe(false);
		});
	});
});
