import { Resolver, Mutation, Arg, Ctx, UseMiddleware } from "type-graphql";
import { ResReq } from "../interfaces/interfaces";
import { isAuth } from "../middleware/isAuth";
import { isCoach } from "../middleware/isCoach";
import { TeamModel } from "../entities/Team";
import { Post } from "../entities/Post";
import { ObjectID } from "mongodb";
import { isMember } from "../middleware/isMember";
import { LikesMapModel } from "../entities/LikesMap";

@Resolver()
export class PostResolver {
    // TODO isAuthor helper
    @Mutation(() => Boolean)
    @UseMiddleware(isAuth, isCoach)
    async pinPost(
        @Arg("teamID") teamID: string,
        @Arg("postID") postID: string,
        @Arg("isPined") isPined: boolean,
        @Ctx() { payload }: ResReq,
    ) {
        try {
            await TeamModel.findByIdAndUpdate(
                teamID,
                { $set: { "posts.$[element].isPined": isPined } },
                { arrayFilters: [{ "element._id": postID }] },
            );
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth, isCoach)
    async setPostPrivate(
        @Arg("teamID") teamID: string,
        @Arg("postID") postID: string,
        @Arg("isPrivate") isPrivate: boolean,
        @Ctx() { payload }: ResReq,
    ) {
        try {
            await TeamModel.findByIdAndUpdate(
                teamID,
                { $set: { "posts.$[element].isPrivate": isPrivate } },
                { arrayFilters: [{ "element._id": postID }] },
            );
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth)
    async likePost(@Arg("postID") postID: string, @Ctx() { payload }: ResReq) {
        const removed = await LikesMapModel.findOneAndRemove({ "_id.post": postID });
        if (removed) return true;
        try {
            const likesPair = new LikesMapModel({
                _id: {
                    post: postID,
                    user: payload._id,
                },
            });
            await likesPair.save();
        } catch (err) {
            console.log(err);
            return false;
        }
        return true;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth, isMember)
    async addPost(
        @Arg("teamID") teamID: string,
        @Arg("content") content: string,
        @Ctx() { payload }: ResReq,
        @Arg("isPrivate", { nullable: true }) isPrivate?: boolean,
        @Arg("imgUrls", () => [String], { nullable: true }) imgUrls?: string[],
    ) {
        const team = await TeamModel.findById(teamID);
        if (!team) return false;
        try {
            const post = new Post();
            post.content = content;
            post.user = new ObjectID(payload._id);
            if (isPrivate) {
                post.isPrivate = isPrivate;
            }
            if (imgUrls) {
                post.imgUrls = imgUrls;
            }
            team.posts.push(post);
            await team.save();
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth, isMember)
    async deletePost(@Arg("teamID") teamID: string, @Arg("postID") postID: string, @Ctx() { payload }: ResReq) {
        try {
            await TeamModel.findByIdAndUpdate(
                teamID,
                { $pull: { "posts._id": postID } },
                { arrayFilters: [{ "element._id": postID }] },
            );
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    }

    @Mutation(() => Boolean)
    @UseMiddleware(isAuth, isCoach)
    async editPost(
        @Arg("teamID") teamID: string,
        @Arg("postID") postID: string,
        @Arg("content") content: string,
        @Ctx() { payload }: ResReq,
    ) {
        try {
            await TeamModel.findByIdAndUpdate(
                teamID,
                { $set: { "posts.$[element].content": content } },
                { arrayFilters: [{ "element._id": postID }] },
            );
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    }
}